# Rediseño visual "Señal en vivo" — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescribir la parte visual de `index.html` (dirección "Señal en vivo") conservando marca, contenido y funciones, y sumando capturas reales de la app, planes con WhatsApp y accesibilidad de base.

**Architecture:** Sigue siendo un único `index.html` (HTML + CSS + JS vanilla, sin build). La reescritura es incremental: la Tarea 3 crea el esqueleto (tokens, base, nav, footer, sprite SVG, JS núcleo) con **marcadores** (`<!-- @section:x -->`, `/* @css:x */`, `/* @js:x */`) y cada tarea posterior reemplaza sus marcadores con su sección. Un script Node sin dependencias (`tests/check-site.mjs`) hace de "test": se escribe primero (rojo) y cada tarea lo pone en verde por grupos. Las imágenes se generan con ffmpeg a `assets/`.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, `clamp()`, `font-stretch`), JS vanilla (ES2020), Google Fonts (Archivo, Instrument Sans, JetBrains Mono), ffmpeg (libwebp), Node 24 (solo para el script de verificación), Python 3 (servidor estático para la revisión visual).

Spec de referencia: `docs/superpowers/specs/2026-09-21-rediseno-visual-design.md`.

## Desviaciones aprobadas (posteriores a este documento)

Tras completar las Tareas 1-8, un hallazgo del hook de diseño de Impeccable llevó a
preguntarle al usuario por 4 puntos concretos del plan original. Estas decisiones
**reemplazan** el texto correspondiente más abajo (Tarea 4 y la firma en "Sistema
visual" del spec); si este plan se re-ejecutara tal cual, reintroduciría las tres
primeras:

1. **`.phone-body`**: sombra neutra de elevación (`rgba(0,0,0,.65)`) en vez del
   resplandor rojo `rgba(236,27,46,.30)` que describen la Tarea 4 y el spec.
2. **Barra lateral roja ("side-tab")**: solo en `.osd` (el banner de canal, la
   firma). Se quitó de `.hero-status`. El plan original la ponía en ambos.
3. **Tira de canales**: estática, con una sola lista y scroll manual
   (`overflow-x: auto`, `tabindex="0"`), **sin** animación automática ni copia
   duplicada para el bucle. El plan original (Tarea 4) especificaba un marquee
   con `animation: strip 48s linear infinite` y 2 listas — eso ya no existe.
4. **Instrument Sans** se confirmó como decisión intencional (no es una desviación
   de contenido, pero quedó registrada como excepción en `.impeccable/config.json`
   junto con la barra lateral del punto 2).

Ambas excepciones de diseño quedan documentadas en `.impeccable/config.json`
(`detector.ignoreValues`).

## Global Constraints

Cada tarea las cumple implícitamente.

- **Un solo `index.html`**, HTML + CSS + JS vanilla, sin build ni dependencias. Imágenes en `assets/`.
- **Marca fija:** logo, rojo `#EC1B2E`, negro. Contenido en **español** (público colombiano), con tildes correctas.
- **Tokens:** `--bg:#0A0708`, `--surface:#151011`, `--surface-2:#1E1618`, `--text:#F2ECE8`, `--muted:#A29396`, `--red:#EC1B2E`, `--red-soft:#FF5A6E`, `--line:rgba(242,236,232,.10)`. Los tokens heredados (`--cyan`, `--purple`, `--pink`, `--cyan-dim`, `--glass`, `--glow`) **no** deben existir.
- **Tipografía:** Archivo (display, `font-stretch` ancho, peso 800), Instrument Sans (cuerpo), JetBrains Mono (utilidad). Prohibidos Bebas Neue, DM Sans, DM Mono.
- **Sin orbes, cuadrícula ni ruido; sin emojis** (todo icono es SVG inline); sin `mix-blend-mode`.
- **Rojo = único acento de marca.** Los colores por sección de la app (naranja `#FF9A1F`, magenta `#D946EF`, cian `#14B8C8`, azul `#3B82F6`) solo en indicador de pestaña y viñetas de "Características".
- **Versionado intacto:** `index.html` conserva `releases/download/v(\d+\.\d+\.\d+tv)/app-release\.apk` y `releases/download/v(\d+\.\d+\.\d+)/condorplay-`; los textos visibles son exactamente `Android v<X.Y.Z>` y `Windows v<X.Y.Z>` (Android sin el sufijo `tv`); esas cadenas **nunca** aparecen en CSS/JS. Versiones vigentes a 2026-09-21: Android `1.3.49tv`, Windows `3.10.4`. `update-version.ps1`, el workflow, `_redirects` y `README.md` **no se modifican**.
- **Compra por WhatsApp:** `https://wa.me/573014518350?text=<mensaje codificado>`; sin toast falso.
- **Cifras del hero** (10K+, 99.9%, 4K) y precios/ahorros: se conservan tal cual (el usuario debe confirmar las cifras).
- **Capturas tal cual** (decisión del usuario): solo se recortan barras de estado y de gestos.
- **Accesibilidad:** `:focus-visible` visible (nunca `outline: none`), `prefers-reduced-motion`, `[hidden]` efectivo, un solo `<h1>`, `alt`/`width`/`height` en toda imagen, objetivos táctiles ≥ 44 px, contraste ≥ 4.5:1 en texto normal.
- **Commits** con la línea final `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. **No hacer push a `main`** (despliega Cloudflare Pages); se trabaja en la rama `rediseno-visual`.

---

## Estructura de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `tests/check-site.mjs` | Crear | Verificaciones estáticas por grupos (`assets`, `foundation`, `hero`, `features`, `steps`, `plans`, `download`, `a11y`, `versioning`, `final`) |
| `assets/app-{tv,peliculas,series,anime,cuenta}.webp` | Crear | Capturas recortadas 720×1512 |
| `assets/logo-mark.webp` | Crear | Emblema del logo sin fondo, 240×174 |
| `.gitignore` | Crear | Excluye `captura*.jpeg` (originales) |
| `index.html` | Reescribir (incremental) | Todo el sitio |
| `CLAUDE.md` | Modificar | Tabla de estructura y nota de tokens |

`logo.jpeg`, `_redirects`, `README.md`, `update-version.ps1` y `.github/` no se tocan.

---

### Task 1: Rama y script de verificación (rojo)

**Files:**
- Create: `tests/check-site.mjs`

**Interfaces:**
- Produces: `node tests/check-site.mjs [grupo…]` (exit 0 si todo pasa, 1 si algo falla); variable de entorno `SITE_ROOT` para apuntar a otra copia del sitio. Grupos: `assets`, `foundation`, `hero`, `features`, `steps`, `plans`, `download`, `a11y`, `versioning`, `final`.

- [ ] **Step 1: Crear la rama**

Run (Git Bash):
```bash
cd "D:/Documentos/PROGRAMACION/condor_play" && git switch -c rediseno-visual && git branch --show-current
```
Expected: `rediseno-visual`

- [ ] **Step 2: Crear `tests/check-site.mjs`**

```js
#!/usr/bin/env node
// Verificaciones estáticas de index.html, sin dependencias.
//   node tests/check-site.mjs                → todos los grupos
//   node tests/check-site.mjs hero plans     → solo esos grupos
//   SITE_ROOT=<carpeta> node tests/check-site.mjs versioning   → sobre otra copia del sitio
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = process.env.SITE_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const html = existsSync(join(root, 'index.html')) ? read('index.html') : '';

const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
const script = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
const body = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');

const tags = (name, s = body) => [...s.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
const hasAttr = (tag, name) => new RegExp(`\\s${name}(?=[\\s=>/])`).test(tag);
const section = (id) => (html.match(new RegExp(`<section[^>]*\\bid="${id}"[\\s\\S]*?</section>`)) || [''])[0];
const text = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const count = (re, s = html) => (s.match(re) || []).length;

const groups = {};
const check = (group, name, fn) => { (groups[group] ||= []).push({ name, fn }); };
const ok = (cond, msg) => { if (!cond) throw new Error(msg || 'no se cumple'); };

const APK = /releases\/download\/v(\d+\.\d+\.\d+)tv\/app-release\.apk/g;
const EXE = /releases\/download\/v(\d+\.\d+\.\d+)\/condorplay-(\d+\.\d+\.\d+)\.exe/g;

/* ── assets ─────────────────────────────────────────────── */
for (const f of ['app-tv', 'app-peliculas', 'app-series', 'app-anime', 'app-cuenta', 'logo-mark']) {
  check('assets', `assets/${f}.webp existe (5–250 KB)`, () => {
    const p = join(root, 'assets', `${f}.webp`);
    ok(existsSync(p), 'no existe');
    const size = statSync(p).size;
    ok(size > 5000 && size < 250000, `pesa ${size} B`);
  });
}
check('assets', '.gitignore excluye las capturas originales', () => {
  ok(existsSync(join(root, '.gitignore')), 'no existe .gitignore');
  ok(/^captura\*\.jpeg\s*$/m.test(read('.gitignore')), 'falta la línea captura*.jpeg');
});
check('assets', 'toda referencia a assets/ en index.html existe', () => {
  for (const m of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) ok(existsSync(join(root, m[1])), `falta ${m[1]}`);
});

/* ── foundation ─────────────────────────────────────────── */
check('foundation', '<html lang="es">', () => ok(/<html[^>]*\blang="es"/.test(html)));
check('foundation', 'carga Archivo, Instrument Sans y JetBrains Mono', () => {
  const link = (html.match(/<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/) || [''])[0];
  for (const f of ['Archivo', 'Instrument+Sans', 'JetBrains+Mono']) ok(link.includes(f), `falta ${f}`);
});
const tokens = { '--bg': '#0A0708', '--surface': '#151011', '--surface-2': '#1E1618', '--text': '#F2ECE8', '--muted': '#A29396', '--red': '#EC1B2E', '--red-soft': '#FF5A6E' };
for (const [name, hex] of Object.entries(tokens)) {
  check('foundation', `token ${name}: ${hex}`, () => ok(new RegExp(`${name}\\s*:\\s*${hex}`, 'i').test(styles), 'no definido'));
}
check('foundation', 'sin tokens, fuentes ni efectos heredados', () => {
  ok(!/--(cyan|purple|pink|glass|glow)\b/.test(styles), 'quedan tokens heredados');
  ok(!/Bebas|DM Sans|DM Mono/.test(html), 'quedan fuentes viejas');
  ok(!/mix-blend-mode/.test(styles), 'queda mix-blend-mode');
  ok(!/\.orb\b/.test(styles), 'quedan orbes');
  ok(!/feTurbulence/.test(html), 'queda el ruido SVG');
});
check('foundation', 'sin emojis (todo icono es SVG)', () => ok(!/[\p{Emoji_Presentation}\uFE0F]/u.test(html), 'hay emojis'));
check('foundation', 'foco visible, movimiento reducido y [hidden] efectivo', () => {
  ok(!/outline\s*:\s*none/.test(styles), 'hay outline: none');
  ok(/:focus-visible/.test(styles), 'falta :focus-visible');
  ok(/prefers-reduced-motion:\s*reduce/.test(styles), 'falta prefers-reduced-motion');
  ok(/\[hidden\]/.test(styles), 'falta regla [hidden]');
});
check('foundation', 'usa font-stretch para el display ancho', () => ok(/font-stretch/.test(styles)));
check('foundation', 'nav accesible: skip-link, main, toggle con aria y menú móvil oculto', () => {
  ok(/class="skip-link"\s+href="#main-content"/.test(html), 'falta skip-link');
  ok(/<main\s+id="main-content"/.test(html), 'falta <main id="main-content">');
  const toggle = tags('button').find((t) => attr(t, 'id') === 'nav-toggle');
  ok(toggle, 'falta #nav-toggle');
  ok(attr(toggle, 'aria-expanded') === 'false' && attr(toggle, 'aria-controls') === 'mobile-menu', 'toggle sin aria-expanded/aria-controls');
  const menu = tags('nav').find((t) => attr(t, 'id') === 'mobile-menu');
  ok(menu && hasAttr(menu, 'hidden'), 'falta #mobile-menu con hidden');
});
check('foundation', 'sprite SVG con todos los iconos', () => {
  for (const id of ['menu', 'close', 'zap', 'tv', 'shield', 'film', 'layout', 'refresh', 'download', 'check', 'phone', 'windows', 'chat', 'github']) {
    ok(html.includes(`id="i-${id}"`), `falta el símbolo i-${id}`);
  }
});
check('foundation', 'footer con contacto por WhatsApp', () => ok(html.includes('https://wa.me/573014518350"')));
check('foundation', 'JS inline con sintaxis válida y CSS con llaves balanceadas', () => {
  new vm.Script(script);
  ok(count(/{/g, styles) === count(/}/g, styles), 'llaves de CSS desbalanceadas');
});

/* ── hero ───────────────────────────────────────────────── */
const heroSec = () => section('hero');
const shots = () => (html.match(/<div class="phone-screen" id="phone-screen">([\s\S]*?)<\/div>/) || ['', ''])[1];
check('hero', 'un <h1 id="hero-title"> que dice "en vivo"', () => {
  const m = heroSec().match(/<h1[^>]*id="hero-title"[^>]*>([\s\S]*?)<\/h1>/);
  ok(m, 'no hay h1#hero-title');
  ok(/en vivo/i.test(text(m[1])), 'el h1 no dice "en vivo"');
});
check('hero', 'exactamente 2 descargas en el hero: Android y Windows', () => {
  const links = tags('a', heroSec()).filter((t) => hasAttr(t, 'download'));
  ok(links.length === 2, `hay ${links.length}`);
  ok(attr(links[0], 'data-platform') === 'android' && /app-release\.apk$/.test(attr(links[0], 'href')), 'el primero debe ser el APK de Android');
  ok(attr(links[1], 'data-platform') === 'windows' && /condorplay-[\d.]+\.exe$/.test(attr(links[1], 'href')), 'el segundo debe ser el EXE de Windows');
});
check('hero', 'conserva estado "Ya disponible" y las cifras del hero', () => {
  const t = text(heroSec());
  for (const s of ['Ya disponible', '10K+', '99.9%', '4K', 'Usuarios activos', 'Uptime', 'Última versión']) ok(t.includes(s), `falta "${s}"`);
});
check('hero', 'teléfono con 4 capturas (alt, dimensiones, foco de carga y aria-hidden)', () => {
  const imgs = tags('img', shots());
  ok(imgs.length === 4, `hay ${imgs.length} imágenes`);
  ['tv', 'peliculas', 'series', 'anime'].forEach((n, i) => {
    ok(attr(imgs[i], 'src') === `assets/app-${n}.webp`, `la imagen ${i + 1} debe ser app-${n}.webp`);
    ok((attr(imgs[i], 'alt') || '').length >= 10, `la imagen ${i + 1} no tiene alt descriptivo`);
    ok(attr(imgs[i], 'width') === '720' && attr(imgs[i], 'height') === '1512', `la imagen ${i + 1} sin width/height 720x1512`);
    if (i === 0) ok(!hasAttr(imgs[i], 'aria-hidden') && attr(imgs[i], 'fetchpriority') === 'high', 'la primera: sin aria-hidden y con fetchpriority=high');
    else ok(attr(imgs[i], 'aria-hidden') === 'true', `la imagen ${i + 1} debe tener aria-hidden="true"`);
  });
});
check('hero', 'banner de canal decorativo con las 4 escenas', () => {
  const osd = tags('div').find((t) => attr(t, 'id') === 'osd');
  ok(osd && attr(osd, 'aria-hidden') === 'true', 'falta #osd con aria-hidden');
  for (const s of ['EN VIVO', 'PELÍCULAS', 'SERIES', 'ANIME', 'CH 01', 'CH 04']) ok(script.includes(s), `el JS no incluye "${s}"`);
  ok(/matches/.test(script) && /visibilitychange/.test(script), 'la rotación debe respetar movimiento reducido y pausarse con la pestaña oculta');
});
check('hero', 'tira de canales: 2 listas, la copia oculta a lectores, sin emojis', () => {
  const strip = (html.match(/<div class="strip">[\s\S]*?<\/div>\s*<\/div>/) || [''])[0];
  const lists = tags('ul', strip);
  ok(lists.length === 2, `hay ${lists.length} listas`);
  ok(attr(lists[1], 'aria-hidden') === 'true', 'la copia debe tener aria-hidden');
  ok(/Colombia/.test(strip) && /Noticias/.test(strip), 'faltan categorías reales de la app');
  ok(/@keyframes strip/.test(styles), 'falta la animación de la tira');
});

/* ── features ───────────────────────────────────────────── */
const featSec = () => section('features');
check('features', 'pestañas ARIA: 5 tabs, 1 seleccionada, cada una con su panel', () => {
  const sec = featSec();
  const tabs = tags('button', sec).filter((t) => attr(t, 'role') === 'tab');
  ok(tabs.length === 5, `hay ${tabs.length} pestañas`);
  ok(tabs.filter((t) => attr(t, 'aria-selected') === 'true').length === 1, 'debe haber exactamente 1 pestaña seleccionada');
  const panels = tags('div', sec).filter((t) => attr(t, 'role') === 'tabpanel');
  ok(panels.length === 5, `hay ${panels.length} paneles`);
  ok(panels.filter((t) => hasAttr(t, 'hidden')).length === 4, 'debe haber 4 paneles ocultos');
  for (const tab of tabs) ok(panels.some((p) => attr(p, 'id') === attr(tab, 'aria-controls') && attr(p, 'aria-labelledby') === attr(tab, 'id')), `el tab ${attr(tab, 'id')} no enlaza con su panel`);
});
check('features', 'cada panel muestra su captura (alt, width, height)', () => {
  const imgs = tags('img', featSec());
  ok(imgs.length === 5, `hay ${imgs.length} imágenes`);
  for (const img of imgs) ok((attr(img, 'alt') || '').length >= 10 && attr(img, 'width') === '720' && attr(img, 'height') === '1512', `imagen incompleta: ${attr(img, 'src')}`);
});
check('features', 'teclado: flechas, Inicio y Fin', () => {
  for (const k of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) ok(script.includes(k), `falta ${k}`);
});
check('features', 'lista de 6 características con copy original', () => {
  const list = (featSec().match(/<ul class="feature-list">[\s\S]*?<\/ul>/) || [''])[0];
  ok(count(/<li\b/g, list) === 6, 'debe tener 6 elementos');
  for (const s of ['HLS, MPEG-TS', 'control remoto en Android TV', 'failover de streams', 'seek, velocidad', 'animaciones fluidas', 'publicadas en GitHub']) ok(list.includes(s), `falta el copy "${s}"`);
});

/* ── steps ──────────────────────────────────────────────── */
check('steps', '3 pasos en lista ordenada con el copy original', () => {
  const sec = section('how');
  ok(/<ol class="steps"/.test(sec), 'falta <ol class="steps">');
  ok(count(/<li class="step\b/g, sec) === 3, 'debe haber 3 pasos');
  for (const s of ['Descarga para tu plataforma', 'Instala y activa', 'Disfruta el streaming', 'fuentes desconocidas', 'lista M3U']) ok(sec.includes(s), `falta "${s}"`);
});

/* ── plans ──────────────────────────────────────────────── */
check('plans', '3 planes, el trimestral destacado, con precios y formato de miles correctos', () => {
  const sec = section('pricing');
  ok(count(/<article class="plan\b/g, sec) === 3, 'debe haber 3 tarjetas de plan');
  ok(count(/plan--featured/g, sec) === 1, 'debe haber 1 plan destacado');
  const t = text(sec);
  for (const s of ['10.000 COP', '26.200 COP', '75.600 COP', '7.56', '22.68', 'Más popular', 'AHORRAS', '16% OFF', '37% OFF']) ok(t.includes(s), `falta "${s}"`);
  ok(!/75600/.test(t), 'queda 75600 sin punto de miles');
});
check('plans', 'cada plan abre WhatsApp con mensaje codificado (tildes incluidas)', () => {
  const links = tags('a', section('pricing')).filter((t) => (attr(t, 'href') || '').startsWith('https://wa.me/573014518350?text='));
  ok(links.length === 3, `hay ${links.length} enlaces a WhatsApp`);
  ['mensual', 'trimestral', 'anual'].forEach((plan, i) => {
    const msg = decodeURIComponent(attr(links[i], 'href').split('?text=')[1]);
    ok(msg.includes(plan) && msg.includes('Cóndor Play'), `mensaje incorrecto para ${plan}: ${msg}`);
    ok(attr(links[i], 'target') === '_blank' && attr(links[i], 'rel') === 'noopener', `enlace ${plan} sin target/rel`);
  });
});
check('plans', 'sin toast falso', () => ok(!/showToast|class="toast"/.test(html), 'queda el toast'));

/* ── download ───────────────────────────────────────────── */
check('download', '2 tarjetas (Android y Windows) con descarga y datos de versión', () => {
  const sec = section('download');
  const cards = tags('article', sec).filter((t) => /class="dl-card"/.test(t));
  ok(cards.length === 2, `hay ${cards.length} tarjetas`);
  ok(['android', 'windows'].every((p) => cards.some((c) => attr(c, 'data-platform') === p)), 'faltan data-platform android/windows');
  ok(tags('a', sec).filter((t) => hasAttr(t, 'download')).length === 2, 'debe haber 2 enlaces de descarga');
  const t = text(sec);
  for (const s of ['Android 7.0+', '~40 MB', 'Win 10/11', '64-bit']) ok(t.includes(s), `falta "${s}"`);
});
check('download', 'resalta la plataforma del visitante sin ocultar la otra', () => {
  ok(script.includes('data-platform') && script.includes('is-recommended'), 'falta la detección de plataforma');
  ok(/dl-reco/.test(section('download')) && /class="dl-reco"[^>]*hidden/.test(section('download')), 'falta .dl-reco oculto por defecto');
});

/* ── a11y ───────────────────────────────────────────────── */
check('a11y', 'un solo <h1> y al menos 4 <h2>', () => {
  ok(count(/<h1[\s>]/g, body) === 1, 'debe haber un único h1');
  ok(count(/<h2[\s>]/g, body) >= 4, 'debe haber al menos 4 h2');
});
check('a11y', 'toda imagen con alt, width y height', () => {
  for (const img of tags('img')) ok(hasAttr(img, 'alt') && attr(img, 'width') && attr(img, 'height'), `imagen incompleta: ${img}`);
});
check('a11y', 'enlaces target=_blank con rel=noopener; botones con type', () => {
  for (const a of tags('a').filter((t) => attr(t, 'target') === '_blank')) ok(/rel="[^"]*noopener/.test(a), `sin rel=noopener: ${a}`);
  for (const b of tags('button')) ok(attr(b, 'type'), `botón sin type: ${b}`);
});
check('a11y', 'iconos SVG decorativos con aria-hidden', () => {
  for (const svg of tags('svg').filter((t) => /class="icon/.test(t))) ok(attr(svg, 'aria-hidden') === 'true', `svg sin aria-hidden: ${svg}`);
});

/* ── versioning ─────────────────────────────────────────── */
check('versioning', 'todos los APK apuntan a una sola versión y todos los EXE a otra', () => {
  const apk = new Set([...html.matchAll(APK)].map((m) => m[1]));
  const exe = new Set([...html.matchAll(EXE)].map((m) => `${m[1]}|${m[2]}`));
  ok(apk.size === 1, `versiones de APK distintas o ausentes: ${[...apk]}`);
  ok(exe.size === 1, `versiones de EXE distintas o ausentes: ${[...exe]}`);
  const [tag, file] = [...exe][0].split('|');
  ok(tag === file, `el tag (${tag}) y el archivo (${file}) del EXE no coinciden`);
});
check('versioning', 'los textos visibles llevan la versión vigente y CSS/JS no la contienen', () => {
  const apk = [...html.matchAll(APK)][0]?.[1];
  const exe = [...html.matchAll(EXE)][0]?.[1];
  ok(apk && exe, 'no se encontraron las URLs de descarga');
  const t = text(body);
  ok(t.includes(`Android v${apk}`), `falta "Android v${apk}"`);
  ok(t.includes(`Windows v${exe}`), `falta "Windows v${exe}"`);
  ok(!styles.includes(apk) && !script.includes(apk), 'la versión de Android aparece en CSS/JS');
  ok(!styles.includes(exe) && !script.includes(exe), 'la versión de Windows aparece en CSS/JS');
});

/* ── final ──────────────────────────────────────────────── */
check('final', 'no quedan marcadores de plantilla', () => ok(!/@(section|css|js):/.test(html), 'quedan marcadores @section/@css/@js'));

/* ── ejecución ──────────────────────────────────────────── */
const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(groups);
let passed = 0;
let failed = 0;
for (const g of names) {
  if (!groups[g]) { console.error(`Grupo desconocido: ${g}. Grupos: ${Object.keys(groups).join(', ')}`); process.exit(2); }
  console.log(`\n[${g}]`);
  for (const { name, fn } of groups[g]) {
    try { fn(); passed++; console.log(`  ok     ${name}`); }
    catch (e) { failed++; console.log(`  FALLA  ${name}\n         ${e.message}`); }
  }
}
console.log(`\n${passed} correctas, ${failed} fallidas`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 3: Ejecutar y confirmar que falla**

Run: `node tests/check-site.mjs`
Expected: exit code 1 y la última línea `8 correctas, 40 fallidas`. Las 8 que ya pasan con el `index.html` viejo son las que el rediseño no debe romper: `versioning` (2), `final` (1), `lang="es"`, JS/CSS con sintaxis válida, "conserva estado Ya disponible y las cifras del hero", "toda referencia a assets/ existe" y "iconos SVG con aria-hidden" (este último y el de assets pasan por vacío). Si `versioning` falla, revisar las versiones del `index.html` actual antes de seguir.

- [ ] **Step 4: Commit**

```bash
git add tests/check-site.mjs
git commit -m "test: script de verificación estática del sitio (rojo)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Imágenes optimizadas y logo sin fondo

**Files:**
- Create: `assets/app-tv.webp`, `assets/app-peliculas.webp`, `assets/app-series.webp`, `assets/app-anime.webp`, `assets/app-cuenta.webp`, `assets/logo-mark.webp`, `.gitignore`

**Interfaces:**
- Produces: las 5 capturas a **720×1512** (`assets/app-<tv|peliculas|series|anime|cuenta>.webp`; origen `captura1..5.jpeg`) y `assets/logo-mark.webp` a **240×174** con canal alfa. Las usan las Tareas 3, 4 y 5.

- [ ] **Step 1: Ejecutar el grupo y confirmar que falla**

Run: `node tests/check-site.mjs assets`
Expected: FALLA en los 6 archivos y en `.gitignore`.

- [ ] **Step 2: Generar capturas recortadas (quita ≈56 px de barra de estado y ≈32 px de gestos)**

Run (Git Bash, desde la raíz del repo):
```bash
mkdir -p assets
for pair in 1:tv 2:peliculas 3:series 4:anime 5:cuenta; do
  n="${pair%%:*}"; name="${pair##*:}"
  ffmpeg -y -loglevel error -i "captura$n.jpeg" -vf "crop=720:1512:0:56" -c:v libwebp -quality 80 "assets/app-$name.webp"
done
ls -l assets
```
Expected: 5 archivos `app-*.webp` de ≈ 40–120 KB.

- [ ] **Step 3: Generar el emblema del logo con transparencia**

`logo.jpeg` es negro puro alrededor; `colorkey` vuelve transparente ese negro y el recorte descarta el wordmark inferior (el nombre va como texto real en la página).

Run:
```bash
ffmpeg -y -loglevel error -i logo.jpeg -vf "crop=1060:772:100:125,colorkey=0x000000:0.14:0.12,scale=240:174" -c:v libwebp -quality 90 assets/logo-mark.webp
ffprobe -v error -show_entries stream=width,height -of csv=p=0 assets/logo-mark.webp
```
Expected: `240,174`

- [ ] **Step 4: Verificar dimensiones y recorte visualmente**

Run:
```bash
for n in tv peliculas series anime cuenta; do printf "%s: " "$n"; ffprobe -v error -show_entries stream=width,height -of csv=p=0 "assets/app-$n.webp"; done
S="C:/Users/jarol/AppData/Local/Temp/claude/D--Documentos-PROGRAMACION-condor-play/7c9df701-d3c0-4f15-a915-00a02442a253/scratchpad"
ffmpeg -y -loglevel error -i assets/app-cuenta.webp "$S/check-cuenta.png"
```
Expected: cinco líneas `…: 720,1512`. Abrir `check-cuenta.png` con Read: debe verse la barra "Mi Cuenta" arriba (sin hora ni batería) y la barra de pestañas abajo (sin la franja blanca de gestos).

- [ ] **Step 5: Excluir los originales**

Los `captura*.jpeg` incluyen barra de estado y el modelo del dispositivo; no deben publicarse.

Run:
```bash
printf 'captura*.jpeg\n' > .gitignore
git status --short
```
Expected: `assets/` y `.gitignore` como no rastreados; `captura*.jpeg` ya **no** aparecen.

- [ ] **Step 6: Ejecutar el grupo y confirmar que pasa**

Run: `node tests/check-site.mjs assets`
Expected: `8 correctas, 0 fallidas`

- [ ] **Step 7: Commit**

```bash
git add assets .gitignore
git commit -m "feat: capturas de la app en WebP y logo sin fondo

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Cimientos — tokens, base, nav, footer, sprite y JS núcleo

**Files:**
- Modify (reescribir por completo): `index.html`

**Interfaces:**
- Consumes: `assets/logo-mark.webp` (Tarea 2).
- Produces: clases `.container`, `.section`, `.section--band`, `.section-head`, `.section-head--center`, `.eyebrow`, `.h2`, `.lede`, `.btn` (`.btn-primary`, `.btn-ghost`, `.btn-lg`, `.btn-sm`), `.icon`, `.live-dot`, `.visually-hidden`, `.reveal` (+ `.is-visible`, `style="--d:N"`), `.phone-body`/`.phone-screen` (marco de teléfono compartido); sprite `#i-menu #i-close #i-zap #i-tv #i-shield #i-film #i-layout #i-refresh #i-download #i-check #i-phone #i-windows #i-chat #i-github`; variable JS `reduceMotion` dentro del IIFE; **marcadores** que reemplazan las Tareas 4–8: `<!-- @section:hero -->`, `<!-- @section:strip -->`, `<!-- @section:features -->`, `<!-- @section:steps -->`, `<!-- @section:plans -->`, `<!-- @section:download -->`, `/* @css:hero */`, `/* @css:features */`, `/* @css:steps */`, `/* @css:plans */`, `/* @css:download */`, `/* @js:hero */`, `/* @js:features */`, `/* @js:download */`.

- [ ] **Step 1: Ejecutar el grupo y confirmar que falla**

Run: `node tests/check-site.mjs foundation`
Expected: varias `FALLA` (Bebas/DM, `--cyan`, sin sprite, etc.).

- [ ] **Step 2: Leer el `index.html` actual y reescribirlo**

Leer `index.html` con Read (la herramienta Write lo exige) y luego sobrescribirlo con este contenido completo:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0A0708" />
  <title>Cóndor Play — Streaming sin límites</title>
  <meta name="description" content="Cóndor Play: la aplicación IPTV más avanzada para Android TV, smartphones y PC Windows. Streaming estable, interfaz moderna y calidad sin compromisos." />
  <link rel="icon" type="image/webp" href="assets/logo-mark.webp" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <script>document.documentElement.classList.add('js');</script>
  <style>
    /* ─── TOKENS ─────────────────────────────────────────── */
    :root {
      --bg: #0A0708;
      --surface: #151011;
      --surface-2: #1E1618;
      --text: #F2ECE8;
      --muted: #A29396;
      --red: #EC1B2E;
      --red-soft: #FF5A6E;
      --on-red: #000;
      --line: rgba(242, 236, 232, .10);
      --line-strong: rgba(242, 236, 232, .20);

      --font-display: 'Archivo', system-ui, sans-serif;
      --font-body: 'Instrument Sans', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, 'Cascadia Mono', monospace;

      --radius: 12px;
      --radius-lg: 20px;
      --nav-h: 4rem;
      --gutter: clamp(1.25rem, 4vw, 2rem);
      --section-y: clamp(4.5rem, 9vw, 7.5rem);
    }

    /* ─── BASE ───────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; scroll-padding-top: calc(var(--nav-h) + 1rem); -webkit-text-size-adjust: 100%; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      font-size: 1.0625rem;
      line-height: 1.6;
      overflow-x: clip;
    }
    img { display: block; max-width: 100%; height: auto; }
    a { color: inherit; text-decoration: none; }
    button { font: inherit; color: inherit; cursor: pointer; }
    ul, ol { list-style: none; }
    [hidden] { display: none !important; }
    :focus-visible { outline: 2px solid var(--red-soft); outline-offset: 3px; border-radius: 4px; }
    ::selection { background: var(--red); color: var(--on-red); }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: #3a2c30; border-radius: 99px; }

    .skip-link {
      position: absolute; left: 1rem; top: -4rem; z-index: 200;
      background: var(--red); color: var(--on-red);
      padding: .7rem 1rem; border-radius: 8px; font-weight: 600;
      transition: top .2s;
    }
    .skip-link:focus { top: 1rem; }
    .visually-hidden {
      position: absolute; width: 1px; height: 1px; overflow: hidden;
      clip-path: inset(50%); white-space: nowrap;
    }

    /* ─── LAYOUT Y TIPOGRAFÍA COMPARTIDA ─────────────────── */
    .container { width: 100%; max-width: 1200px; margin-inline: auto; padding-inline: var(--gutter); }
    .section { position: relative; padding-block: var(--section-y); }
    .section--band { background: var(--surface); border-block: 1px solid var(--line); }
    .section-head { max-width: 44rem; margin-bottom: clamp(2rem, 4vw, 3.5rem); }
    .section-head--center { margin-inline: auto; text-align: center; }
    .section-head--center .lede { margin-inline: auto; }

    .eyebrow {
      display: inline-flex; align-items: center; gap: .6rem;
      margin-bottom: 1rem;
      font: 500 .78rem/1 var(--font-mono);
      letter-spacing: .14em; text-transform: uppercase;
      color: var(--red-soft);
    }
    .eyebrow::before { content: ""; width: .3rem; height: 1rem; background: var(--red); }

    .h2 {
      font-family: var(--font-display);
      font-stretch: 112%;
      font-weight: 800;
      font-size: clamp(1.9rem, 4vw, 3rem);
      line-height: 1.04;
      letter-spacing: -.005em;
      text-transform: uppercase;
      text-wrap: balance;
    }
    .lede { max-width: 38rem; margin-top: 1rem; color: var(--muted); font-size: clamp(1rem, 1.5vw, 1.15rem); }

    .icon {
      width: 1.25em; height: 1.25em; flex: none;
      fill: none; stroke: currentColor; stroke-width: 2;
      stroke-linecap: round; stroke-linejoin: round;
    }
    .live-dot {
      width: .5rem; height: .5rem; flex: none;
      border-radius: 50%; background: var(--red);
      animation: live-pulse 2s ease-in-out infinite;
    }
    @keyframes live-pulse { 50% { opacity: .35; } }

    /* ─── BOTONES ────────────────────────────────────────── */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
      min-height: 44px; padding: .7rem 1.3rem;
      border: 1px solid transparent; border-radius: 10px;
      font: 600 1rem/1.1 var(--font-body);
      text-align: center;
      transition: background-color .2s, border-color .2s, transform .15s;
    }
    .btn:active { transform: translateY(1px); }
    .btn-primary { background: var(--red); color: var(--on-red); }
    .btn-primary:hover { background: #ff2f42; }
    .btn-ghost { border-color: var(--line-strong); color: var(--text); }
    .btn-ghost:hover { border-color: var(--text); }
    .btn-lg { min-height: 52px; padding: .9rem 1.6rem; }
    .btn-sm { padding: .55rem 1.1rem; font-size: .92rem; }

    /* ─── REVELADO AL HACER SCROLL (solo con JS) ─────────── */
    .js .reveal {
      opacity: 0; transform: translateY(20px);
      transition: opacity .6s ease, transform .6s ease;
      transition-delay: calc(var(--d, 0) * 80ms);
    }
    .js .reveal.is-visible { opacity: 1; transform: none; }

    /* ─── MARCO DE TELÉFONO (hero y características) ─────── */
    .phone-body {
      position: relative; padding: 9px; border-radius: 2.4rem;
      background: linear-gradient(160deg, #2b2124, #120d0f);
      box-shadow: 0 0 0 1px var(--line-strong), 0 30px 80px -24px rgba(236, 27, 46, .30);
    }
    .phone-body::after {
      content: ""; position: absolute; top: 19px; left: 50%; z-index: 1;
      width: 9px; height: 9px; margin-left: -4.5px; border-radius: 50%;
      background: #000; box-shadow: 0 0 0 2px rgba(255, 255, 255, .06);
    }
    .phone-screen {
      position: relative; aspect-ratio: 720 / 1512; overflow: hidden;
      border-radius: 1.9rem; background: #000;
    }
    .phone-screen img { width: 100%; height: 100%; object-fit: cover; }

    /* ─── NAV ────────────────────────────────────────────── */
    .nav {
      position: fixed; inset: 0 0 auto 0; z-index: 100; height: var(--nav-h);
      display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
      padding-inline: var(--gutter);
      background: rgba(10, 7, 8, .82);
      -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
      border-bottom: 1px solid transparent;
      transition: border-color .3s, background-color .3s;
    }
    .nav.is-scrolled { border-bottom-color: var(--line); background: rgba(10, 7, 8, .94); }
    .nav-brand { display: inline-flex; align-items: center; gap: .7rem; }
    .nav-brand img { height: 2.4rem; width: auto; }
    .nav-wordmark {
      font-family: var(--font-display); font-stretch: 125%; font-weight: 800;
      font-size: 1rem; letter-spacing: .02em; text-transform: uppercase;
    }
    .nav-wordmark b { color: var(--red-soft); font-weight: 800; }
    .nav-main { margin-inline: auto; }
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a { padding: .5rem 0; font-size: .95rem; font-weight: 500; color: var(--muted); transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-toggle {
      display: none; width: 44px; height: 44px;
      align-items: center; justify-content: center;
      background: none; border: 1px solid var(--line-strong); border-radius: 10px;
    }
    .nav-toggle .icon { width: 1.4rem; height: 1.4rem; }
    .nav-toggle .i-close { display: none; }
    .nav-toggle[aria-expanded="true"] .i-open { display: none; }
    .nav-toggle[aria-expanded="true"] .i-close { display: block; }

    .mobile-menu {
      position: fixed; z-index: 99; top: var(--nav-h); inset-inline: 0;
      display: flex; flex-direction: column;
      padding: 1rem var(--gutter) 1.5rem;
      background: rgba(10, 7, 8, .98); border-bottom: 1px solid var(--line);
    }
    .mobile-menu a:not(.btn) { padding: .9rem 0; font-weight: 500; border-bottom: 1px solid var(--line); }
    .mobile-menu .btn { margin-top: 1rem; }

    @media (max-width: 900px) {
      .nav-main, .nav-cta { display: none; }
      .nav-toggle { display: inline-flex; }
    }
    @media (min-width: 901px) { .mobile-menu { display: none !important; } }

    /* ─── SECCIONES (los bloques se insertan en las Tareas 4–8) ── */
    /* @css:hero */
    /* @css:features */
    /* @css:steps */
    /* @css:plans */
    /* @css:download */

    /* ─── FOOTER ─────────────────────────────────────────── */
    .footer { border-top: 1px solid var(--line); padding: clamp(3rem, 6vw, 4.5rem) 0 2rem; }
    .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 2.5rem; }
    .footer-brand p { max-width: 22rem; margin-top: 1rem; color: var(--muted); font-size: .95rem; }
    .footer-title {
      margin-bottom: 1.1rem;
      font: 500 .78rem/1 var(--font-mono);
      letter-spacing: .12em; text-transform: uppercase;
    }
    .footer-col ul { display: grid; gap: .7rem; }
    .footer-col a { color: var(--muted); font-size: .95rem; transition: color .2s; }
    .footer-col a:hover { color: var(--text); }
    .footer-bottom {
      display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem;
      margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--line);
      color: var(--muted); font-size: .88rem;
    }
    .footer-bottom a { display: inline-flex; align-items: center; gap: .45rem; transition: color .2s; }
    .footer-bottom a:hover { color: var(--text); }
    @media (max-width: 900px) {
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .footer-brand { grid-column: 1 / -1; }
    }
    @media (max-width: 560px) { .footer-grid { grid-template-columns: 1fr; } }

    /* ─── MOVIMIENTO REDUCIDO ────────────────────────────── */
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after {
        animation-duration: .001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .001ms !important;
        transition-delay: 0s !important;
      }
      .js .reveal { opacity: 1; transform: none; }
    }
  </style>
  <noscript><style>[role="tabpanel"][hidden] { display: block !important; } .tabs { display: none; }</style></noscript>
</head>
<body>

  <!-- SPRITE DE ICONOS -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="i-menu" viewBox="0 0 24 24"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></symbol>
    <symbol id="i-close" viewBox="0 0 24 24"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></symbol>
    <symbol id="i-zap" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></symbol>
    <symbol id="i-tv" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></symbol>
    <symbol id="i-film" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></symbol>
    <symbol id="i-layout" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></symbol>
    <symbol id="i-refresh" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></symbol>
    <symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></symbol>
    <symbol id="i-windows" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M3 5.5 11 4.4V11H3zM12 4.2 21 3v8h-9zM3 12.5h8V19L3 17.9zM12 12.5h9V21l-9-1.2z"/></symbol>
    <symbol id="i-chat" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></symbol>
    <symbol id="i-github" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></symbol>
  </svg>

  <a class="skip-link" href="#main-content">Saltar al contenido</a>

  <!-- NAV -->
  <header class="nav" id="navbar">
    <a class="nav-brand" href="#hero" aria-label="Cóndor Play, inicio">
      <img src="assets/logo-mark.webp" alt="" width="240" height="174">
      <span class="nav-wordmark">Cóndor <b>Play</b></span>
    </a>
    <nav class="nav-main" aria-label="Principal">
      <ul class="nav-links">
        <li><a href="#features">Características</a></li>
        <li><a href="#how">¿Cómo funciona?</a></li>
        <li><a href="#pricing">Planes</a></li>
      </ul>
    </nav>
    <a class="btn btn-primary btn-sm nav-cta" href="#download">Descargar</a>
    <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menú">
      <svg class="icon i-open" aria-hidden="true"><use href="#i-menu"/></svg>
      <svg class="icon i-close" aria-hidden="true"><use href="#i-close"/></svg>
    </button>
  </header>

  <nav class="mobile-menu" id="mobile-menu" aria-label="Menú móvil" hidden>
    <a href="#features">Características</a>
    <a href="#how">¿Cómo funciona?</a>
    <a href="#pricing">Planes</a>
    <a class="btn btn-primary btn-lg" href="#download">Descargar</a>
  </nav>

  <main id="main-content">
    <!-- @section:hero -->
    <!-- @section:strip -->
    <!-- @section:features -->
    <!-- @section:steps -->
    <!-- @section:plans -->
    <!-- @section:download -->
  </main>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="nav-brand" href="#hero" aria-label="Cóndor Play, inicio">
            <img src="assets/logo-mark.webp" alt="" width="240" height="174">
            <span class="nav-wordmark">Cóndor <b>Play</b></span>
          </a>
          <p>La aplicación IPTV más moderna para Android TV, smartphones y Windows. Streaming sin límites.</p>
        </div>
        <div class="footer-col">
          <p class="footer-title">Producto</p>
          <ul>
            <li><a href="#features">Características</a></li>
            <li><a href="#pricing">Planes y precios</a></li>
            <li><a href="#download">Descargar APK / EXE</a></li>
            <li><a href="#how">¿Cómo instalar?</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <p class="footer-title">Proyecto</p>
          <ul>
            <li><a href="https://github.com/Medina07P/Condor-Play" target="_blank" rel="noopener">GitHub →</a></li>
            <li><a href="https://github.com/Medina07P/Condor-Play/releases" target="_blank" rel="noopener">Releases</a></li>
            <li><a href="https://github.com/Medina07P/Condor-Play/issues" target="_blank" rel="noopener">Reportar bug</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <p class="footer-title">Contacto</p>
          <ul>
            <li><a href="https://wa.me/573014518350" target="_blank" rel="noopener">WhatsApp +57 301 451 8350</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Cóndor Play. Todos los derechos reservados.</p>
        <a href="https://github.com/Medina07P/Condor-Play" target="_blank" rel="noopener">
          <svg class="icon" aria-hidden="true"><use href="#i-github"/></svg>
          GitHub
        </a>
      </div>
    </div>
  </footer>

  <script>
    (() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      /* Nav: borde al hacer scroll */
      const nav = document.getElementById('navbar');
      const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 16);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      /* Menú móvil */
      const toggle = document.getElementById('nav-toggle');
      const menu = document.getElementById('mobile-menu');
      const setMenu = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        menu.hidden = !open;
      };
      toggle.addEventListener('click', () => setMenu(menu.hidden));
      menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('click', (e) => {
        if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
      });

      /* Revelado al hacer scroll */
      const reveals = document.querySelectorAll('.reveal');
      if (reduceMotion.matches || !('IntersectionObserver' in window)) {
        reveals.forEach((el) => el.classList.add('is-visible'));
      } else {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
          });
        }, { threshold: 0.12 });
        reveals.forEach((el) => io.observe(el));
      }

      /* @js:hero */
      /* @js:features */
      /* @js:download */
    })();
  </script>
