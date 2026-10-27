'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { Application, type ApplicationOptions } from 'pixi.js';

/**
 * Creates a Pixi application inside `hostRef` and destroys it on unmount.
 */
export function usePixiApp(
  hostRef: RefObject<HTMLElement | null>,
  getOptions: () => Partial<ApplicationOptions>,
) {
  const [app, setApp] = useState<Application | null>(null);
  const getOptionsRef = useRef(getOptions);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const pixiApp = new Application();
    // `init` is async and Strict Mode unmounts right after the first mount,
    // so cleanup can run before init finishes. Destroying an app that hasn't
    // finished init throws, so whoever runs last does the destroy.
    let initialized = false;
    let disposed = false;

    const destroy = () => pixiApp.destroy({ removeView: true }, { children: true, texture: true });

    pixiApp
      .init(getOptionsRef.current())
      .then(() => {
        initialized = true;

        if (disposed) {
          destroy();
          return;
        }

        host.appendChild(pixiApp.canvas);
        setApp(pixiApp);
      })
      .catch((error: unknown) => {
        // Pixi effects are decorative: if WebGL is unavailable the page still works.
        console.error('Failed to initialize Pixi application', error);
      });

    return () => {
      disposed = true;
      setApp(null);

      if (initialized) {
        destroy();
      }
    };
  }, [hostRef]);

  return app;
}
