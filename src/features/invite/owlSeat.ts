import { OWL_MIN_WIDTH, OWL_STATIC } from './config';

// Finds a seat for the resting owl: a fairly flat bump on a hero cloud's
// top edge where the owl is on screen and clear of the title, the tagline
// and the header buttons. Text and buttons reflow differently from the
// clouds at every screen width, so the seat is worked out on the page
// instead of being a fixed spot.
//
// Page markup it reads (set in the home page and HeroClouds):
//   [data-cloud-slot="right" | "left"]  a cloud's box (its drift wrapper)
//   [data-owl-bounds]                   the area the owl must stay inside
//   [data-owl-avoid]                    things it mustn't cover;
//                                       ="text" uses the letters only
//
// When the big clouds have no room (narrow phones, where the title and
// tagline cover them), the owl brings its own small cloud and sits in the
// clearest corner of the hero card instead.

export const CLOUD_SRC = '/cloud-1.webp';
/** Cloud picture height / width. */
export const CLOUD_ASPECT = 2203 / 3320;
/** Columns sampled across the cloud picture. */
const COLUMNS = 240;
/** Share of the owl that shows above the cloud edge. */
export const SHOWN = 0.72;

/** Where the owl sits, as fractions of `container`'s box. */
type SeatSpot = { x: number; edge: number; width: number };

export type Seat =
  /** On one of the hero clouds (container = that cloud's box). */
  | ({ kind: 'cloud'; container: HTMLElement } & SeatSpot)
  /** On its own small cloud, where the big clouds have no room (phones).
   *  `box` places the small cloud in the hero card (fractions of its box);
   *  `owl` places the owl in the small cloud (fractions of the cloud box). */
  | {
      kind: 'perch';
      container: HTMLElement;
      box: { left: number; top: number; width: number };
      owl: SeatSpot;
    };

let profile: Promise<Float32Array | null> | null = null;

/** Top edge of the cloud picture, per column, as a fraction of its height
 *  (NaN where a column is empty). Read once from the image's alpha. */
function loadCloudProfile() {
  return (profile ??= new Promise<Float32Array | null>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const w = COLUMNS;
      const h = Math.round((COLUMNS * image.naturalHeight) / image.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return resolve(null);
      ctx.drawImage(image, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      const edges = new Float32Array(w).fill(NaN);
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          if (data[(y * w + x) * 4 + 3] > 140) {
            edges[x] = y / h;
            break;
          }
        }
      }
      resolve(edges);
    };
    image.onerror = () => resolve(null);
    image.src = CLOUD_SRC;
  }));
}

type Box = { left: number; top: number; right: number; bottom: number };

const overlaps = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

let measureCtx: CanvasRenderingContext2D | null = null;

/** Ink boxes of each letter in `el`: a text line's box includes the font's
 *  empty space above and below the letters and the gaps beside short words,
 *  which on phones covers every cloud bump near the title. */