</body>
</html>
```

- [ ] **Step 3: Ejecutar el grupo y confirmar que pasa**

Run: `node tests/check-site.mjs foundation`
Expected: `… 0 fallidas` (todas `ok`). Si falla el sprite, revisar que cada `id="i-…"` exista; si falla emojis, buscar caracteres pictográficos en el HTML.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: cimientos del rediseño (tokens, base, nav, footer, sprite SVG)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Hero con la firma (banner de canal) y tira de canales

**Files:**
- Modify: `index.html` (reemplazar `/* @css:hero */`, `<!-- @section:hero -->`, `<!-- @section:strip -->`, `/* @js:hero */`)

**Interfaces:**
- Consumes: `.container`, `.btn*`, `.icon`, `.live-dot`, `.phone-body`, `.phone-screen`, `reduceMotion` (Tarea 3); `assets/app-{tv,peliculas,series,anime}.webp` (Tarea 2).
- Produces: `#hero`, `#phone-screen`, `#osd` (`#osd-ch`, `#osd-label`), `.strip`; enlaces con `data-platform="android|windows"` en el hero.

- [ ] **Step 1: Ejecutar el grupo y confirmar que falla**

Run: `node tests/check-site.mjs hero`
Expected: FALLA en todos los checks del grupo.

- [ ] **Step 2: Reemplazar `/* @css:hero */` por el CSS del hero y la tira**

