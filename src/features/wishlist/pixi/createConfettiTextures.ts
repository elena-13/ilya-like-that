import { Graphics, type Renderer, type Texture } from 'pixi.js';

export type ConfettiTextures = {
  confetti: Texture;
  glitter: Texture;
  sparkle: Texture;
  destroy: () => void;
};

const CONFETTI_WIDTH = 14;
const CONFETTI_HEIGHT = 8;
const CONFETTI_RADIUS = 2;

const GLITTER_RADIUS = 6;
// Facet shades: tinting multiplies them, so each flake reads as a cut metallic gem.
const FACETS = [0xffffff, 0xcfcfcf, 0x8a8a8a, 0xb5b5b5];

const SPARKLE_RADIUS = 14;
const SPARKLE_INNER_RATIO = 0.16;

const bake = (renderer: Renderer, shape: Graphics) => {
  const texture = renderer.generateTexture({
    target: shape,
    resolution: renderer.resolution,
    antialias: true,
  });
  shape.destroy();
  return texture;
};

/** White shapes baked once and shared by every particle; tint them per piece. */
export function createConfettiTextures(renderer: Renderer): ConfettiTextures {
  const confetti = bake(
    renderer,
    new Graphics().roundRect(0, 0, CONFETTI_WIDTH, CONFETTI_HEIGHT, CONFETTI_RADIUS).fill(0xffffff),
  );

  // A diamond in four triangular facets around the centre.
  const r = GLITTER_RADIUS;
  const corners = [
    [0, -r],
    [r, 0],
    [0, r],
    [-r, 0],
  ];
  const diamond = new Graphics();
  corners.forEach(([x, y], index) => {
    const [nextX, nextY] = corners[(index + 1) % corners.length];
    diamond.poly([0, 0, x, y, nextX, nextY]).fill(FACETS[index]);
  });
  const glitter = bake(renderer, diamond);

  const sparkle = bake(
    renderer,
    new Graphics()
      .star(0, 0, 4, SPARKLE_RADIUS, SPARKLE_RADIUS * SPARKLE_INNER_RATIO)
      .fill(0xffffff)
      .circle(0, 0, SPARKLE_RADIUS * 0.22)
      .fill(0xffffff),
  );

  return {
    confetti,
    glitter,
    sparkle,
    destroy: () => [confetti, glitter, sparkle].forEach((texture) => texture.destroy(true)),
  };
}
