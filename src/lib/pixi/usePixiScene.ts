'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { Application, type ApplicationOptions } from 'pixi.js';

type Scene = { destroy: () => void };

/**
 * Mounts a Pixi app in `hostRef`, builds a scene on it once ready, and tears
 * both down on unmount. Returns the scene, or `null` while loading.
 */
export function usePixiScene<T extends Scene>(
  hostRef: RefObject<HTMLElement | null>,
  getOptions: () => Partial<ApplicationOptions>,
  createScene: (app: Application) => T,
) {
  const [scene, setScene] = useState<T | null>(null);
  const getOptionsRef = useRef(getOptions);
  const createSceneRef = useRef(createScene);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const app = new Application();
    let currentScene: T | null = null;
    // Cleanup can run before the async init finishes; whichever runs last destroys.
    let initialized = false;
    let disposed = false;

    const destroyApp = () => app.destroy({ removeView: true }, { children: true, texture: true });

    app
      .init(getOptionsRef.current())
      .then(() => {
        initialized = true;

        if (disposed) {
          destroyApp();
          return;
        }

        host.appendChild(app.canvas);
        currentScene = createSceneRef.current(app);
        setScene(currentScene);
      })
      .catch((error: unknown) => {
        console.error('Failed to initialize Pixi application', error);
      });

    return () => {
      disposed = true;
      setScene(null);
      currentScene?.destroy();

      if (initialized) {
        destroyApp();
      }
    };
  }, [hostRef]);

  return scene;
}
