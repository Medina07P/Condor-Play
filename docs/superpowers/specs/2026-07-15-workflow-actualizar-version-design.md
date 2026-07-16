# Diseño: Workflow "Actualizar versión" (GitHub Actions)

**Fecha:** 2026-07-15
**Estado:** Aprobado por el usuario (enfoque A + B: automático al publicar release + botón manual)

## Contexto

La landing de Cóndor Play muestra la versión y los links de descarga en ~10 lugares
(`index.html`, `README.md`, `_redirects`). Ya existe `update-version.ps1`, que actualiza
todo con un comando, pero el usuario quiere eliminar la consola del flujo: la interfaz
gráfica será el propio formulario de releases de GitHub (que ya usa hoy) más un botón
manual en la pestaña Actions.

Dato clave: los releases (APK/EXE) se publican **en el mismo repo** que la landing
(`Medina07P/Condor-Play`), así que un workflow del repo puede reaccionar al evento
`release` directamente, sin tokens entre repos.

## Componente nuevo

`.github/workflows/update-version.yml` — único archivo nuevo. Reutiliza
`update-version.ps1` vía `pwsh` (PowerShell 7 en runner `ubuntu-latest`); la lógica de
reemplazo no se duplica: local y CI se comportan idéntico.

## Disparadores

### 1. `release: types: [published]` (automático)

Al publicar un release, el workflow lee `github.event.release.tag_name`:

| Tag | Interpretación |
|---|---|
| `v1.2.3tv` (regex `^v\d+\.\d+\.\d+tv$`) | Versión Android |
| `v1.2.3` (regex `^v\d+\.\d+\.\d+$`) | Versión Windows |
| Cualquier otro formato | Se ignora con aviso en el summary, el job termina en éxito |
| Pre-release (`prerelease: true`) | Se ignora con aviso — solo los releases completos actualizan la página |

### 2. `workflow_dispatch` (botón manual)

Inputs opcionales de texto: `android` (ej. `1.3.42tv`) y `windows` (ej. `3.8.0`).
Ambos vacíos → el job falla con mensaje claro. La validación de formato la hace el
propio `update-version.ps1` (aborta con error descriptivo si no cumple el patrón).

## Pasos del job

1. **Checkout de `main` explícito** (`ref: main`) — el evento release apunta al commit
   del tag, no a la punta de main.
2. **Verificar el asset del release** (solo en trigger `release`): consultar los assets
   del release con `gh api`; si es Android debe existir `app-release.apk`, si es Windows
   debe existir `condorplay-<versión>.exe`. Si falta → **fallar** con mensaje claro
   (evita publicar links rotos en la página).
3. **Ejecutar el script**: `pwsh ./update-version.ps1 -Android X` y/o `-Windows Y`
   según lo detectado/ingresado.
4. **Commit y push** (solo si hay cambios): identidad `github-actions[bot]`, mensaje
   `chore: actualiza versión Android a vX.Y.Ztv` (o Windows, o ambos). Antes del push,
   `git pull --rebase origin main` por si main avanzó durante el job.
5. **Resumen de ejecución** (`GITHUB_STEP_SUMMARY`): versión anterior → nueva por
   plataforma, archivos modificados, y si hubo commit o no (idempotente).
6. **Aviso de repo privado**: consultar `gh api repos/{repo} --jq .private`; si es
   `true`, añadir advertencia destacada al summary: "el repo es privado, los links de
   descarga devuelven 404 al público".

## Detalles técnicos

- `permissions: contents: write` a nivel de workflow (suficiente para el push; sin PATs).
- `concurrency: group: update-version, cancel-in-progress: false` — si se publican dos
  releases seguidos (Android y Windows el mismo día), los jobs se encolan y no se pisan.
- Los commits hechos con `GITHUB_TOKEN` no disparan otros workflows → sin bucles.
  Cloudflare Pages sí detecta el push (usa su propia GitHub App) y redespliega.
- El paso de asset usa `gh` (preinstalado en runners) con `GITHUB_TOKEN`.
- Runner `ubuntu-latest`: `pwsh` está preinstalado; `update-version.ps1` es compatible
  (usa .NET estándar: `File.ReadAllText/WriteAllText`, regex, sin nada específico de
  Windows).

## Casos borde

| Caso | Comportamiento |
|---|---|
| Tag con formato inesperado (`v2.0-beta`, `test`) | Aviso en summary, job en verde, sin cambios |
| Pre-release publicado | Aviso en summary, job en verde, sin cambios |
| Release sin el asset esperado | Job falla con mensaje "falta app-release.apk / condorplay-X.exe" |
| Versión publicada == versión actual | Script termina "Sin cambios", no hay commit, job en verde |
| Botón manual sin ningún campo | Job falla con mensaje de uso |
| main avanzó durante el job | `pull --rebase` antes del push |
| Repo privado | Advertencia en summary (no falla: puede que el usuario lo haga público después) |

## Cambios en archivos existentes

- `CLAUDE.md`: documentar el flujo nuevo (publicar release = automático; botón en
  Actions y `update-version.ps1` local como respaldos) y el archivo del workflow.
- `update-version.ps1`: sin cambios de lógica; solo si la prueba en pwsh/Linux revela
  alguna incompatibilidad menor.

## Verificación

1. **Local**: ejecutar el script con `pwsh` (si está instalado) para confirmar compatibilidad PowerShell 7.
2. **Push** del workflow y prueba del **botón manual** con las versiones actuales
   (`1.3.41tv` / `3.7.0`) → job en verde, summary "sin cambios", sin commit.
3. Botón manual con versión ficticia (`9.9.9`) → commit del bot con los reemplazos →
   verificar redeploy de Cloudflare → botón manual de vuelta a `3.7.0` para revertir.
4. **Prueba real del trigger automático**: publicar un release de prueba con tag de
   formato no reconocido (`vtest`) → job en verde sin cambios; y confirmar con el
   siguiente release real de la app.
