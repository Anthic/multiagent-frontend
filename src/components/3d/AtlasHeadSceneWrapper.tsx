'use client';

import dynamic from 'next/dynamic';

// Three.js needs browser APIs (window, WebGL) — ssr: false required
// This must live in a Client Component, not a Server Component
const AtlasHeadScene = dynamic(
  () => import('./AtlasHeadScene').then((m) => m.AtlasHeadScene),
  { ssr: false }
);

export function AtlasHeadSceneWrapper() {
  return <AtlasHeadScene />;
}