```css
    /* ─── HERO ───────────────────────────────────────────── */
    .hero { padding: calc(var(--nav-h) + clamp(2.5rem, 6vw, 5rem)) 0 clamp(3rem, 6vw, 5rem); }
    .hero-grid {
      display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
      gap: clamp(2rem, 5vw, 4rem); align-items: center;
    }
    .hero-status {
      display: inline-flex; align-items: center; gap: .7rem;
      padding: .5rem .9rem .5rem .8rem;
      background: var(--surface); border: 1px solid var(--line); border-left: 3px solid var(--red);
      font: 500 .78rem/1.3 var(--font-mono); letter-spacing: .04em; color: var(--muted);
    }
    .hero-title {
      margin: 1.4rem 0;
      font-family: var(--font-display); font-stretch: 125%; font-weight: 800;
      font-size: clamp(2.4rem, 5.4vw, 4.6rem);
      line-height: .98; letter-spacing: -.01em; text-transform: uppercase;
      text-wrap: balance;
    }
    .hero-live { color: var(--red); white-space: nowrap; }
    .hero-sub { max-width: 34rem; color: var(--muted); font-size: clamp(1.02rem, 1.6vw, 1.2rem); }
    .hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
    .platforms { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; margin-top: 1.5rem; }
    .platforms li { display: inline-flex; align-items: center; gap: .5rem; font: 500 .8rem/1 var(--font-mono); color: var(--muted); }
    .platforms .icon { width: 1rem; height: 1rem; color: var(--red-soft); }
    .facts {
      display: grid; grid-template-columns: repeat(4, auto); justify-content: start; gap: 1.5rem 2.5rem;
      margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--line);
    }
    .fact { display: flex; flex-direction: column-reverse; gap: .35rem; }
    .fact dd {
      font-family: var(--font-display); font-stretch: 112%; font-weight: 800;
      font-size: 1.6rem; line-height: 1;
    }
    .fact dt { font: 500 .7rem/1.2 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }

    /* teléfono + banner de canal (firma) */
    .hero-device { display: flex; justify-content: center; }
    .phone { position: relative; width: min(100%, 300px); }
    .shot { position: absolute; inset: 0; opacity: 0; transition: opacity .6s ease; }
    .shot.is-active { opacity: 1; }
    .osd {
      position: absolute; top: -1rem; left: -1.25rem; z-index: 2;
      display: flex; align-items: stretch;
      background: rgba(10, 7, 8, .94);
      border: 1px solid var(--line-strong); border-left: 4px solid var(--red);
      box-shadow: 0 10px 30px rgba(0, 0, 0, .5);
      font: 500 .8rem/1 var(--font-mono); letter-spacing: .06em; text-transform: uppercase;
    }
    .osd-ch { padding: .65rem .7rem; color: var(--red-soft); }
    .osd-label {
      display: flex; align-items: center; gap: .5rem; min-width: 8.5rem;
      padding: .65rem .8rem; border-left: 1px solid var(--line-strong);
    }
    .osd .live-dot { display: none; }
    .osd.is-live .live-dot { display: block; }

    @media (max-width: 960px) {
      .hero-grid { grid-template-columns: minmax(0, 1fr); }
      .hero-device { margin-top: 1rem; }
    }
    @media (max-width: 560px) {
      .hero-actions .btn { width: 100%; }
      .facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .osd { left: -.5rem; }
    }

    /* ─── TIRA DE CANALES ────────────────────────────────── */
    .strip { overflow: hidden; background: var(--surface); border-block: 1px solid var(--line); }
    .strip-track { display: flex; width: max-content; animation: strip 48s linear infinite; }
    .strip:hover .strip-track { animation-play-state: paused; }
    .strip-list { display: flex; flex: none; }
    .strip-list li {
      display: flex; align-items: baseline; gap: .7rem; padding: .9rem 1.6rem;
      border-right: 1px solid var(--line); white-space: nowrap;
      font: 500 .8rem/1 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; color: var(--muted);
    }
    .strip-list b { color: var(--red-soft); font-weight: 500; }
    @keyframes strip { to { transform: translateX(-50%); } }
    @media (prefers-reduced-motion: reduce) {
      .strip-track { animation: none; width: auto; }
      .strip-list { flex-wrap: wrap; }
      .strip-list[aria-hidden="true"] { display: none; }
    }
```

