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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <AtlasHeadScene />;
}
