# CLAUDE.md

## Qué es este proyecto

Landing page estática de **Cóndor Play**, un servicio IPTV propio (canales en vivo, películas y series). La página es la cara pública del servicio: presenta características, planes de suscripción y los botones de descarga de la app para Android/Android TV y Windows.

> El proyecto se llamaba antes "MyConnect IPTV" — si aparece alguna referencia a `myconnect`, es un resto del nombre viejo y debe cambiarse a Cóndor Play.

## Estructura

| Archivo | Rol |
|---|---|
| `index.html` | Todo el sitio: HTML + CSS + JS vanilla en un solo archivo, sin build ni dependencias |
| `logo.jpeg` | Logo oficial (cóndor rojo/negro dentro de un televisor) |
| `_redirects` | Redirects de Cloudflare Pages: `/descargar` (APK Android) y `/descargar-windows` (EXE) |
| `README.md` | Página del repo en GitHub, orientada al usuario final (instalación, planes, soporte) |
| `update-version.ps1` | Script para actualizar la versión en todos los archivos de una vez |
| `.github/workflows/update-version.yml` | Workflow: actualiza la versión al publicar un release (o con botón manual en Actions) |

## Hosting y despliegue

- **Cloudflare Pages**, conectado a la rama `main`: cada push despliega automáticamente.
- El archivo `_redirects` es interpretado por Cloudflare Pages (formato Netlify).

## Versionado (importante)

Los binarios se publican como releases en el repo **`Medina07P/Condor-Play`**, con **dos líneas de versión independientes en el mismo repo**:

| Plataforma | Formato de tag | Asset | Ejemplo |
|---|---|---|---|
| Android / Android TV | `vX.Y.ZZtv` | `app-release.apk` | `v1.3.41tv` |
| Windows | `vX.Y.Z` | `condorplay-X.Y.Z.exe` | `v3.7.0` |

⚠️ Por esto **no** se puede usar `releases/latest/download/...`: el "latest" puede ser de cualquiera de las dos plataformas. Los links siempre llevan el tag explícito.

⚠️ El repo `Medina07P/Condor-Play` debe ser **público** para que los links de descarga funcionen; si un link devuelve 404 con `curl -I`, revisar primero la visibilidad del repo.

La versión aparece hardcodeada en ~10 lugares (hrefs de descarga, badge del hero, version-tags, hero-meta, badges y links del README, `_redirects`). **Nunca actualizarla a mano.** Hay tres formas, en orden de preferencia:

1. **Automático (flujo normal):** publicar el release en GitHub (`Medina07P/Condor-Play`) con tag `vX.Y.Ztv` (Android) o `vX.Y.Z` (Windows) y el asset correspondiente (`app-release.apk` / `condorplay-X.Y.Z.exe`). El workflow `.github/workflows/update-version.yml` detecta el tag, actualiza los archivos, hace commit y Cloudflare Pages redespliega. Los pre-releases y tags con otro formato se ignoran; si falta el asset esperado, el workflow falla a propósito.
2. **Botón manual:** GitHub → Actions → "Actualizar versión" → Run workflow, llenando los campos `android` y/o `windows`.
3. **Script local (respaldo):**

```powershell
.\update-version.ps1 -Android 1.3.42tv          # solo Android
.\update-version.ps1 -Windows 3.8.0             # solo Windows
.\update-version.ps1 -Android 1.3.42tv -Windows 3.8.0
```

Tras el script local: `git add index.html README.md _redirects; git commit; git push`.

## Ecosistema Cóndor Play

Este repo es solo la landing. El servicio completo tiene tres piezas (notas en Obsidian):

| Proyecto | Qué es | Notas |
|---|---|---|
| **KOTLINAPP** | App nativa Android TV/móvil (Kotlin 2.x, Jetpack Compose for TV, Media3/ExoPlayer, Firebase Auth + Firestore, TMDB). Genera los releases `vX.Y.ZZtv` | `D:\Documentos\PROGRAMACION\Workspace\ObsidianVault\01_Projects\KOTLINAPP\` |
| **iptv_player_web** | Panel admin SPA (JS vanilla + Firebase) para gestionar clientes, suscripciones y listas M3U. Desplegado en GitHub Pages | `D:\Documentos\PROGRAMACION\Workspace\ObsidianVault\01_Projects\iptv_player_web\` |
| **condor_play** (este repo) | Landing page de marketing y descarga | — |

## Convenciones

- Todo el contenido del sitio y el README están en **español** (público colombiano; precios en USD y COP).
- Los nombres de variables CSS heredan nombres viejos (`--cyan` es en realidad el rojo `#ec1b2e` de la marca) — no renombrar sin ajustar todos los usos.
- Contacto/ventas por WhatsApp: +57 301 451 8350.