- [ ] **Step 3: Reemplazar `<!-- @section:hero -->` por el hero**

```html
    <!-- HERO -->
    <section class="hero" id="hero" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="hero-status"><span class="live-dot" aria-hidden="true"></span>Android v1.3.49 · Windows v3.10.4 — Ya disponible</p>
          <h1 class="hero-title" id="hero-title">Tu TV <span class="hero-live">en vivo</span>, sin límites.</h1>
          <p class="hero-sub">El reproductor IPTV más rápido y elegante para Android TV, smartphones y PC Windows. Streaming estable, interfaz cinética y actualizaciones continuas.</p>

          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="https://github.com/Medina07P/Condor-Play/releases/download/v1.3.49tv/app-release.apk" download data-platform="android">
              <svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg>
              Descargar para Android
            </a>
            <a class="btn btn-ghost btn-lg" href="https://github.com/Medina07P/Condor-Play/releases/download/v3.10.4/condorplay-3.10.4.exe" download data-platform="windows">
              <svg class="icon" aria-hidden="true"><use href="#i-windows"/></svg>
              Windows
            </a>
          </div>

          <ul class="platforms" aria-label="Plataformas compatibles">
            <li><svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg>Android &amp; TV</li>
            <li><svg class="icon" aria-hidden="true"><use href="#i-windows"/></svg>Windows 10/11</li>
            <li><svg class="icon" aria-hidden="true"><use href="#i-tv"/></svg>TV Box</li>
          </ul>

          <dl class="facts">
            <div class="fact"><dt>Usuarios activos</dt><dd>10K+</dd></div>
            <div class="fact"><dt>Uptime</dt><dd>99.9%</dd></div>
            <div class="fact"><dt>Resolución máx.</dt><dd>4K</dd></div>
            <div class="fact"><dt>Última versión</dt><dd>v3.10.4</dd></div>
          </dl>
        </div>

        <div class="hero-device">
          <div class="phone">
            <div class="phone-body">
              <div class="phone-screen" id="phone-screen">
                <img class="shot is-active" src="assets/app-tv.webp" alt="Pantalla de TV en vivo de Cóndor Play con canales favoritos y por categoría" width="720" height="1512" fetchpriority="high" decoding="async">
                <img class="shot" src="assets/app-peliculas.webp" alt="Sección Películas de Cóndor Play con el catálogo por género" width="720" height="1512" decoding="async" aria-hidden="true">
                <img class="shot" src="assets/app-series.webp" alt="Sección Series de Cóndor Play con el catálogo por género" width="720" height="1512" decoding="async" aria-hidden="true">
                <img class="shot" src="assets/app-anime.webp" alt="Sección Anime de Cóndor Play con el catálogo por género" width="720" height="1512" decoding="async" aria-hidden="true">
              </div>
            </div>
            <div class="osd is-live" id="osd" aria-hidden="true">
              <span class="osd-ch" id="osd-ch">CH 01</span>
              <span class="osd-label"><span class="live-dot"></span><span id="osd-label">EN VIVO</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Reemplazar `<!-- @section:strip -->` por la tira de canales**

```html
    <!-- TIRA DE CANALES -->
    <div class="strip">
      <div class="strip-track">
        <ul class="strip-list" aria-label="Categorías de la app">
          <li><b>041</b>Mis favoritos</li>
          <li><b>042</b>Colombia</li>
          <li><b>043</b>Noticias</li>
          <li><b>044</b>Películas</li>
          <li><b>045</b>Ciencia ficción</li>
          <li><b>046</b>Acción</li>
          <li><b>047</b>Aventura</li>
          <li><b>048</b>Series</li>
          <li><b>049</b>Drama</li>
          <li><b>050</b>Crimen</li>
          <li><b>051</b>Anime</li>
          <li><b>052</b>Comedia</li>
        </ul>
        <ul class="strip-list" aria-hidden="true">
          <li><b>041</b>Mis favoritos</li>
          <li><b>042</b>Colombia</li>
          <li><b>043</b>Noticias</li>
          <li><b>044</b>Películas</li>
          <li><b>045</b>Ciencia ficción</li>
          <li><b>046</b>Acción</li>
          <li><b>047</b>Aventura</li>
          <li><b>048</b>Series</li>
          <li><b>049</b>Drama</li>
          <li><b>050</b>Crimen</li>
          <li><b>051</b>Anime</li>
          <li><b>052</b>Comedia</li>
        </ul>
      </div>
    </div>
