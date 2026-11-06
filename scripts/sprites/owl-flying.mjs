// Generates the flying-owl sprite sheet: an owl flapping its wings while
// carrying an envelope in its feet.
//
//   node scripts/sprites/owl-flying.mjs
//
// Writes two sheets to public/sprites/: owl-flying (carrying the envelope) and
// owl-flying-empty (after dropping it), each as .svg (vector source, all
// frames side by side) and .webp (the raster sheet the site uses).
// Rasterizing uses Playwright's Chromium and `cwebp`.

import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = resolve(ROOT, 'public/sprites');

export const FRAMES = 8;
// One frame in owl coordinates (the static owl is drawn in a 300x460 box).
const VIEW = { x: -190, y: -40, w: 680, h: 620 };
// Size of one frame in the raster sheet: 2x the largest on-screen owl
// (560px wide), so it stays sharp on retina screens.
const RASTER_FRAME_W = 1120;
const RASTER_FRAME_H = Math.round((RASTER_FRAME_W * VIEW.h) / VIEW.w);

// Deterministic random so the speckles don't move between runs.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(7);
const between = (a, b) => a + rand() * (b - a);
const f = (n) => n.toFixed(1);

// ---------- static parts (same in every frame) ----------

const BODY =
  'M150 22 C215 22 252 35 254 90 C258 160 262 260 258 330 C254 400 210 440 150 440 C90 440 46 400 42 330 C38 260 42 160 46 90 C48 35 85 22 150 22 Z';

function speckles() {
  const inFace = (x, y) => ((x - 150) / 90) ** 2 + ((y - 112) / 66) ** 2 < 1;
  const out = [];
  for (let row = 0; row < 14; row++) {
    for (let i = 0; i < 13; i++) {
      const x = 50 + i * 16.5 + (row % 2 ? 8 : 0) + between(-3, 3);
      const y = 40 + row * 17 + between(-3, 3);
      const rx = between(3.2, 4.6);
      const ry = between(1.5, 2.2);
      const rot = between(-15, 15);
      if (inFace(x, y) || x < 52 || x > 250) continue;
      const op = Math.max(0.12, 0.75 - Math.max(0, y - 150) / 160);
      out.push(
        `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${rot.toFixed(0)} ${f(x)} ${f(y)})" opacity="${op.toFixed(2)}"/>`,
      );
    }
  }
  return out.join('');
}

// A spread wing pointing straight down from the shoulder at (0,0).
// Local -x is the leading edge, +x the trailing edge with feather tips.
const WING =
  'M-24 -8 C-44 40 -46 124 -28 204 C-22 228 -6 242 8 244 ' +
  'Q16 232 14 220 Q28 216 26 202 Q40 194 36 180 Q48 168 42 152 Q52 132 44 112 ' +
  'C48 72 42 30 26 -8 Z';

function wingMarks() {
  const out = [];
  for (let row = 0; row < 8; row++) {
    const y = 30 + row * 24;
    const cols = row < 6 ? 3 : 2;
    for (let c = 0; c < cols; c++) {
      const x = -18 + c * 16 + (row % 2 ? 7 : 0) + between(-2, 2);
      const yy = y + between(-3, 3);
      const h = between(9, 14);
      out.push(
        `<rect x="${f(x - 1.4)}" y="${f(yy - h / 2)}" width="2.8" height="${f(h)}" rx="1.4" transform="rotate(${between(-8, 8).toFixed(0)} ${f(x)} ${f(yy)})"/>`,
      );
    }
  }
  return out.join('');
}

// Same drawing as HandHeartIcon (src/features/wishlist/components/HandIcons.tsx).
const HEART_PATHS =
  '<path d="M12 19.2C9.6 17.4 6.9 15.3 5.3 12.9C3.9 10.8 4.2 7.9 6.3 6.6C8.4 5.4 10.8 6.3 11.9 8.6C13.1 6.2 15.6 5.1 17.8 6.4C19.9 7.7 20.2 10.6 18.8 12.7C17.3 15.1 14.6 17.3 12.3 19"/>' +
  '<path d="M7.5 9.6C7.6 8.8 8.1 8.2 8.9 8" stroke-width="1.5"/>';

const SPECKLES = speckles();
const WING_MARKS = wingMarks();

