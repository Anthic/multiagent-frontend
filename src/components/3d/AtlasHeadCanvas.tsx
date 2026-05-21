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
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        {/* Dark gold lighting setup */}
        <ambientLight intensity={0.3} color="#1a0f00" />
        
        {/* Key light - warm gold উপর থেকে */}
        <directionalLight position={[5, 8, 3]} intensity={2.0} color="#c8922a" />
        
        {/* Fill light - deep amber বাম থেকে */}
        <pointLight position={[-5, 2, 3]} intensity={1.5} color="#8b5e0a" />
        
        {/* Rim light - পেছন থেকে গোল্ড edge */}
        <pointLight position={[0, -2, -5]} intensity={2.5} color="#d4a017" />
        
        {/* Subtle cool shadow fill */}
        <pointLight position={[3, -4, 2]} intensity={0.4} color="#1a1200" />

        {/* Fog/mist effect */}
        <fog attach="fog" args={['#0d0a04', 12, 35]} />

        <Suspense fallback={
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshBasicMaterial color="red" wireframe />
          </mesh>
        }>
          <Environment preset="sunset" />
          <AtlasHeadModel scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}