```

- [ ] **Step 5: Reemplazar `/* @js:hero */` por la rotación del banner de canal**

```js
      /* Hero: el teléfono rota entre las pantallas reales de la app y el banner cambia de canal */
      const screen = document.getElementById('phone-screen');
      if (screen) {
        const shots = [...screen.querySelectorAll('.shot')];
        const osd = document.getElementById('osd');
        const osdCh = document.getElementById('osd-ch');
        const osdLabel = document.getElementById('osd-label');
        const scenes = [
          { ch: 'CH 01', label: 'EN VIVO', live: true },
          { ch: 'CH 02', label: 'PELÍCULAS', live: false },
          { ch: 'CH 03', label: 'SERIES', live: false },
          { ch: 'CH 04', label: 'ANIME', live: false },
        ];
        let current = 0;
        let timer = null;
        const show = (n) => {
          current = n;
          shots.forEach((shot, i) => {
            shot.classList.toggle('is-active', i === n);
            if (i === n) shot.removeAttribute('aria-hidden'); else shot.setAttribute('aria-hidden', 'true');
          });
          osdCh.textContent = scenes[n].ch;
          osdLabel.textContent = scenes[n].label;
          osd.classList.toggle('is-live', scenes[n].live);
        };
        const stop = () => { clearInterval(timer); timer = null; };
        const start = () => {
          if (timer || reduceMotion.matches || document.hidden) return;
          timer = setInterval(() => show((current + 1) % shots.length), 3500);
        };
        document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
        reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) { stop(); show(0); } else start(); });
        show(0);
        start();
      }
```

- [ ] **Step 6: Ejecutar los grupos y confirmar que pasan**

Run: `node tests/check-site.mjs hero versioning foundation`
Expected: `0 fallidas`. (`versioning` vuelve a pasar porque el hero trae los enlaces `v1.3.49tv` / `v3.10.4` y los textos visibles `Android v1.3.49` / `Windows v3.10.4`.)

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: hero con banner de canal sobre las pantallas de la app y tira de canales

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Características — pestañas con las secciones de la app y lista de 6

**Files:**
- Modify: `index.html` (reemplazar `/* @css:features */`, `<!-- @section:features -->`, `/* @js:features */`)

**Interfaces:**
- Consumes: `.section`, `.section-head`, `.eyebrow`, `.h2`, `.lede`, `.icon`, `.reveal`, `.phone-body`, `.phone-screen` (Tarea 3); `assets/app-*.webp` (Tarea 2); `reduceMotion` no se usa aquí.
- Produces: `#features`, `[role="tablist"]` con `[role="tab"]` ids `tab-tv|tab-peliculas|tab-series|tab-anime|tab-cuenta` y paneles `panel-*`; `.feature-list`.

- [ ] **Step 1: Ejecutar el grupo y confirmar que falla**

Run: `node tests/check-site.mjs features`
Expected: FALLA en los 4 checks.

- [ ] **Step 2: Reemplazar `/* @css:features */`**

```css
    /* ─── CARACTERÍSTICAS ────────────────────────────────── */
    .h3 {
      font-family: var(--font-display); font-stretch: 110%; font-weight: 800;
      font-size: clamp(1.35rem, 2.4vw, 1.9rem); line-height: 1.1; text-transform: uppercase;
    }
    .tabs {
      display: flex; gap: .25rem; overflow-x: auto; scrollbar-width: none;
      border-bottom: 1px solid var(--line);
    }
    .tabs::-webkit-scrollbar { display: none; }
    .tab {
      position: relative; flex: none; min-height: 48px; padding: 1rem 1.25rem;
      background: none; border: 0; color: var(--muted);
      font: 600 .95rem/1 var(--font-body); transition: color .2s;
    }
    .tab:hover, .tab[aria-selected="true"] { color: var(--text); }
    .tab::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 3px;
      background: var(--tab, var(--red)); transform: scaleX(0); transform-origin: left;
      transition: transform .3s ease;
    }
    .tab[aria-selected="true"]::after { transform: scaleX(1); }

    .panel {
      display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 270px);
      gap: clamp(2rem, 5vw, 4rem); align-items: center;
      padding-top: clamp(2rem, 4vw, 3rem);
    }
    .panel-list { display: grid; gap: 1rem; margin-top: 1.5rem; max-width: 34rem; }
    .panel-list li { position: relative; padding-left: 1.5rem; color: var(--muted); }
    .panel-list li::before {
      content: ""; position: absolute; left: 0; top: .6em;
      width: .5rem; height: .5rem; background: var(--tab, var(--red));
    }
    .panel-phone { width: min(100%, 270px); justify-self: center; }

    .feature-list {
      display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2.5rem 2rem;
      margin-top: clamp(3rem, 6vw, 5rem); padding-top: clamp(2rem, 4vw, 3rem);
      border-top: 1px solid var(--line);
    }
    .feature-list .icon { width: 1.5rem; height: 1.5rem; color: var(--red-soft); margin-bottom: 1rem; }
    .feature-name { margin-bottom: .5rem; font-size: 1.05rem; font-weight: 600; }
    .feature-list p { color: var(--muted); font-size: .95rem; line-height: 1.55; }

    @media (max-width: 960px) {
      .panel { grid-template-columns: minmax(0, 1fr); }
      .feature-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 560px) {
      .feature-list { grid-template-columns: minmax(0, 1fr); }
      .tab { padding-inline: 1rem; }
    }
```

- [ ] **Step 3: Reemplazar `<!-- @section:features -->`**

