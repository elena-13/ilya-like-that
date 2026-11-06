import { ParticleContainer, type Application, type Texture, type Ticker } from 'pixi.js';

import { clamp, pickRandom } from '@/lib/random';
import {
  CANCEL_FADE_MS,
  CONFETTI,
  GLITTER,
  OFFSCREEN_MARGIN,
  SPARKLE_WINDOW_MS,
  SPARKLES_PER_SECOND,
  type PieceKind,
} from './confettiConfig';
import { createConfettiTextures } from './createConfettiTextures';
import {
  createPiece,
  createSparkle,
  isGlinting,
  updatePiece,
  updateSparkle,
  type Piece,
  type Point,
  type Sparkle,
} from './piece';

export type ConfettiBurst = {
  /** Bursts from `origin` (viewport pixels), or from the lower middle of the screen. */
  play: (origin?: Point) => void;
  /** Quickly fades out whatever is on screen. */
  cancel: () => void;
  destroy: () => void;
};

const getCount = (kind: PieceKind, screenWidth: number) =>
  clamp(Math.round(screenWidth * kind.perPixel), kind.count[0], kind.count[1]);

const createContainer = (texture: Texture) =>
  new ParticleContainer({
    texture,
    dynamicProperties: { position: true, rotation: true, color: true, vertex: true, uvs: false },
  });

/** Runs the app's ticker only while pieces are on screen. */
export function createConfettiBurst(app: Application): ConfettiBurst {
  const textures = createConfettiTextures(app.renderer);
  // Paper underneath, glitter over it, sparkles on top.
  const paperLayer = createContainer(textures.confetti);
  const glitterLayer = createContainer(textures.glitter);
  const sparkleLayer = createContainer(textures.sparkle);
  app.stage.addChild(paperLayer, glitterLayer, sparkleLayer);

  let pieces: Piece[] = [];
  let sparkles: Sparkle[] = [];
  let sinceBurstMs = 0;
  let sparkleBudget = 0;
  let cancelledMs: number | null = null;
  let isRunning = false;
  let isDestroyed = false;

  const layerOf = (piece: Piece) => (piece.look === 'paper' ? paperLayer : glitterLayer);

  const spawn = (kind: PieceKind, look: Piece['look'], texture: Texture, origin: Point) => {
    const layer = look === 'paper' ? paperLayer : glitterLayer;
    const count = getCount(kind, app.screen.width);

    for (let i = 0; i < count; i++) {
      const piece = createPiece(texture, kind, look, origin);
      layer.addParticle(piece.particle);
      pieces.push(piece);
    }
  };

  const spawnSparkles = (deltaMs: number) => {
    if (sinceBurstMs > SPARKLE_WINDOW_MS) return;

    sparkleBudget += (SPARKLES_PER_SECOND * deltaMs) / 1000;
    const glinting = pieces.filter(isGlinting);

    for (; sparkleBudget >= 1 && glinting.length > 0; sparkleBudget--) {
      const host = pickRandom(glinting).particle;
      const sparkle = createSparkle(textures.sparkle, { x: host.x, y: host.y });
      sparkleLayer.addParticle(sparkle.particle);
      sparkles.push(sparkle);
    }
  };

  const clear = () => {
    pieces.forEach((piece) => layerOf(piece).removeParticle(piece.particle));
    sparkles.forEach((sparkle) => sparkleLayer.removeParticle(sparkle.particle));
    pieces = [];
    sparkles = [];
  };

  const stop = () => {
    isRunning = false;
    cancelledMs = null;
    app.ticker.remove(update);
    app.render(); // clear the last frame
    app.stop();
  };

  const update = (ticker: Ticker) => {
    const deltaMs = ticker.deltaMS;
    sinceBurstMs += deltaMs;

    let fade = 1;
    if (cancelledMs !== null) {
      cancelledMs += deltaMs;
      fade = 1 - clamp(cancelledMs / CANCEL_FADE_MS, 0, 1);
    }

    const bottom = app.screen.height + OFFSCREEN_MARGIN;

    pieces = pieces.filter((piece) => {
      const isAlive =
        updatePiece(piece, ticker.deltaTime, deltaMs, fade) && piece.particle.y <= bottom;
      if (!isAlive) layerOf(piece).removeParticle(piece.particle);
      return isAlive;
    });

    if (cancelledMs === null) spawnSparkles(deltaMs);

    sparkles = sparkles.filter((sparkle) => {
      const isAlive = updateSparkle(sparkle, deltaMs, fade);
      if (!isAlive) sparkleLayer.removeParticle(sparkle.particle);
      return isAlive;
    });

    if (pieces.length === 0 && sparkles.length === 0) stop();
  };

  const play = (origin?: Point) => {
    if (isDestroyed) return;

    const from = origin ?? { x: app.screen.width / 2, y: app.screen.height * 0.7 };
    if (cancelledMs !== null) clear();
    cancelledMs = null;
    sinceBurstMs = 0;
    sparkleBudget = 0;

    spawn(CONFETTI, 'paper', textures.confetti, from);
    spawn(GLITTER, 'glitter', textures.glitter, from);

    if (isRunning) return;
    isRunning = true;
    app.ticker.add(update);
    app.start();
  };

  const cancel = () => {
    if (isRunning && cancelledMs === null) cancelledMs = 0;
  };

  const destroy = () => {
    isDestroyed = true;
    app.ticker.remove(update);
    paperLayer.destroy();
    glitterLayer.destroy();
    sparkleLayer.destroy();
    textures.destroy();
  };

  return { play, cancel, destroy };
}
