// Little owl feathers that come loose and drift down, swaying like real ones.
// Plain DOM + Web Animations: they're short-lived decorations, not React state.

// Owl colours: blue-grey back, darker speckle, cream belly.
const COLORS = [
  { vane: '#6f8f96', quill: '#4c6a71' },
  { vane: '#f4efe6', quill: '#cdbba2' },
  { vane: '#5e7f87', quill: '#3f5b61' },
];

const featherSvg = (vane: string, quill: string) => `
<svg viewBox="0 0 20 48" width="100%" style="display:block;overflow:visible" aria-hidden="true">
  <path d="M10 2C15.8 9.5 17.2 24 12.6 38.5L10.2 45L8 38.6C2.9 24.4 4.1 9.8 10 2Z" fill="${vane}"/>
  <path d="M10.3 13.5L14.6 10.8M10.2 21L15.5 18.4M10 28.5L14.9 26.4M9.9 16.5L5.5 13.6M9.8 24.5L4.6 21.8" stroke="${quill}" stroke-width="0.9" stroke-linecap="round" opacity="0.55"/>
  <path d="M10.2 5C10.4 18 10.1 32 10.1 47" stroke="${quill}" stroke-width="1.3" stroke-linecap="round" fill="none"/>
</svg>`;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Lets `count` feathers fall from a point on screen (viewport px).
 * `size` is a feather's width in px; `spread` sends them out to both sides
 * (e.g. from the wing tips); `zIndex` puts them above or below layers.
 */
export function dropFeathers(
  x: number,
  y: number,
  {
    count = 2,
    size = 12,
    spread,
    zIndex = 40,
  }: { count?: number; size?: number; spread?: number; zIndex?: number } = {},
) {
  spread ??= size;
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  for (let i = 0; i < count; i++) {
    const color = COLORS[(i + Math.floor(Math.random() * COLORS.length)) % COLORS.length];
    const w = size * rand(0.8, 1.2);
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = featherSvg(color.vane, color.quill);
    Object.assign(el.style, {
      position: 'fixed',
      left: `${x - w / 2 + (i % 2 ? 1 : -1) * spread + rand(-size, size) * 0.6}px`,
      top: `${y + rand(-size, size) * 0.5}px`,
      width: `${w}px`,
      pointerEvents: 'none',
      zIndex: String(zIndex),
    });
    document.body.appendChild(el);

    // Falls a few owl-heights, swinging side to side like a pendulum,
    // with each feather on its own path and pace.
    const fall = size * rand(14, 20);
    const sway = size * rand(1.8, 2.8);
    const dir = Math.random() < 0.5 ? -1 : 1;
    const tilt = rand(25, 45);
    const steps = 6;
    const keyframes: Keyframe[] = [];
    for (let s = 0; s <= steps; s++) {
      const p = s / steps;
      const side = s === 0 ? 0 : (s % 2 ? 1 : -1) * dir;
      keyframes.push({
        transform: `translate(${side * sway + dir * p * size}px, ${p * fall}px) rotate(${side * tilt + dir * 20}deg)`,
        opacity: p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3,
        easing: 'ease-in-out',
      });
    }
    el.animate(keyframes, {
      duration: rand(2600, 3600),
      delay: i * rand(120, 260),
      fill: 'both',
    }).finished.then(
      () => el.remove(),
      () => el.remove(),
    );
  }
}

/** Speeds the sprite's wing flapping up or down without a frame jump. */
export function setFlapRate(img: HTMLImageElement | null, rate: number) {
  img?.getAnimations().forEach((animation) => (animation.playbackRate = rate));
}