```html
    <!-- CARACTERÍSTICAS -->
    <section class="section" id="features" aria-labelledby="features-title">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Características</p>
          <h2 class="h2" id="features-title">Todo lo que necesitas<br> en una sola app</h2>
          <p class="lede">Diseñada para exigentes. Cóndor Play combina velocidad, estabilidad y una experiencia visual premium en Android y Windows.</p>
        </div>

        <div class="tabs" role="tablist" aria-label="Secciones de la app">
          <button class="tab" type="button" role="tab" id="tab-tv" aria-selected="true" aria-controls="panel-tv" style="--tab:#EC1B2E">TV en vivo</button>
          <button class="tab" type="button" role="tab" id="tab-peliculas" aria-selected="false" aria-controls="panel-peliculas" tabindex="-1" style="--tab:#FF9A1F">Películas</button>
          <button class="tab" type="button" role="tab" id="tab-series" aria-selected="false" aria-controls="panel-series" tabindex="-1" style="--tab:#D946EF">Series</button>
          <button class="tab" type="button" role="tab" id="tab-anime" aria-selected="false" aria-controls="panel-anime" tabindex="-1" style="--tab:#14B8C8">Anime</button>
          <button class="tab" type="button" role="tab" id="tab-cuenta" aria-selected="false" aria-controls="panel-cuenta" tabindex="-1" style="--tab:#3B82F6">Mi cuenta</button>
        </div>

        <div class="panel" role="tabpanel" id="panel-tv" aria-labelledby="tab-tv" tabindex="0" style="--tab:#EC1B2E">
          <div class="panel-copy">
            <h3 class="h3">TV en vivo</h3>
            <ul class="panel-list">
              <li>Canales ordenados por categoría, como Colombia o Noticias, con búsqueda y recarga a un toque.</li>
              <li>Marca tus canales con el corazón y encuéntralos al instante en Mis favoritos.</li>
              <li>Navegación pensada para el control remoto en Android TV.</li>
            </ul>
          </div>
          <div class="panel-phone"><div class="phone-body"><div class="phone-screen">
            <img src="assets/app-tv.webp" alt="Pantalla de TV en vivo de Cóndor Play con Mis favoritos, Colombia y Noticias" width="720" height="1512" loading="lazy" decoding="async">
          </div></div></div>
        </div>

        <div class="panel" role="tabpanel" id="panel-peliculas" aria-labelledby="tab-peliculas" tabindex="0" style="--tab:#FF9A1F" hidden>
          <div class="panel-copy">
            <h3 class="h3">Películas</h3>
            <ul class="panel-list">
              <li>Catálogo por género: ciencia ficción, acción, aventura y más.</li>
              <li>Títulos en audio latino y favoritos marcados con un toque.</li>
              <li>Controles de reproducción avanzados: seek, velocidad y pantalla completa.</li>
            </ul>
          </div>
          <div class="panel-phone"><div class="phone-body"><div class="phone-screen">
            <img src="assets/app-peliculas.webp" alt="Sección Películas de Cóndor Play con ciencia ficción, acción y aventura" width="720" height="1512" loading="lazy" decoding="async">
          </div></div></div>
        </div>

        <div class="panel" role="tabpanel" id="panel-series" aria-labelledby="tab-series" tabindex="0" style="--tab:#D946EF" hidden>
          <div class="panel-copy">
            <h3 class="h3">Series</h3>
            <ul class="panel-list">
              <li>Series por género (acción, drama, crimen y más), con etiqueta LAT en los títulos que la tienen.</li>
              <li>Guarda tus favoritas y vuelve a ellas cuando quieras.</li>
              <li>Los mismos controles de reproducción que en películas.</li>
            </ul>
          </div>
          <div class="panel-phone"><div class="phone-body"><div class="phone-screen">
            <img src="assets/app-series.webp" alt="Sección Series de Cóndor Play con acción, drama y crimen" width="720" height="1512" loading="lazy" decoding="async">
          </div></div></div>
        </div>

        <div class="panel" role="tabpanel" id="panel-anime" aria-labelledby="tab-anime" tabindex="0" style="--tab:#14B8C8" hidden>
          <div class="panel-copy">
            <h3 class="h3">Anime</h3>
            <ul class="panel-list">
              <li>Sección propia de anime, organizada por género: drama, ciencia ficción, comedia y más.</li>
              <li>Etiqueta LAT en los títulos disponibles en latino.</li>
              <li>Marca tus favoritos con un toque.</li>
            </ul>
          </div>
          <div class="panel-phone"><div class="phone-body"><div class="phone-screen">
            <img src="assets/app-anime.webp" alt="Sección Anime de Cóndor Play con drama, ciencia ficción y comedia" width="720" height="1512" loading="lazy" decoding="async">
          </div></div></div>
        </div>

        <div class="panel" role="tabpanel" id="panel-cuenta" aria-labelledby="tab-cuenta" tabindex="0" style="--tab:#3B82F6" hidden>
          <div class="panel-copy">
            <h3 class="h3">Mi cuenta</h3>
            <ul class="panel-list">
              <li>Consulta tu plan y la fecha de vencimiento de tu suscripción, y renuévala desde la app.</li>
              <li>Elige la interfaz (Automático, Forzar TV o Forzar Móvil) si la app no detectó bien tu dispositivo.</li>
              <li>Soporte técnico por WhatsApp y manual de uso a un toque.</li>
            </ul>
          </div>
          <div class="panel-phone"><div class="phone-body"><div class="phone-screen">
            <img src="assets/app-cuenta.webp" alt="Pantalla Mi Cuenta de Cóndor Play con suscripción activa, dispositivo y ajustes de interfaz" width="720" height="1512" loading="lazy" decoding="async">
          </div></div></div>
        </div>

        <ul class="feature-list">
          <li class="reveal">
            <svg class="icon" aria-hidden="true"><use href="#i-zap"/></svg>
            <h3 class="feature-name">Reproductor ultrarrápido</h3>
            <p>Motor de reproducción optimizado con soporte para HLS, MPEG-TS y streams de alta velocidad sin buffering.</p>
          </li>
          <li class="reveal" style="--d:1">
            <svg class="icon" aria-hidden="true"><use href="#i-tv"/></svg>
            <h3 class="feature-name">Android TV, Móvil &amp; PC</h3>
            <p>Navegación perfecta con control remoto en Android TV. Interfaz adaptada para pantallas grandes, smartphones y escritorio Windows.</p>
          </li>
          <li class="reveal" style="--d:2">
            <svg class="icon" aria-hidden="true"><use href="#i-shield"/></svg>
            <h3 class="feature-name">Streaming estable</h3>
            <p>Reconexión automática, buffer inteligente y failover de streams para que nunca pierdas lo que estás viendo.</p>
          </li>
          <li class="reveal">
            <svg class="icon" aria-hidden="true"><use href="#i-film"/></svg>
            <h3 class="feature-name">VOD integrado</h3>
            <p>Películas y series con controles de reproducción avanzados: seek, velocidad, pantalla completa y más.</p>
          </li>
          <li class="reveal" style="--d:1">
            <svg class="icon" aria-hidden="true"><use href="#i-layout"/></svg>
            <h3 class="feature-name">Interfaz cinética</h3>
            <p>Diseño oscuro moderno con animaciones fluidas. Navega canales y categorías de forma rápida e intuitiva.</p>
          </li>
          <li class="reveal" style="--d:2">
            <svg class="icon" aria-hidden="true"><use href="#i-refresh"/></svg>
            <h3 class="feature-name">Actualizaciones continuas</h3>
            <p>Mejoras frecuentes, nuevas funciones y correcciones publicadas en GitHub para mantenerte siempre al día.</p>
          </li>
        </ul>
      </div>
    </section>
```

- [ ] **Step 4: Reemplazar `/* @js:features */`**

```js
      /* Características: pestañas accesibles (patrón ARIA tabs, con flechas, Inicio y Fin) */
      const tablist = document.querySelector('[role="tablist"]');
      if (tablist) {
        const tabs = [...tablist.querySelectorAll('[role="tab"]')];
        const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));
        const select = (index, focus) => {
          tabs.forEach((tab, i) => {
            const on = i === index;
            tab.setAttribute('aria-selected', String(on));
            tab.tabIndex = on ? 0 : -1;
            panels[i].hidden = !on;
          });
          if (focus) tabs[index].focus();
        };
        tabs.forEach((tab, i) => {
          tab.addEventListener('click', () => select(i));
          tab.addEventListener('keydown', (e) => {
            const last = tabs.length - 1;
            const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
            if (next !== undefined) { e.preventDefault(); select(next, true); }
          });
        });
      }
```

- [ ] **Step 5: Ejecutar los grupos y confirmar que pasan**

Run: `node tests/check-site.mjs features foundation`
Expected: `0 fallidas`.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: características con pestañas por sección de la app y lista de 6

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Instalación en 3 pasos

**Files:**
- Modify: `index.html` (reemplazar `/* @css:steps */`, `<!-- @section:steps -->`)

**Interfaces:**
- Consumes: `.section--band`, `.section-head--center`, `.eyebrow`, `.h2`, `.reveal` (Tarea 3).
- Produces: `#how`, `ol.steps > li.step`.

- [ ] **Step 1: Ejecutar el grupo y confirmar que falla**

Run: `node tests/check-site.mjs steps`
Expected: FALLA (no existe `<ol class="steps">`).

- [ ] **Step 2: Reemplazar `/* @css:steps */`**

```css
    /* ─── INSTALACIÓN ────────────────────────────────────── */
    .steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2rem; }
    .step { position: relative; padding-top: 1.75rem; border-top: 1px solid var(--line-strong); }
    .step::before { content: ""; position: absolute; top: -1px; left: 0; width: 3.5rem; height: 3px; background: var(--red); }
    .step-n {
      display: block; margin-bottom: 1rem;
      font: 500 .78rem/1 var(--font-mono); letter-spacing: .14em; text-transform: uppercase;
      color: var(--red-soft);
    }
    .step-title { margin-bottom: .6rem; font-size: 1.2rem; font-weight: 600; line-height: 1.25; }
    .step p { color: var(--muted); }
    @media (max-width: 860px) { .steps { grid-template-columns: minmax(0, 1fr); gap: 2.5rem; } }
```

- [ ] **Step 3: Reemplazar `<!-- @section:steps -->`**

```html
    <!-- INSTALACIÓN -->
    <section class="section section--band" id="how" aria-labelledby="how-title">
      <div class="container">
        <div class="section-head section-head--center reveal">
          <p class="eyebrow">Instalación</p>
          <h2 class="h2" id="how-title">En 3 pasos, ya estás viendo</h2>
        </div>
        <ol class="steps">
          <li class="step reveal">
            <span class="step-n">Paso 1</span>
            <h3 class="step-title">Descarga para tu plataforma</h3>
            <p>Elige el APK para Android / TV Box o el instalador .exe para Windows y descárgalo directamente en tu dispositivo.</p>
          </li>
          <li class="step reveal" style="--d:1">
            <span class="step-n">Paso 2</span>
            <h3 class="step-title">Instala y activa</h3>
            <p>En Android, permite fuentes desconocidas e instala. En Windows, ejecuta el instalador. Activa tu suscripción con el código recibido.</p>
          </li>
          <li class="step reveal" style="--d:2">
            <span class="step-n">Paso 3</span>
            <h3 class="step-title">¡Disfruta el streaming!</h3>
            <p>Carga tu lista M3U y empieza a ver canales en vivo, películas y series al instante desde cualquier dispositivo.</p>
          </li>
        </ol>
      </div>
    </section>
```

- [ ] **Step 4: Ejecutar el grupo y confirmar que pasa**

Run: `node tests/check-site.mjs steps`
Expected: `0 fallidas`.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: sección de instalación en 3 pasos

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Planes con compra por WhatsApp

**Files:**
- Modify: `index.html` (reemplazar `/* @css:plans */`, `<!-- @section:plans -->`)

**Interfaces:**
- Consumes: `.section`, `.section-head--center`, `.eyebrow`, `.h2`, `.lede`, `.btn*`, `.icon`, `.reveal`, `.visually-hidden`, símbolo `#i-check` y `#i-chat` (Tarea 3).
- Produces: `#pricing`, `.plans`, `article.plan` (`.plan--featured` en el trimestral), enlaces `https://wa.me/573014518350?text=…`.

