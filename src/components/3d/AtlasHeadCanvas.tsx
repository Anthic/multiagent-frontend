'use client';

import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { MotionValue } from 'framer-motion';
import React, { Suspense, Component, ReactNode } from 'react';
import { AtlasHeadModel } from './AtlasHeadModel';

interface AtlasHeadCanvasProps {
  scrollProgress?: MotionValue<number>;
}

// Catch 3D crashes
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', background: '#ffebee', padding: '20px', border: '2px solid red' }}>
          <h2>3D Model Error:</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AtlasHeadCanvas({ scrollProgress }: AtlasHeadCanvasProps) {
  return (
    <ErrorBoundary>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-4, -4, -4]} intensity={0.5} color="#6366f1" />
        <pointLight position={[4, 0, 2]} intensity={0.3} color="#a855f7" />

        <Suspense fallback={
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshBasicMaterial color="red" wireframe />
          </mesh>
        }>
          <Environment preset="city" />
          <AtlasHeadModel scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}