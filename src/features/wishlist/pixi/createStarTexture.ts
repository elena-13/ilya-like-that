import { Graphics, type Renderer, type Texture } from 'pixi.js';

const STAR_POINTS = 5;
const STAR_RADIUS = 32;
const STAR_INNER_RATIO = 0.45;

/** A white star baked once and shared by every particle; tint it per star. */
export function createStarTexture(renderer: Renderer): Texture {
  const star = new Graphics()
    .star(0, 0, STAR_POINTS, STAR_RADIUS, STAR_RADIUS * STAR_INNER_RATIO)
    .fill(0xffffff);

  const texture = renderer.generateTexture({
    target: star,
    resolution: renderer.resolution,
    antialias: true,
  });
  star.destroy();

  return texture;
}
