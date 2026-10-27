import { ParticleContainer, type Application, type Ticker } from 'pixi.js';

import { clamp } from '@/lib/random';
import { createStar, updateStar, type Star } from './star';
import { createStarTexture } from './createStarTexture';
import {
  FADE_MS,
  FADE_START_MS,
  MAX_STARS,
  MIN_STARS,
  OFFSCREEN_MARGIN,
  SPAWN_MS,
  STARS_PER_PIXEL_OF_WIDTH,
} from './starShowerConfig';

export type StarShower = {
  play: () => void;
  destroy: () => void;
};

const getStarCount = (screenWidth: number) =>
  clamp(Math.round(screenWidth * STARS_PER_PIXEL_OF_WIDTH), MIN_STARS, MAX_STARS);

const getFade = (elapsedMs: number) => 1 - clamp((elapsedMs - FADE_START_MS) / FADE_MS, 0, 1);

/** Runs the app's ticker only while stars are on screen. */
export function createStarShower(app: Application): StarShower {
  const texture = createStarTexture(app.renderer);
  const container = new ParticleContainer({
    texture,
    dynamicProperties: { position: true, rotation: true, color: true, vertex: false, uvs: false },
  });
  app.stage.addChild(container);

  let stars: Star[] = [];
  let elapsedMs = 0;
  let spawnedCount = 0;
  let targetCount = 0;
  let isRunning = false;
  let isDestroyed = false;

  const spawnDueStars = () => {
    const dueCount = Math.min(targetCount, Math.ceil((targetCount * elapsedMs) / SPAWN_MS));

    for (; spawnedCount < dueCount; spawnedCount++) {
      const star = createStar(texture, app.screen.width);
      container.addParticle(star.particle);
      stars.push(star);
    }
  };

  const stop = () => {
    isRunning = false;
    app.ticker.remove(update);
    app.render(); // clear the last frame
    app.stop();
  };

  const update = (ticker: Ticker) => {
    elapsedMs += ticker.deltaMS;
    spawnDueStars();

    const fade = getFade(elapsedMs);
    const bottom = app.screen.height + OFFSCREEN_MARGIN;

    stars = stars.filter((star) => {
      updateStar(star, ticker.deltaTime, elapsedMs, fade);

      const isVisible = fade > 0 && star.particle.y <= bottom;
      if (!isVisible) container.removeParticle(star.particle);
      return isVisible;
    });

    if (spawnedCount >= targetCount && stars.length === 0) stop();
  };

  const play = () => {
    elapsedMs = 0;
    spawnedCount = 0;
    targetCount = getStarCount(app.screen.width);

    if (isRunning || isDestroyed) return;
    isRunning = true;
    app.ticker.add(update);
    app.start();
  };

  const destroy = () => {
    isDestroyed = true;
    app.ticker.remove(update);
    container.destroy();
    texture.destroy(true);
  };

  return { play, destroy };
}