const DEFS = `
  <defs>
    <linearGradient id="owl-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7d9ca2"/>
      <stop offset="0.38" stop-color="#8eaaad"/>
      <stop offset="0.52" stop-color="#cdd2c6"/>
      <stop offset="0.64" stop-color="#f2e6d1"/>
      <stop offset="0.85" stop-color="#fbf6ee"/>
      <stop offset="1" stop-color="#f7efe3"/>
    </linearGradient>
    <linearGradient id="owl-wing" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="244">
      <stop offset="0" stop-color="#b3a593"/>
      <stop offset="0.55" stop-color="#c0b3a2"/>
      <stop offset="1" stop-color="#a99a88"/>
    </linearGradient>
    <radialGradient id="owl-belly" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fffdf8" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#fffdf8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="envelope" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fffaf2"/>
      <stop offset="1" stop-color="#f3e7d5"/>
    </linearGradient>
    <filter id="owl-paint" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3"/>
    </filter>
    <clipPath id="owl-body-clip"><path d="${BODY}"/></clipPath>
    <g id="wing">
      <path d="${WING}" fill="url(#owl-wing)" filter="url(#owl-paint)"/>
      <path d="M-6 150 Q2 196 6 236 M10 140 Q18 182 20 214" stroke="#9c8d7b" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
      <g fill="#f4efe6" opacity="0.85">${WING_MARKS}</g>
    </g>
    <g id="owl-torso">
      <g fill="#6f8f96">
        <path d="M62 52 L42 18 L54 30 L50 10 L62 30 L68 14 L74 44 Z"/>
        <path d="M238 52 L258 18 L246 30 L250 10 L238 30 L232 14 L226 44 Z"/>
      </g>
      <g filter="url(#owl-paint)">
        <path d="${BODY}" fill="url(#owl-body)"/>
        <ellipse cx="150" cy="350" rx="80" ry="70" fill="url(#owl-belly)"/>
      </g>
      <g fill="#5e7f87" clip-path="url(#owl-body-clip)">${SPECKLES}</g>
      <path d="M150 70 C175 50 226 48 233 90 C239 132 214 166 150 169 C86 166 61 132 67 90 C74 48 125 50 150 70 Z" fill="#f8f2e8" filter="url(#owl-paint)"/>
      <circle cx="112" cy="114" r="11.5" fill="#1b1b1d"/>
      <circle cx="108.5" cy="109.5" r="3.6" fill="#fff"/>
      <circle cx="115.5" cy="118.5" r="1.4" fill="#fff" opacity="0.8"/>
      <circle cx="188" cy="114" r="11.5" fill="#1b1b1d"/>
      <circle cx="184.5" cy="109.5" r="3.6" fill="#fff"/>
      <circle cx="191.5" cy="118.5" r="1.4" fill="#fff" opacity="0.8"/>
      <path d="M140 124 Q150 120 160 124 L151.5 147 Q150 150 148.5 147 Z" fill="#d6b48a"/>
    </g>
    <g id="envelope-shape">
      <rect x="-88" y="0" width="176" height="114" rx="6" fill="url(#envelope)" stroke="#cdbba2" stroke-width="2.5"/>
      <path d="M-86 108 L-14 56 M86 108 L14 56" stroke="#e2d4bf" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M-86 4 L0 66 L86 4" stroke="#cdbba2" stroke-width="2.5" stroke-linejoin="round" fill="#fbf3e7"/>
      <!-- heart seal: HandHeartIcon as a sticker (Log in icon colours), 22.9 wide -->
      <g transform="translate(-11.45 77.55) scale(0.6026) translate(7 7)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <g fill="#f78fb0" stroke="#f78fb0" stroke-width="13">${HEART_PATHS}</g>
        <g stroke="#7a1e3a" stroke-width="1.9">${HEART_PATHS}</g>
      </g>
    </g>
  </defs>`;

// Feet curled over the envelope's top edge (envelope top sits at y=432).
const FEET = `
  <g stroke="#dba85c" stroke-width="4.5" stroke-linecap="round" fill="none">
    <path d="M104 420 Q98 434 104 444"/><path d="M114 422 Q110 436 116 446"/><path d="M124 423 Q122 437 128 446"/>
    <path d="M176 423 Q178 437 172 446"/><path d="M186 422 Q190 436 184 446"/><path d="M196 420 Q202 434 196 444"/>
  </g>`;

