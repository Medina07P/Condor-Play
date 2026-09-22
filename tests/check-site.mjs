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
check('foundation', 'sin emojis (todo icono es SVG)', () => ok(!/[\p{Emoji_Presentation}️]/u.test(html), 'hay emojis'));
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
