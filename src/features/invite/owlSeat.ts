import { OWL_STATIC } from './config';

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
//                                       ="text" uses the text lines only

const CLOUD_SRC = '/cloud-1.webp';
/** Columns sampled across the cloud picture. */
const COLUMNS = 240;
/** Share of the owl that shows above the cloud edge. */
export const SHOWN = 0.72;

export type Seat = {
  side: 'left' | 'right';
  container: HTMLElement;
  /** Fractions of the container box. */
  x: number;
  edge: number;
  width: number;
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

function avoidBoxes(pad: number): Box[] {
  const boxes: Box[] = [];
  document.querySelectorAll<HTMLElement>('[data-owl-avoid]').forEach((el) => {
    let rects: DOMRect[];
    if (el.dataset.owlAvoid === 'text') {
      const range = document.createRange();
      range.selectNodeContents(el);
      rects = [...range.getClientRects()];
    } else {
      rects = [el.getBoundingClientRect()];
    }
    for (const r of rects) {
      if (r.width && r.height) {
        boxes.push({
          left: r.left - pad,
          top: r.top - pad,
          right: r.right + pad,
          bottom: r.bottom + pad,
        });
      }
    }
  });
  return boxes;
}

/** Best seat on the clouds, or null if none is clear. Prefers the right
 *  cloud near its usual peeking spot, then the left cloud. */
export async function findOwlSeat(root: ParentNode = document): Promise<Seat | null> {
  const edges = await loadCloudProfile();
  if (!edges) return null;

  const boundsEl = root.querySelector<HTMLElement>('[data-owl-bounds]');
  const bounds = boundsEl?.getBoundingClientRect();
  if (!bounds) return null;

  const preferred = { right: 0.33, left: 0.67 };
  let best: (Seat & { score: number }) | null = null;

  for (const side of ['right', 'left'] as const) {
    const container = root.querySelector<HTMLElement>(`[data-cloud-slot="${side}"]`);
    if (!container) continue;
    const box = container.getBoundingClientRect();
    if (!box.width || !box.height) continue;

    const owlW = Math.min(120, Math.max(46, box.width * 0.09));
    const owlH = owlW * OWL_STATIC.aspect;
    // Room for the clouds' drift and pointer parallax.
    const pad = Math.max(10, box.width * 0.025);
    const avoid = avoidBoxes(pad);
    const halfCols = Math.max(1, Math.ceil(((owlW * 0.35) / box.width) * COLUMNS));
    // The left cloud picture is mirrored.
    const edgeAt = (i: number) => edges[side === 'left' ? COLUMNS - 1 - i : i];

    for (let i = halfCols; i < COLUMNS - halfCols; i++) {
      const edge = edgeAt(i);
      if (Number.isNaN(edge)) continue;

      // Flat enough: under the owl's body the cloud mustn't drop away
      // much, or its hidden feet would show.
      let lowest = edge;
      for (let j = i - halfCols; j <= i + halfCols; j++) {
        const e = edgeAt(j);
        lowest = Number.isNaN(e) ? Infinity : Math.max(lowest, e);
      }
      if ((lowest - edge) * box.height > owlH * 0.2) continue;

      const fx = (i + 0.5) / COLUMNS;
      const cx = box.left + fx * box.width;
      const cy = box.top + edge * box.height;
      const owl: Box = {
        left: cx - owlW / 2,
        right: cx + owlW / 2,
        top: cy - SHOWN * owlH,
        bottom: cy,
      };
      // On screen: inside the hero card and above the fold.
      if (
        owl.left < bounds.left + 8 ||
        owl.right > bounds.right - 8 ||
        owl.top < bounds.top + 8 ||
        owl.bottom + window.scrollY > window.innerHeight - 8
      ) {
        continue;
      }
      if (avoid.some((a) => overlaps(owl, a))) continue;

      const score = (side === 'right' ? 0 : 1) + Math.abs(fx - preferred[side]);
      if (!best || score < best.score) {
        best = { side, container, x: fx, edge, width: owlW / box.width, score };
      }
    }
  }
  return best;
}
