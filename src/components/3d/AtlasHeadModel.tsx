'use client';

import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MotionValue } from 'framer-motion';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface AtlasHeadModelProps {
  scrollProgress?: MotionValue<number>;
}

export function AtlasHeadModel({ scrollProgress }: AtlasHeadModelProps) {
  const { scene } = useGLTF('/model/atlas_head.glb');
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  // Dark gold material apply করো সব mesh এ
  useEffect(() => {
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8b6914'),       // base dark gold
      emissive: new THREE.Color('#2a1f00'),    // ভেতর থেকে সামান্য glow
      emissiveIntensity: 0.3,
      metalness: 0.95,                         // প্রায় পুরো metal
      roughness: 0.25,                         // একটু rough, বেশি realistic
    });

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = goldMaterial;
      }
    });
  }, [scene]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    targetRotation.current.y = mouse.current.x * 0.4;
    targetRotation.current.x = -mouse.current.y * 0.2;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotation.current.y,
      delta * 2.5
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation.current.x,
      delta * 2.5
    );
  });

  return (
    <group ref={groupRef} position={[0, -5.0, 0]}>
      <Center scale={0.5}>
        <primitive object={scene} />
      </Center>
    </group>
  );
}
// Removed preload so ErrorBoundary can catch the error during render