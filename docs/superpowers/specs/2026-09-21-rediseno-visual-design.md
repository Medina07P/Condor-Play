# Diseño: Rediseño visual de la landing — dirección "Señal en vivo"

**Fecha:** 2026-09-21
**Estado:** Aprobado por el usuario (alcance, dirección, sistema visual, estructura y este documento).

## Contexto y objetivo

La landing actual (`index.html`, un solo archivo HTML + CSS + JS vanilla) funciona pero se ve
como plantilla: orbes difuminados, cuadrícula, ruido, glassmorphism, emojis como iconos,
Bebas Neue + DM Sans + DM Mono. Además tiene defectos concretos:

- No hay `<h1>`; el logo JPEG hace de título.
- Hero con 4 botones seguidos; "Android APK" y "Android TV APK" apuntan al **mismo** archivo.
- `.price-amount` mete `3 USD / 10.000 COP` en Bebas de 3.8rem → se desborda. `75600` sin punto de miles.
- Botones "Comprar" solo muestran un toast falso ("Redirigiendo al pago…").
- `outline: none` global, sin `:focus-visible`, sin `prefers-reduced-motion`.
- Nav con fondo azulado `rgba(6,8,16)` que desentona con la paleta cálida.
- No muestra la app en ninguna parte.

**Objetivo:** rediseño visual completo conservando la marca (logo, rojo `#EC1B2E`, negro), el
contenido y las funciones. Modo Impeccable: **Persuade** (landing de marketing y descarga).

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Alcance | Rediseño visual con la misma marca. No se cambia logo, contenido factual ni funciones. |
| Dirección | **A. "Señal en vivo"**: lenguaje de interfaz de TV (número de canal, etiqueta EN VIVO, tira de canales). |
| Capturas | Se usan las 5 capturas de móvil (`captura1..5.jpeg`, 720×1600). |
| Contenido de terceros | Las capturas se usan **tal cual** (solo se recortan barras de estado y de gestos). Decisión del usuario; se le advirtió del riesgo de reclamos de marca/derechos de autor por logos (Caracol, CNN) y pósters. |
| Compra | Los botones de plan abren WhatsApp (`+57 301 451 8350`) con mensaje prellenado según el plan. Se elimina el toast falso. |
| Cifras del hero (10K+, 99.9%, 4K) | Se conservan tal cual, solo cambia su estilo. Quedan **marcadas para que el usuario confirme** que son reales. |

## Sistema visual

### Color

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#0A0708` | Fondo (negro cálido, plano; sin orbes, cuadrícula ni ruido) |
| `--surface` / `--surface-2` | `#151011` / `#1E1618` | Superficies y tarjetas |
| `--text` | `#F2ECE8` | Texto principal (hueso) |
| `--muted` | `#A29396` | Texto secundario (ceniza) |
| `--red` | `#EC1B2E` | Único acento de marca: CTA, EN VIVO, plan destacado |
| `--red-soft` | `#FF5A6E` | Solo texto rojo pequeño (contraste sobre `--bg`) |
| `--line` | `rgba(242,236,232,.10)` | Bordes y divisores |

Los tokens heredados (`--cyan`, `--purple`, `--pink`, `--cyan-dim`, `--glass`, `--glow`) se
renombran a los de la tabla. Como se reescriben **todos** sus usos, es seguro; la nota
correspondiente de `CLAUDE.md` se actualiza.

Color por sección de la app (solo indicador de pestaña activa y viñetas en "Funciones"; nunca
como acento general de la página):

| Sección | Color aproximado (tomado de la app) |
|---|---|
| TV en vivo | rojo `#EC1B2E` |
| Películas | naranja `#FF9A1F` |
| Series | magenta `#D946EF` |
| Anime | cian `#14B8C8` |
| Mi cuenta | azul `#3B82F6` |

Todo texto pequeño con estos colores se verifica contra `--bg`/`--surface` (≥ 4.5:1); si
no cumple, se usa una variante más clara solo para el texto.

### Tipografía