function glyphBoxes(el: HTMLElement): Box[] {
  measureCtx ??= document.createElement('canvas').getContext('2d');
  const ctx = measureCtx;
  if (!ctx) return [];
  const style = getComputedStyle(el);
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const boxes: Box[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';
    for (let i = 0; i < text.length; i++) {
      if (!text[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      const m = ctx.measureText(text[i]);
      // The glyph box spans the font's ascent + descent; place the letter's
      // own ink inside it around the baseline.
      const fontHeight = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
      const baseline = r.top + (r.height - fontHeight) / 2 + m.fontBoundingBoxAscent;
      boxes.push({
        left: r.left,
        right: r.right,
        top: baseline - m.actualBoundingBoxAscent,
        bottom: baseline + m.actualBoundingBoxDescent,
      });
    }
  }
  return boxes;
}

function avoidBoxes(pad: number, textPad: number): Box[] {
  const boxes: Box[] = [];
  const grow = (b: Box, p: number) => ({
    left: b.left - p,
    top: b.top - p,
    right: b.right + p,
    bottom: b.bottom + p,
  });
  document.querySelectorAll<HTMLElement>('[data-owl-avoid]').forEach((el) => {
    if (el.dataset.owlAvoid === 'text') {
      glyphBoxes(el).forEach((b) => boxes.push(grow(b, textPad)));
    } else {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) boxes.push(grow(r, pad));
    }
  });
  return boxes;
}

/** Columns either side of `i` that the owl's body covers. */
const bodyColumns = (owlW: number, cloudW: number) =>
  Math.max(1, Math.ceil(((owlW * 0.35) / cloudW) * COLUMNS));

/** Flat enough to sit on: under the owl's body the cloud mustn't drop away
 *  further than the owl's hidden part, or its feet would show. */
function flatEnough(
  edgeAt: (i: number) => number,
  i: number,
  half: number,
  cloudH: number,
  owlH: number,
) {
  const edge = edgeAt(i);
  if (Number.isNaN(edge)) return false;
  for (let j = i - half; j <= i + half; j++) {
    const e = edgeAt(j);
    if (Number.isNaN(e) || (e - edge) * cloudH > owlH * (1 - SHOWN) * 0.95) return false;
  }
  return true;
}

/** Best seat: a bump on the right cloud near its usual peeking spot, then
 *  the left cloud, then the owl's own small cloud. Null if nothing fits. */
export async function findOwlSeat(root: ParentNode = document): Promise<Seat | null> {
  const edges = await loadCloudProfile();
  if (!edges) return null;

  const boundsEl = root.querySelector<HTMLElement>('[data-owl-bounds]');
  const bounds = boundsEl?.getBoundingClientRect();
  if (!boundsEl || !bounds?.width) return null;

  const onScreen = (b: Box, belowFoldOk = false, margin = 8) =>
    b.left >= bounds.left + margin &&
    b.right <= bounds.right - margin &&
    b.top >= bounds.top + margin &&
    b.bottom <= bounds.bottom - margin &&
    (belowFoldOk || b.bottom + window.scrollY <= window.innerHeight - 8);

  // 1. On a big cloud.
  const preferred = { right: 0.33, left: 0.67 };
  let best: { seat: Seat; score: number } | null = null;

  for (const side of ['right', 'left'] as const) {
    const container = root.querySelector<HTMLElement>(`[data-cloud-slot="${side}"]`);
    if (!container) continue;
    const box = container.getBoundingClientRect();
    if (!box.width || !box.height) continue;

    const owlW = Math.min(120, Math.max(OWL_MIN_WIDTH, box.width * 0.09));
    const owlH = owlW * OWL_STATIC.aspect;
    // Room for the clouds' drift and pointer parallax. Letters get a
    // smaller margin: brushing one while drifting just looks like peeking.
    const pad = Math.max(10, box.width * 0.025);
    const avoid = avoidBoxes(pad, Math.max(6, pad * 0.5));
    const half = bodyColumns(owlW, box.width);
    // The left cloud picture is mirrored.
    const edgeAt = (i: number) => edges[side === 'left' ? COLUMNS - 1 - i : i];

    for (let i = half; i < COLUMNS - half; i++) {
      if (!flatEnough(edgeAt, i, half, box.height, owlH)) continue;
      const edge = edgeAt(i);
      const fx = (i + 0.5) / COLUMNS;
      const cx = box.left + fx * box.width;
      const cy = box.top + edge * box.height;
      const owl: Box = {
        left: cx - owlW / 2,
        right: cx + owlW / 2,
        top: cy - SHOWN * owlH,
        bottom: cy,
      };
      if (!onScreen(owl) || avoid.some((a) => overlaps(owl, a))) continue;

      const score = (side === 'right' ? 0 : 1) + Math.abs(fx - preferred[side]);
      if (!best || score < best.score) {
        best = {
          seat: { kind: 'cloud', container, x: fx, edge, width: owlW / box.width },
          score,
        };
      }
    }
  }
  if (best) return best.seat;

  // 2. On its own small cloud, in a clear patch of the hero card.
  const owlW = Math.max(OWL_MIN_WIDTH, Math.min(72, bounds.width * 0.11));
  const owlH = owlW * OWL_STATIC.aspect;
  const cloudW = owlW * 2.1;
  const cloudH = cloudW * CLOUD_ASPECT;
  // The owl sits on the highest flat bump near the middle of the cloud.
  const half = bodyColumns(owlW, cloudW);
  const edgeAt = (i: number) => edges[i];
  let peak: { i: number; edge: number } | null = null;
  for (let i = Math.floor(COLUMNS * 0.3); i < COLUMNS * 0.7; i++) {
    if (!flatEnough(edgeAt, i, half, cloudH, owlH)) continue;
    if (!peak || edges[i] < peak.edge) peak = { i, edge: edges[i] };
  }
  if (!peak) return null;
  const peakX = (peak.i + 0.5) / COLUMNS;
  const avoid = avoidBoxes(10, 6);

  // Like the hero clouds, the small cloud may be cut off by the card's
  // edges: only the owl and the top of its cloud need to be inside.
  const cloudShown = 0.45;
  let perch: { left: number; top: number; score: number } | null = null;
  for (let top = bounds.top; top + cloudH * cloudShown <= bounds.bottom; top += 4) {
    for (let left = bounds.left - cloudW * 0.3; left + cloudW * 0.7 <= bounds.right; left += 4) {
      const ox = left + peakX * cloudW;
      const owl: Box = {
        left: ox - owlW / 2,
        right: ox + owlW / 2,
        top: top + peak.edge * cloudH - SHOWN * owlH,
        bottom: top + peak.edge * cloudH,
      };
      // Owl clear of the card's rounded corners and edges.
      const aboveFold = onScreen(owl, false, 16);
      if (!aboveFold && !onScreen(owl, true, 16)) continue;
      const cloud: Box = {
        left: Math.max(left, bounds.left),
        right: Math.min(left + cloudW, bounds.right),
        top,
        bottom: Math.min(top + cloudH, bounds.bottom),
      };
      if (avoid.some((a) => overlaps(owl, a) || overlaps(cloud, a))) continue;
      // Bottom-right corner first; anything on the first screen beats
      // anything below it.
      const score =
        (aboveFold ? 0 : 10) +
        (bounds.right - owl.right) / bounds.width +
        (bounds.bottom - cloud.bottom) / bounds.height;
      if (!perch || score < perch.score) perch = { left, top, score };
    }
  }
  if (!perch) return null;

  return {
    kind: 'perch',
    container: boundsEl,
    box: {
      left: (perch.left - bounds.left) / bounds.width,
      top: (perch.top - bounds.top) / bounds.height,
      width: cloudW / bounds.width,
    },
    owl: { x: peakX, edge: peak.edge, width: owlW / cloudW },
  };
}
