'use client';

import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MotionValue } from 'framer-motion';
import { useRef } from 'react';
import * as THREE from 'three';

interface AtlasHeadModelProps {
  scrollProgress?: MotionValue<number>;
}

export function AtlasHeadModel({ scrollProgress }: AtlasHeadModelProps) {
  const { scene } = useGLTF('/model/atlas_head.glb');
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.3;

    if (scrollProgress) {
      const p = scrollProgress.get(); 
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, p * -0.6, 0.05
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z, Math.sin(p * Math.PI * 2) * 0.15, 0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      <Center scale={1.8}>
        <primitive object={scene} />
      </Center>
    </group>
  );
}
// Removed preload so ErrorBoundary can catch the error during render