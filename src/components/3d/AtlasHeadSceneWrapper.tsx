'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Three.js needs browser APIs (window, WebGL) — ssr: false required
// This must live in a Client Component, not a Server Component
const AtlasHeadScene = dynamic(
  () => import('./AtlasHeadScene').then((m) => m.AtlasHeadScene),
  { ssr: false }
);

export function AtlasHeadSceneWrapper() {
  const [shouldMountScene, setShouldMountScene] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;
    let idleId: number | undefined;

    timeoutId = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(
          () => setShouldMountScene(true),
          { timeout: 1200 },
        );
        return;
      }

      setShouldMountScene(true);
    }, 1050);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  if (!shouldMountScene) return null;

  return <AtlasHeadScene />;
}