| Rol | Familia | Uso |
|---|---|---|
| Display | **Archivo** (variable, eje `wdth` 125, peso 800) | Títulos; cercana al wordmark ancho y cuadrado del logo |
| Cuerpo | **Instrument Sans** | Texto corrido, botones, navegación |
| Utilidad | **JetBrains Mono** | Números de canal, versiones, etiquetas EN VIVO, precios en COP |

Se mantiene la carga por Google Fonts (`preconnect` + `display=swap`), como hoy. Escala fluida
con `clamp()`; el `<h1>` es la pieza tipográfica más grande de la página.

### Firma: el banner de canal en el hero

Un teléfono (marco vertical, no TV: las capturas son de móvil) ocupa la columna derecha del
hero. Rota entre 4 pantallas reales de la app (`captura1` TV en vivo → `captura2` Películas →
`captura3` Series → `captura4` Anime), con un banner superpuesto estilo TV:

`CH 01 · ● EN VIVO` → `CH 02 · PELÍCULAS` → `CH 03 · SERIES` → `CH 04 · ANIME`

- Cambio cada ~3.5 s con crossfade; se pausa con la pestaña oculta.
- Con `prefers-reduced-motion: reduce`: queda fija en la primera pantalla, sin rotación.
- El banner es decorativo (`aria-hidden`); las imágenes llevan `alt` descriptivo.
- Es la **única** pieza expresiva de la página; el resto es sobrio a propósito.

## Estructura de secciones

1. **Nav** — logo (marca sola), enlaces Características / ¿Cómo funciona? / Planes, CTA
   "Descargar". Menú móvil con `aria-expanded` y cierre con Escape.
2. **Hero** — `<h1>` real ("Tu TV en vivo, sin límites." como propuesta), subtítulo con el copy
   actual, un botón primario "Descargar para Android" (cubre Android y Android TV: mismo APK) y
   uno secundario "Windows". Fila de plataformas con iconos SVG. Datos (10K+, 99.9%, 4K,
   versión) en mono. Columna derecha: teléfono con la firma.
3. **Tira de canales** — reemplaza el marquee de emojis. Categorías reales de la app con número:
   `042 Colombia · 043 Noticias · …`. Sin emojis; con movimiento reducido queda estática.
4. **Características** — selector por pestañas (patrón ARIA `tablist`, navegación con flechas):
   TV en vivo / Películas / Series / Anime / Mi cuenta. Cada pestaña muestra su captura y 2–3
   puntos derivados de las funciones reales (copy existente + lo visible en la captura: favoritos,
   etiqueta LAT, suscripción activa, dispositivo activo, interfaz Automático/TV/Móvil, soporte
   por WhatsApp). Debajo, las 6 características actuales en lista compacta con iconos SVG.
5. **Instalación** — 3 pasos en línea de tiempo (secuencia real → numeración justificada), sin
   círculos con brillo.
6. **Planes** — 3 tarjetas, trimestral destacada. USD grande; COP secundario en mono; miles con
   punto (`75.600`); precios y ahorros exactamente como en el contenido actual. Botón
   "Comprar …" → `https://wa.me/573014518350?text=<mensaje codificado con el plan>`.
7. **Descarga** — tarjetas Android/Android TV y Windows con versión, peso y requisitos. Detección
   de plataforma (`navigator.userAgent`) como mejora progresiva: resalta la tarjeta del
   visitante con "Recomendado para tu dispositivo"; nunca oculta la otra.
8. **Footer** — más simple; añade contacto por WhatsApp; conserva enlaces a GitHub/Releases/Issues.

## Restricciones técnicas

- **Un solo `index.html`** con HTML + CSS + JS vanilla, sin build ni dependencias (se mantiene).
  Nuevo: carpeta `assets/` con imágenes procesadas.