- [ ] **Step 1: Ejecutar el grupo y confirmar que falla**

Run: `node tests/check-site.mjs plans`
Expected: FALLA en los 3 checks (los dos primeros por sección inexistente; el toast pasa porque ya no existe).

- [ ] **Step 2: Reemplazar `/* @css:plans */`**

```css
    /* ─── PLANES ─────────────────────────────────────────── */
    .plans { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; align-items: stretch; }
    .plan {
      position: relative; display: flex; flex-direction: column;
      padding: 2rem 1.75rem; background: var(--surface);
      border: 1px solid var(--line); border-radius: var(--radius-lg);
      transition: border-color .2s;
    }
    .plan:hover { border-color: var(--line-strong); }
    .plan--featured {
      border-color: var(--red);
      background: linear-gradient(180deg, rgba(236, 27, 46, .09), var(--surface) 55%);
    }
    .plan--featured:hover { border-color: var(--red); }
    .plan-top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; min-height: 1.6rem; }
    .plan-name { font: 500 .78rem/1 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
    .plan-tag {
      padding: .25rem .55rem; border-radius: 4px; background: var(--red); color: var(--on-red);
      font: 700 .7rem/1 var(--font-mono); letter-spacing: .06em; text-transform: uppercase;
    }
    .plan-price { display: flex; align-items: flex-end; gap: .9rem; margin-top: 1.25rem; }
    .price-usd {
      font-family: var(--font-display); font-stretch: 112%; font-weight: 800;
      font-size: clamp(2.8rem, 4.6vw, 3.6rem); line-height: 1; letter-spacing: -.02em;
    }
    .price-cur { margin-right: .1em; color: var(--muted); font-size: .5em; vertical-align: .55em; }
    .price-meta { display: flex; flex-direction: column; gap: .25rem; padding-bottom: .35rem; font: 500 .8rem/1.2 var(--font-mono); color: var(--muted); }
    .price-cop { color: var(--text); }
    .plan-period { margin-top: .6rem; color: var(--muted); font-size: .9rem; }
    .plan-period s { opacity: .7; }
    .plan-saving {
      align-self: flex-start; margin-top: .9rem; padding: .25rem .55rem; border-radius: 4px;
      border: 1px solid rgba(255, 90, 110, .35);
      font: 500 .74rem/1.3 var(--font-mono); color: var(--red-soft);
    }
    .plan-features {
      flex: 1; display: grid; align-content: start; gap: .7rem;
      margin: 1.5rem 0 2rem; padding-top: 1.5rem; border-top: 1px solid var(--line);
    }
    .plan-features li { display: flex; align-items: flex-start; gap: .6rem; font-size: .95rem; }
    .plan-features .icon { flex: none; width: 1rem; height: 1rem; margin-top: .3em; color: var(--red-soft); }
    .plan .btn { width: 100%; }
    .plans-note { margin-top: 1.5rem; text-align: center; color: var(--muted); font: 500 .8rem/1.5 var(--font-mono); }

    @media (max-width: 900px) {
      .plans { grid-template-columns: minmax(0, 1fr); max-width: 30rem; margin-inline: auto; }
      .plan--featured { order: -1; }
    }
```

- [ ] **Step 3: Reemplazar `<!-- @section:plans -->`**

Mensajes codificados (`encodeURIComponent`): `Hola, quiero el plan <plan> de Cóndor Play` → `Hola%2C%20quiero%20el%20plan%20<plan>%20de%20C%C3%B3ndor%20Play`.

```html
    <!-- PLANES -->
    <section class="section" id="pricing" aria-labelledby="pricing-title">
      <div class="container">
        <div class="section-head section-head--center reveal">
          <p class="eyebrow">Planes</p>
          <h2 class="h2" id="pricing-title">Elige tu plan ideal</h2>
          <p class="lede">Sin contratos ocultos ni sorpresas. Todos los planes incluyen acceso completo a Cóndor Play.</p>
        </div>

        <div class="plans reveal">

          <!-- MENSUAL -->
          <article class="plan" aria-labelledby="plan-mensual">
            <div class="plan-top"><h3 class="plan-name" id="plan-mensual">Plan Mensual</h3></div>
            <p class="plan-price">
              <span class="price-usd"><span class="price-cur">$</span>3</span>
              <span class="price-meta"><span>USD</span><span class="price-cop">10.000 COP</span></span>
            </p>
            <p class="plan-period">/ mes · pago mensual</p>
            <ul class="plan-features">
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>2 dispositivos simultáneos</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Canales en vivo HD</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>VOD — películas y series</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Soporte por email</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Actualizaciones incluidas</li>
            </ul>
            <a class="btn btn-ghost" href="https://wa.me/573014518350?text=Hola%2C%20quiero%20el%20plan%20mensual%20de%20C%C3%B3ndor%20Play" target="_blank" rel="noopener">
              <svg class="icon" aria-hidden="true"><use href="#i-chat"/></svg>Comprar mensual
            </a>
          </article>

          <!-- TRIMESTRAL (destacado) -->
          <article class="plan plan--featured" aria-labelledby="plan-trimestral">
            <div class="plan-top">
              <h3 class="plan-name" id="plan-trimestral">Plan Trimestral</h3>
              <span class="plan-tag">Más popular</span>
            </div>
            <p class="plan-price">
              <span class="price-usd"><span class="price-cur">$</span>7.56</span>
              <span class="price-meta"><span>USD</span><span class="price-cop">26.200 COP</span></span>
            </p>
            <p class="plan-period">/ 3 meses · <s><span class="visually-hidden">antes </span>$9/30.000</s></p>
            <p class="plan-saving">AHORRAS $1.44/4.800 — 16% OFF</p>
            <ul class="plan-features">
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>2 dispositivos simultáneos</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Canales en vivo FHD &amp; 4K</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>VOD completo + EPG</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Soporte prioritario</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Actualizaciones anticipadas</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Sin anuncios</li>
            </ul>
            <a class="btn btn-primary" href="https://wa.me/573014518350?text=Hola%2C%20quiero%20el%20plan%20trimestral%20de%20C%C3%B3ndor%20Play" target="_blank" rel="noopener">
              <svg class="icon" aria-hidden="true"><use href="#i-chat"/></svg>Comprar trimestral
            </a>
          </article>

          <!-- ANUAL -->
          <article class="plan" aria-labelledby="plan-anual">
            <div class="plan-top"><h3 class="plan-name" id="plan-anual">Plan Anual</h3></div>
            <p class="plan-price">
              <span class="price-usd"><span class="price-cur">$</span>22.68</span>
              <span class="price-meta"><span>USD</span><span class="price-cop">75.600 COP</span></span>
            </p>
            <p class="plan-period">/ año · <s><span class="visually-hidden">antes </span>$36/120.000</s></p>
            <p class="plan-saving">AHORRAS $13.32 / 44.000 — 37% OFF</p>
            <ul class="plan-features">
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>3 dispositivos simultáneos</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Canales en vivo 4K UHD</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>VOD ilimitado + EPG</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Soporte 24/7 prioritario</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Beta de nuevas funciones</li>
              <li><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Sin anuncios para siempre</li>
            </ul>
            <a class="btn btn-ghost" href="https://wa.me/573014518350?text=Hola%2C%20quiero%20el%20plan%20anual%20de%20C%C3%B3ndor%20Play" target="_blank" rel="noopener">
              <svg class="icon" aria-hidden="true"><use href="#i-chat"/></svg>Comprar anual
            </a>
          </article>

        </div>
        <p class="plans-note">Al pulsar Comprar se abre WhatsApp con tu plan ya escrito.</p>
      </div>
    </section>
```

- [ ] **Step 4: Ejecutar el grupo y confirmar que pasa**

Run: `node tests/check-site.mjs plans`
Expected: `0 fallidas`.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: planes rediseñados con compra por WhatsApp

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Descarga con detección de plataforma

**Files:**
- Modify: `index.html` (reemplazar `/* @css:download */`, `<!-- @section:download -->`, `/* @js:download */`)

**Interfaces:**
- Consumes: `.section--band`, `.section-head--center`, `.eyebrow`, `.h2`, `.lede`, `.btn*`, `.icon`, `.reveal`, símbolos `#i-phone`, `#i-windows`, `#i-download` (Tarea 3).
- Produces: `#download`, `article.dl-card[data-platform]` con `.dl-reco[hidden]`; clase `.is-recommended` puesta por JS.

- [ ] **Step 1: Ejecutar el grupo y confirmar que falla**

Run: `node tests/check-site.mjs download`
Expected: FALLA en los 2 checks.

- [ ] **Step 2: Reemplazar `/* @css:download */`**

```css
    /* ─── DESCARGA ───────────────────────────────────────── */
    .dl-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; max-width: 56rem; margin-inline: auto; }
    .dl-card {
      position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: .9rem;
      padding: 2rem; background: var(--surface-2);
      border: 1px solid var(--line); border-radius: var(--radius-lg);
      transition: border-color .2s;
    }
    .dl-card.is-recommended { border-color: var(--red); }
    .dl-icon {
      display: grid; place-items: center; width: 3rem; height: 3rem;
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
      color: var(--red-soft);
    }
    .dl-icon .icon { width: 1.5rem; height: 1.5rem; }
    .dl-reco { font: 500 .72rem/1 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--red-soft); }
    .dl-title { font-family: var(--font-display); font-stretch: 110%; font-weight: 800; font-size: 1.4rem; line-height: 1.1; text-transform: uppercase; }
    .dl-meta { font: 500 .8rem/1.5 var(--font-mono); color: var(--muted); }
    .dl-card .btn { margin-top: auto; align-self: stretch; }
    @media (max-width: 700px) { .dl-grid { grid-template-columns: minmax(0, 1fr); } }
```

- [ ] **Step 3: Reemplazar `<!-- @section:download -->`**

```html
    <!-- DESCARGA -->
    <section class="section section--band" id="download" aria-labelledby="download-title">
      <div class="container">
        <div class="section-head section-head--center reveal">
          <p class="eyebrow">Descarga</p>
          <h2 class="h2" id="download-title">Cóndor Play</h2>
          <p class="lede">Disponible para Android y Windows. Compatible con teléfonos, tablets, Android TV Box y PC de escritorio.</p>
        </div>

        <div class="dl-grid reveal">
          <article class="dl-card" data-platform="android">
            <span class="dl-icon"><svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg></span>
            <p class="dl-reco" hidden>Recomendado para tu dispositivo</p>
            <h3 class="dl-title">Android y Android TV</h3>
            <p class="dl-meta">Android v1.3.49 · Android 7.0+ · ~40 MB</p>
            <a class="btn btn-primary btn-lg" href="https://github.com/Medina07P/Condor-Play/releases/download/v1.3.49tv/app-release.apk" download>
              <svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Descargar APK
            </a>
          </article>

          <article class="dl-card" data-platform="windows">
            <span class="dl-icon"><svg class="icon" aria-hidden="true"><use href="#i-windows"/></svg></span>
            <p class="dl-reco" hidden>Recomendado para tu dispositivo</p>
            <h3 class="dl-title">Windows</h3>
            <p class="dl-meta">Windows v3.10.4 · Win 10/11 · 64-bit</p>
            <a class="btn btn-ghost btn-lg" href="https://github.com/Medina07P/Condor-Play/releases/download/v3.10.4/condorplay-3.10.4.exe" download>
              <svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Descargar EXE
            </a>
          </article>
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Reemplazar `/* @js:download */`**

```js
      /* Descarga: resalta la tarjeta de la plataforma del visitante (la otra sigue visible) */
      const ua = navigator.userAgent || '';
      const platform = /Android/i.test(ua) ? 'android' : /Windows/i.test(ua) ? 'windows' : null;
      const card = platform && document.querySelector(`.dl-card[data-platform="${platform}"]`);
      if (card) {
        card.classList.add('is-recommended');
        card.querySelector('.dl-reco').hidden = false;
      }