// Feet hanging free, once the envelope has been dropped.
const FEET_EMPTY = `
  <g stroke="#dba85c" stroke-width="4.5" stroke-linecap="round" fill="none">
    <path d="M104 426 Q100 436 98 444"/><path d="M112 428 Q110 438 109 446"/><path d="M120 429 Q120 439 120 446"/>
    <path d="M180 429 Q180 439 180 446"/><path d="M188 428 Q190 438 191 446"/><path d="M196 426 Q200 436 202 444"/>
  </g>`;

// ---------- one frame ----------

function frame(i, { envelope }) {
  const t = i / FRAMES; // 0..1 through one flap
  const phase = 2 * Math.PI * t;
  // Wing angle from "hanging down": 90 is straight out to the side.
  // t=0: wings up; t=0.5: wings down.
  const angle = 92 + 52 * Math.cos(phase);
  // Wings look shortest at the top and bottom of the stroke (foreshortening).
  const length = 0.78 + 0.22 * Math.abs(Math.sin((angle * Math.PI) / 180));
  // The body rises on the downstroke.
  const bob = 9 * Math.cos(phase);
  // The envelope swings a little behind the body.
  const swing = 4 * Math.sin(phase - 0.8);

  const wing = (x, mirror) =>
    `<use href="#wing" transform="translate(${x} 200) scale(${mirror ? -1 : 1} 1) rotate(${f(angle)}) scale(1 ${length.toFixed(3)})"/>`;

  const parcel = envelope
    ? `<g transform="rotate(${f(swing)} 150 430)"><use href="#envelope-shape" transform="translate(150 432)"/></g>`
    : '';

  return `
  <g transform="translate(0 ${f(bob)})">
    ${wing(72, false)}
    ${wing(228, true)}
    ${parcel}
    <use href="#owl-torso"/>
    ${envelope ? FEET : FEET_EMPTY}
  </g>`;
}

// ---------- sheets ----------

const sheetW = VIEW.w * FRAMES;
const rasterW = RASTER_FRAME_W * FRAMES;

function sheetSvg(options) {
  const frames = Array.from(
    { length: FRAMES },
    (_, i) =>
      `<svg x="${i * VIEW.w}" y="0" width="${VIEW.w}" height="${VIEW.h}" viewBox="${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}" overflow="hidden">${frame(i, options)}</svg>`,
  ).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sheetW} ${VIEW.h}" width="${sheetW}" height="${VIEW.h}">
  <!-- Generated by scripts/sprites/owl-flying.mjs: ${FRAMES} frames, ${VIEW.w}x${VIEW.h} each, left to right. -->
${DEFS}
${frames}
</svg>
`;
}

const SHEETS = [
  { name: 'owl-flying', envelope: true },
  { name: 'owl-flying-empty', envelope: false },
];

mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: rasterW, height: RASTER_FRAME_H } });

  for (const sheet of SHEETS) {
    const svg = sheetSvg(sheet);
    writeFileSync(resolve(OUT_DIR, `${sheet.name}.svg`), svg);

    // Rasterize with a transparent background, then compress to WebP.
    const pngPath = resolve(OUT_DIR, `${sheet.name}.tmp.png`);
    const inline = svg.replace(
      `width="${sheetW}" height="${VIEW.h}"`,
      `width="${rasterW}" height="${RASTER_FRAME_H}" style="display:block"`,
    );
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${inline}</body></html>`,
    );
    await page.screenshot({ path: pngPath, omitBackground: true });
    execFileSync('cwebp', [
      '-quiet',
      '-q',
      '90',
      '-alpha_q',
      '100',
      pngPath,
      '-o',
      resolve(OUT_DIR, `${sheet.name}.webp`),
    ]);
    rmSync(pngPath);
  }
} finally {
  await browser.close();
}

console.log(
  `owl sprites: ${SHEETS.map((s) => s.name).join(', ')}; ${FRAMES} frames, ${RASTER_FRAME_W}x${RASTER_FRAME_H} each (sheet ${rasterW}x${RASTER_FRAME_H})`,
);