- **Versionado intacto.** `update-version.ps1` y el workflow detectan la versión con estas
  expresiones sobre `index.html`; el rediseño debe conservarlas:
  - `releases/download/v(\d+\.\d+\.\d+tv)/app-release\.apk`
  - `releases/download/v(\d+\.\d+\.\d+)/condorplay-`
  - Los textos visibles de versión son la cadena exacta de la versión vigente (a 2026-09-21:
    `1.3.49` y `3.10.4`; cambian con cada release, así que la implementación las lee de
    `index.html` al momento de escribir) para que el reemplazo global funcione. No introducir
    esas cadenas en otro contexto (CSS, JS, comentarios).
  - Se reduce la duplicación de hrefs (hoy 6 → los botones que apunten al mismo archivo se
    unifican) pero **siempre queda al menos una URL de cada patrón**.
- **Cloudflare Pages** sirve todo el repo tal cual; `_redirects` no se toca en este trabajo.
- **Contenido en español** (público colombiano), con tildes correctas.

## Pipeline de imágenes (ffmpeg, disponible en la máquina)

- Capturas: recorte de ≈56 px arriba (barra de estado) y ≈32 px abajo (barra de gestos),
  verificado visualmente; salida WebP 720 px de ancho, calidad ≈80, en `assets/`.
  Se declaran `width`/`height` para evitar saltos de layout; `loading="lazy"` salvo el hero.
- Logo: `logo.jpeg` tiene fondo negro y hoy depende de `mix-blend-mode: lighten`. Se generan
  variantes (marca sola para nav/footer, versión completa para el hero si aplica) sobre fondo
  transparente en WebP/PNG, eliminando el truco de blend.
- Originales `captura*.jpeg`: se añaden a `.gitignore` para que no se publiquen (incluyen
  barra de estado y modelo del dispositivo). Los archivos siguen en su lugar.

## Accesibilidad y rendimiento (piso de calidad)

- `:focus-visible` visible en todo elemento interactivo; se elimina `outline: none`.
- `prefers-reduced-motion`: sin rotación del hero, sin `reveal`, tira estática.
- Contraste ≥ 4.5:1 para texto normal (botones rojos: se verifica texto negro vs. blanco sobre
  `#EC1B2E`, ambos rondan 4.4–4.8:1, y se elige el que cumpla).
- Un solo `<h1>`, jerarquía de encabezados, `alt` en imágenes, `lang="es"`, objetivos táctiles ≥ 44 px.
- Iconos como SVG inline (sprite con `<symbol>`); cero emojis.
- Responsive verificado a 390, 768 y 1280 px; sin scroll horizontal.

## Verificación (sin framework de tests: es un sitio estático)

1. Render en Chrome a 390 / 768 / 1280 px (capturas y revisión visual, una ronda completa y, a lo
   sumo, una de corrección).
2. Navegación solo con teclado (menú, pestañas, botones) y emulación de `prefers-reduced-motion`.
3. Detector de Impeccable (`detect.mjs`) una sola vez al terminar.
4. **Prueba de versionado:** en una copia temporal, ejecutar
   `.\update-version.ps1 -Android 9.9.9tv -Windows 9.9.9` y confirmar que reemplaza en
   `index.html` las URLs y los textos visibles; luego descartar la copia.
5. Comprobar que el enlace de WhatsApp de cada plan codifica bien las tildes y el mensaje.

## Fuera de alcance / pendientes para el usuario

- **Versiones (verificado 2026-09-21, tras el pull del usuario):** `index.html`, `_redirects` y
  `README.md` coinciden en Android v1.3.49tv y Windows v3.10.4; el pull solo cambió versiones,
  no el contenido de `index.html`. No hay nada que corregir aquí.
- **Cifras sin verificar:** "10K+ usuarios", "99.9% uptime" (y "4K") se conservan pero deben
  confirmarse; son afirmaciones factuales.
- **Sin capturas de Android TV ni Windows:** el hero usa el teléfono; cuando existan, se pueden
  añadir marcos de TV/escritorio.
- **Pago:** solo hay flujo por WhatsApp; no se integra pasarela de pago.
- **Contenido de terceros** en las capturas (ver "Decisiones tomadas").
- `docs/superpowers/plans/` (plan del workflow anterior) sigue sin versionar; no se toca.
