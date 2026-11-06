import { OWL_STATIC } from './config';

// The resting owl, inlined as SVG markup (not an <img>) so its ear and eyes
// can move. Fetched once and shared by every owl on the page.

let markup: Promise<string> | null = null;
let copies = 0;
export const loadOwlSvg = () =>
  (markup ??= fetch(OWL_STATIC.src).then((response) => response.text()));

/** Puts the owl SVG into `host` (once), sized to the host's width. */
export async function injectOwlSvg(host: HTMLElement) {
  let svgText = await loadOwlSvg();
  if (host.firstElementChild) return;
  // Each copy gets its own gradient/filter/clip ids: with two owls on the
  // page, url(#id) would otherwise point into the other copy, and if that
  // one is hidden (display: none) Chrome draws nothing for it.
  const suffix = `-${++copies}`;
  const referenced = new Set([...svgText.matchAll(/url\(#([\w-]+)\)/g)].map((m) => m[1]));
  for (const id of referenced) {
    svgText = svgText
      .replaceAll(`id="${id}"`, `id="${id}${suffix}"`)
      .replaceAll(`url(#${id})`, `url(#${id}${suffix})`);
  }
  host.innerHTML = svgText;
  const svg = host.querySelector('svg');
  svg?.setAttribute('width', '100%');
  svg?.removeAttribute('height');
  svg?.style.setProperty('display', 'block');
}

/** Closes the owl's eyes for a moment (twice when `double`). */
export function blinkOwl(host: HTMLElement, { delay = 0, double = false } = {}) {
  const eyes = host.querySelector<SVGElement>('#eyes');
  if (!eyes) return [];
  eyes.style.transformBox = 'fill-box';
  eyes.style.transformOrigin = '50% 50%';
  const blink = [
    { transform: 'scaleY(1)' },
    { transform: 'scaleY(0.08)', offset: 0.45 },
    { transform: 'scaleY(1)' },
  ];
  const options = { duration: 220, easing: 'ease-in-out' };
  const animations = [eyes.animate(blink, { ...options, delay })];
  if (double) animations.push(eyes.animate(blink, { ...options, delay: delay + 450 }));
  return animations;
}

/** Flicks the owl's right ear, like an animal listening. */
export function flickEar(host: HTMLElement, { delay = 0 } = {}) {
  const ear = host.querySelector<SVGElement>('#ear-right');
  if (!ear) return null;
  ear.style.transformBox = 'fill-box';
  ear.style.transformOrigin = '35% 100%';
  return ear.animate(
    [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(24deg)', offset: 0.3 },
      { transform: 'rotate(-7deg)', offset: 0.65 },
      { transform: 'rotate(0deg)' },
    ],
    { duration: 320, delay, easing: 'ease-out' },
  );
}