```

- [ ] **Step 5: Ejecutar TODOS los grupos**

Run: `node tests/check-site.mjs`
Expected: `0 fallidas` en todos los grupos (incluidos `a11y`, `versioning` y `final`; ya no quedan marcadores `@section/@css/@js`). Si `final` falla, buscar con `grep -n "@section\|@css\|@js" index.html`.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: sección de descarga con plataforma recomendada

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Revisión visual en el navegador (una ronda de hallazgos y una de confirmación)

**Files:**
- Modify: `index.html` (solo correcciones que revele la revisión)

**Interfaces:**
- Consumes: el sitio completo (Tareas 3–8).

Regla de esta tarea: **una** ronda completa de capturas en los 3 anchos, corregir **todo** lo hallado en un solo lote, y **como máximo una** ronda de confirmación. No iterar más.

- [ ] **Step 1: Levantar el servidor estático**

Run (en segundo plano): `cd "D:/Documentos/PROGRAMACION/condor_play" && python -m http.server 8080`
Expected: `Serving HTTP on … port 8080`.

- [ ] **Step 2: Cargar las herramientas de Chrome y abrir la página**

Invocar la skill `claude-in-chrome`, cargar en una sola llamada de ToolSearch: `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__resize_window,mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__javascript_tool`. Llamar `tabs_context_mcp`, crear una pestaña nueva y navegar a `http://localhost:8080/index.html`.

- [ ] **Step 2b: Alternativa si la extensión de Chrome no está conectada**

`tabs_context_mcp` puede responder "Browser extension is not connected". No reintentar en bucle: usar Edge headless, que ya está instalado. Servir el sitio (Step 1) y capturar:
```bash
S="<carpeta del scratchpad>"
B="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
# Escritorio (tramos: hero, características, planes, descarga)
"$B" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=2500 --window-size=1280,5600 --screenshot="$S/full-1280.png" http://localhost:8080/index.html
ffmpeg -y -loglevel error -i "$S/full-1280.png" -vf "crop=1280:1500:0:2050" "$S/d-2.png"     # recortar por tramos para leerlos
```
**Móvil (importante):** Edge headless tiene un ancho mínimo de ventana, así que `--window-size=390,…` calcula el layout más ancho y la captura sale recortada por la derecha (parece un desborde y no lo es). Para medir un viewport real de 390 px, cargar la página dentro de un `<iframe>` de ese ancho (las media queries se evalúan contra el iframe):
```bash
echo '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#333"><iframe src="index.html" style="width:390px;height:9000px;border:0;display:block;margin:0 auto"></iframe>' > frame390.html   # en la raíz servida
"$B" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=2500 --window-size=800,9000 --screenshot="$S/full-390.png" http://localhost:8080/frame390.html
ffmpeg -y -loglevel error -i "$S/full-390.png" -vf "crop=390:2250:205:0" "$S/m-0.png"      # 205 = (800-390)/2
```
Borrar `frame390.html` al terminar (no debe llegar al commit). Limitaciones de esta vía: los instantes de rotación del hero se controlan con `--virtual-time-budget` (≈1200 ms → `CH 01`, ≈5000 ms → `CH 02`); una ventana muy alta puede dejar la pantalla del teléfono en negro por un artefacto de captura, así que ante un negro repetir con `--window-size=1280,760`. No permite probar teclado ni `prefers-reduced-motion`.

- [ ] **Step 3: Ronda de capturas en 3 anchos**

Con `resize_window` y captura de pantalla, en **1280×800**, **768×1024** y **390×844**, capturar: hero (con el banner de canal), tira de canales, características (pestañas y lista), instalación, planes, descarga y footer; en 390 abrir además el menú móvil. Con `read_console_messages` (patrón `error|Failed|404`) confirmar que no hay errores ni recursos faltantes. Con `javascript_tool` ejecutar `document.documentElement.scrollWidth <= window.innerWidth` en cada ancho (debe ser `true`: sin scroll horizontal).

- [ ] **Step 4: Lista de defectos a buscar**

- El `h1` desborda o parte mal las palabras en 390 px.
- El banner `CH 0X · …` tapa contenido relevante o se sale de la pantalla en 390 px.
- Las capturas rotan (cada ~3.5 s) y el banner cambia a `PELÍCULAS`, `SERIES`, `ANIME`, `EN VIVO` con el punto rojo solo en la primera.
- El marco de teléfono se ve recto (sin deformar la captura) y el punto de cámara no estorba.
- La tira de canales corre sin saltos al reiniciar el bucle; pausa al pasar el cursor.
- Pestañas: la activa muestra la barra de su color; en 390 px el listado de pestañas se desplaza horizontalmente sin romper la página.
- Planes: precios legibles sin desbordes (`22.68`, `75.600 COP`); en 768 y 390 px el plan trimestral va primero; botones a ancho completo.
- Descarga: en Windows (este equipo) la tarjeta de Windows muestra "Recomendado para tu dispositivo".
- Logo `logo-mark.webp` sin halo claro alrededor sobre el fondo `#0A0708`.
- Foco de teclado visible (Tab) en nav, botones, pestañas y enlaces.

- [ ] **Step 5: Corregir en un solo lote**

Aplicar con Edit todas las correcciones halladas en el Step 4 (ajustes de CSS/HTML concretos). Si el logo tiene halo, subir la tolerancia de `colorkey` (por ejemplo `0.14:0.12` → `0.20:0.15`) y regenerar `assets/logo-mark.webp` con el comando de la Tarea 2, Step 3.

- [ ] **Step 6: Una ronda de confirmación**

Recargar y repetir la captura solo de las zonas corregidas en los anchos afectados. Ejecutar: `node tests/check-site.mjs` → `0 fallidas`. Detener el servidor.

- [ ] **Step 7: Commit**

```bash
git add index.html assets
git commit -m "fix: ajustes tras la revisión visual en 3 anchos

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
(Si no hubo cambios, omitir el commit y anotarlo.)

---

### Task 10: Prueba del flujo de versionado y documentación

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: `index.html` final; `update-version.ps1`, `README.md`, `_redirects` (sin modificar); `SITE_ROOT` de `tests/check-site.mjs`.

- [ ] **Step 1: Probar `update-version.ps1` sobre una copia temporal**

Run (Git Bash, desde la raíz):
```bash
TMP="$(mktemp -d)"
cp index.html README.md _redirects update-version.ps1 "$TMP/"
( cd "$TMP" && powershell -NoProfile -ExecutionPolicy Bypass -File ./update-version.ps1 -Android 9.9.9tv -Windows 9.9.9 )
echo "--- ocurrencias nuevas en index.html"; grep -c "9\.9\.9" "$TMP/index.html"
echo "--- restos de la versión vieja"; grep -c "1\.3\.49\|3\.10\.4" "$TMP/index.html" || true
SITE_ROOT="$TMP" node tests/check-site.mjs versioning
echo "$TMP"
```
Expected: el script imprime `Versión actual → Android: 1.3.49tv · Windows: 3.10.4` y termina con `✔ Listo`; el primer conteo es `≥ 8` (4 URLs + textos visibles: badge, hero-fact, dos `version-tag`/`dl-meta`); el segundo conteo `0`; `versioning` → `0 fallidas`. Si el script lanza "No se encontró la URL…", el rediseño rompió los patrones de URL: restaurarlos (ver Global Constraints).

- [ ] **Step 2: Descartar la copia**

Run: `rm -rf "<ruta impresa en el Step 1>"`
Expected: sin salida; `git status --short` no muestra cambios en `index.html`, `README.md` ni `_redirects`.

- [ ] **Step 3: Actualizar `CLAUDE.md` — tabla de estructura**

Edit `CLAUDE.md`. Reemplazar:
```
| `logo.jpeg` | Logo oficial (cóndor rojo/negro dentro de un televisor) |
```
por:
```
| `logo.jpeg` | Logo oficial (cóndor rojo/negro dentro de un televisor) |
| `assets/` | Capturas de la app (`app-*.webp`, 720×1512) y emblema del logo sin fondo (`logo-mark.webp`), generados con ffmpeg a partir de `captura*.jpeg` y `logo.jpeg`. Los originales `captura*.jpeg` están en `.gitignore` |
| `tests/check-site.mjs` | Verificaciones estáticas de `index.html` (sin dependencias): `node tests/check-site.mjs [grupo]`. Correrlo antes de publicar cambios visuales |
```

- [ ] **Step 4: Actualizar `CLAUDE.md` — convención de tokens**

Reemplazar:
```
- Los nombres de variables CSS heredan nombres viejos (`--cyan` es en realidad el rojo `#ec1b2e` de la marca) — no renombrar sin ajustar todos los usos.
```
por:
```
- Diseño "Señal en vivo": tokens en `:root` de `index.html` — `--red` (`#EC1B2E`, único acento de marca), `--red-soft` (texto rojo pequeño), `--bg`, `--surface`, `--surface-2`, `--text`, `--muted`. Tipografías: Archivo (títulos, `font-stretch` ancho), Instrument Sans (texto) y JetBrains Mono (datos y etiquetas). Sin emojis: los iconos son SVG del sprite al inicio del `<body>`.
- Los enlaces de descarga y los textos `Android vX.Y.Z` / `Windows vX.Y.Z` deben seguir con esos patrones exactos y sin repetirse en CSS/JS, para que `update-version.ps1` y el workflow los reemplacen (`node tests/check-site.mjs versioning` lo verifica).
- Los botones "Comprar" de los planes abren WhatsApp con el plan en el mensaje (`https://wa.me/573014518350?text=…`).
```

- [ ] **Step 5: Verificar y commit**

Run: `node tests/check-site.mjs` → `0 fallidas`.
```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md con el nuevo sistema visual, assets y verificación

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Detector de diseño, sincronización con main y entrega

**Files:**
- Modify: `index.html` (solo si el detector señala algo)

- [ ] **Step 1: Ejecutar el detector de Impeccable una sola vez**

Run: `node C:\Users\jarol\.agents\skills\impeccable\scripts\detect.mjs --json index.html`
Expected: lista de hallazgos (JSON). Corregir **todo lo material** en un solo lote (contraste, tamaños táctiles, patrones prohibidos que señale); si algún hallazgo es un falso positivo o contradice una decisión del spec, anotarlo en el mensaje final en lugar de cambiarlo. No volver a ejecutarlo en bucle.

- [ ] **Step 2: Verificación completa**

Run: `node tests/check-site.mjs`
Expected: `0 fallidas`. Si se editó `index.html` en el Step 1, commit:
```bash
git add index.html
git commit -m "fix: ajustes tras el detector de diseño

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 3: Sincronizar con `main` (versiones nuevas publicadas mientras tanto)**

El workflow puede haber subido versiones a `main` en las mismas líneas que se reescribieron.

Run:
```bash
git fetch origin
git log --oneline HEAD..origin/main
```
Si no hay commits nuevos: continuar al Step 4. Si los hay:
```bash
git merge origin/main
```
Si `index.html` entra en conflicto: conservar **nuestra** versión y volver a aplicar las versiones nuevas con el script (que las lee del `index.html`):
```bash
git checkout --ours index.html
git show origin/main:_redirects        # anotar las versiones vigentes (vX.Y.ZZtv y vX.Y.Z)
powershell -NoProfile -ExecutionPolicy Bypass -File ./update-version.ps1 -Android <X.Y.ZZtv> -Windows <X.Y.Z>
node tests/check-site.mjs
git add index.html && git commit --no-edit
```
Expected: `versioning` en `0 fallidas`; `git diff origin/main -- _redirects README.md` vacío.

- [ ] **Step 4: Cerrar la rama**

Invocar `superpowers:finishing-a-development-branch` y presentarle al usuario las opciones (merge a `main`, PR o dejar la rama). **No hacer push a `main` sin confirmación explícita:** despliega Cloudflare Pages automáticamente.

- [ ] **Step 5: Mensaje final al usuario (pendientes)**

Incluir, sin omitir ninguno:
- Confirmar que **10K+ usuarios, 99.9% uptime y 4K** son datos reales.
- Prueba manual de 30 s de `prefers-reduced-motion` (DevTools → Rendering → Emulate CSS `prefers-reduced-motion: reduce`): el teléfono queda fijo y la tira estática.
- Riesgo asumido: capturas con logos (Caracol, CNN) y pósters de terceros publicadas tal cual.
- No hay capturas de Android TV ni Windows: el hero usa el teléfono.
- Opcional: `$impeccable document` para dejar un `DESIGN.md` con el sistema visual, e `$impeccable init` para `PRODUCT.md`.
- `tests/check-site.mjs` queda servido públicamente por Cloudflare Pages (inofensivo, pero es un archivo público).
