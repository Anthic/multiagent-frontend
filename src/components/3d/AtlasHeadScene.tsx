'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function AtlasHeadScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!canvasRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let modelGroup = new THREE.Group();
    let particleSystem: THREE.Points | null = null;
    let particleData: Array<{ x: number; y: number; z: number; vx: number; vy: number; vz: number }> = [];
    let unscaledModelHeight = 3.5;

    // Responsive configurations
    let targetVH = 0.60;
    let rotationSpeedMultiplier = 1.0;
    let baseScale = 1.0;

    // Performance monitor
    let frameCount = 0;
    let lastTime = performance.now();
    let fpsSum = 0;
    let fpsChecked = false;
    const MAX_PARTICLES = 180;

    // 1. Initialize Scene
    scene = new THREE.Scene();

    // 2. Initialize Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8); // Perfect depth positioning

    // 3. Initialize WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,           // Seamless transparent integration with CSS page gradient
      antialias: true,       // Beautiful clean edges
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);

    // 4. Initialize Core Lights (Rich Cyberpunk Colors)
    const ambientLight = new THREE.AmbientLight(0x1a0533, 0.4); // Subtle purple shadows
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x7c3aed, 2.5, 15); // Deep purple key light
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 1.5, 15); // Cyan accent fill
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3); // Top highlight
    dirLight.position.set(0, 5, 5);
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0xa855f7, 3.0, 15); // Edge silhouetting from behind
    rimLight.position.set(0, 1, -4);
    scene.add(rimLight);

    // 5. Add Model Container
    scene.add(modelGroup);

    // 6. Generate Procedural Glow Particles
    function createParticleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
      }
      return new THREE.CanvasTexture(canvas);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const colors = new Float32Array(MAX_PARTICLES * 3);
    const colorPalette = [
      new THREE.Color('#7c3aed'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#ffffff')
    ];

    for (let i = 0; i < MAX_PARTICLES; i++) {
      // Uniform spherical cluster distribution (radius 4 to 8 units)
      const radius = 4 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      particleData.push({
        x, y, z,
        vx: (Math.random() - 0.5) * 0.003,
        vy: (Math.random() - 0.5) * 0.003,
        vz: (Math.random() - 0.5) * 0.003
      });

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      map: createParticleTexture(),
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // 7. Custom travesal style mesh loader
    function styleMesh(mesh: THREE.Mesh) {
      const originalGeom = mesh.geometry;
      const solidMaterial = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        emissive: 0x3b1f7a,
        roughness: 0.2,
        metalness: 0.8,
        flatShading: true
      });
      mesh.material = solidMaterial;

      // Glow Edges Wireframe
      const edges = new THREE.EdgesGeometry(originalGeom);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.4
      });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);
    }

    // 8. Low-Poly Procedural Placeholder Skull/Head System
    function createProceduralHead() {
      clearGroup(modelGroup);
      const proceduralModel = new THREE.Group();

      const solidMaterial = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        emissive: 0x3b1f7a,
        metalness: 0.9,
        roughness: 0.15,
        flatShading: true
      });

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.4
      });

      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 2.5,
        roughness: 0.1
      });

      const parts = [
        { geo: new THREE.SphereGeometry(1.4, 8, 6), pos: [0, 0.5, 0], scale: [1, 1.1, 1.05] },
        { geo: new THREE.BoxGeometry(1.2, 1.1, 1.4), pos: [0, -0.4, 0.2], scale: [0.9, 0.9, 1] },
        { geo: new THREE.BoxGeometry(0.8, 0.6, 0.6), pos: [0, -0.9, 0.75], scale: [1, 1, 1] },
        { geo: new THREE.BoxGeometry(0.3, 0.9, 0.5), pos: [0, 0.1, 1.0], scale: [1, 1, 1] },
        { geo: new THREE.BoxGeometry(0.5, 0.4, 0.8), pos: [-0.68, -0.1, 0.6], scale: [1, 1, 1] },
        { geo: new THREE.BoxGeometry(0.5, 0.4, 0.8), pos: [0.68, -0.1, 0.6], scale: [1, 1, 1] },
        { geo: new THREE.BoxGeometry(1.5, 0.3, 0.4), pos: [0, 0.6, 0.9], scale: [1, 1, 1] },
        { geo: new THREE.CylinderGeometry(0.65, 0.85, 1.4, 6), pos: [0, -1.3, -0.2], scale: [1, 1, 1] }
      ];

      parts.forEach(part => {
        const mesh = new THREE.Mesh(part.geo, solidMaterial);
        mesh.position.set(part.pos[0], part.pos[1], part.pos[2]);
        mesh.scale.set(part.scale[0], part.scale[1], part.scale[2]);

        const edges = new THREE.EdgesGeometry(part.geo);
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        mesh.add(wireframe);

        proceduralModel.add(mesh);
      });

      // Cybernetic Cyan Glowing Eyes
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), eyeMaterial);
      eyeL.position.set(-0.42, 0.35, 0.95);
      proceduralModel.add(eyeL);

      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), eyeMaterial);
      eyeR.position.set(0.42, 0.35, 0.95);
      proceduralModel.add(eyeR);

      unscaledModelHeight = 3.6;
      modelGroup.add(proceduralModel);
      updateDimensions();
    }

    function clearGroup(group: THREE.Group) {
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        child.traverse((node: any) => {
          if (node.geometry) node.geometry.dispose();
          if (node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach((m: THREE.Material) => m.dispose());
            } else {
              node.material.dispose();
            }
          }
        });
      }
    }

    // 9. Load Asset from Next.js Public folder
    const loader = new GLTFLoader();
    loader.load(
      '/model/atlas_head.glb',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child: any) => {
          if (child.isMesh) {
            styleMesh(child);
          }
        });
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        unscaledModelHeight = size.y || 3.5;
        modelGroup.add(model);
        updateDimensions();
        console.log('GLTF loaded successfully inside Next.js page.');
      },
      undefined,
      (err) => {
        console.warn('GLTF loading failed or CORS restriction active. Generating procedural Atlas model...');
        createProceduralHead();
      }
    );

    // 10. Dimensions & Sizing calculations (Proportional 60%, 55%, 45% screen heights)
    function updateDimensions() {
      if (window.innerWidth < 768) {
        targetVH = 0.45; // Mobile: 45vh footprint
        rotationSpeedMultiplier = 0.60; // 40% speed reduction
      } else if (window.innerWidth <= 1024) {
        targetVH = 0.55; // Tablet: 55vh footprint
        rotationSpeedMultiplier = 1.0;
      } else {
        targetVH = 0.60; // Desktop: 60vh footprint
        rotationSpeedMultiplier = 1.0;
      }

      const fovRad = (camera.fov * Math.PI) / 360;
      const D = camera.position.z;
      const visibleHeightAtOrigin = 2 * Math.tan(fovRad) * D;
      baseScale = (targetVH * visibleHeightAtOrigin) / unscaledModelHeight;
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateDimensions();
    }

    window.addEventListener('resize', onWindowResize);
    updateDimensions();

    // 11. Performance check (FPS auditing logic)
    function monitorPerformance() {
      if (fpsChecked) return;
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      if (delta > 0) {
        const currentFps = 1000 / delta;
        fpsSum += currentFps;
        frameCount++;
        if (frameCount >= 100) {
          const averageFps = fpsSum / frameCount;
          if (averageFps < 30) {
            console.warn(`Average FPS (${averageFps.toFixed(1)}) below 30. Cutting render active points in half.`);
            if (particleSystem) {
              particleSystem.geometry.setDrawRange(0, MAX_PARTICLES / 2);
            }
          }
          fpsChecked = true;
        }
      }
    }

    // 12. requestAnimationFrame Animation loop
    let animationId: number;
    function animate() {
      animationId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      monitorPerformance();

      if (modelGroup) {
        modelGroup.rotation.y += 0.003 * rotationSpeedMultiplier;
        const floatOffset = Math.sin(time * 1.5) * 0.12;

        const baseY = 0;
        const scrollParallaxY = -(window.scrollY * 0.003);
        modelGroup.position.y = baseY + scrollParallaxY + floatOffset;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        const scrollScaleFactor = 1.0 - (Math.min(scrollProgress, 1) * 0.15);
        
        modelGroup.scale.setScalar(baseScale * scrollScaleFactor);
      }

      if (particleSystem) {
        const posAttr = particleSystem.geometry.attributes.position;
        const posArray = posAttr.array as Float32Array;
        const count = MAX_PARTICLES;

        for (let i = 0; i < count; i++) {
          particleData[i].x += particleData[i].vx;
          particleData[i].y += particleData[i].vy;
          particleData[i].z += particleData[i].vz;

          const currentRadius = Math.sqrt(
            particleData[i].x**2 + 
            particleData[i].y**2 + 
            particleData[i].z**2
          );

          if (currentRadius > 8.5) {
            particleData[i].x = -particleData[i].x * 0.95;
            particleData[i].y = -particleData[i].y * 0.95;
            particleData[i].z = -particleData[i].z * 0.95;
          }

          posArray[i * 3] = particleData[i].x;
          posArray[i * 3 + 1] = particleData[i].y - (window.scrollY * 0.0006);
          posArray[i * 3 + 2] = particleData[i].z;
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    animate();

    // 13. System Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onWindowResize);
      clearGroup(modelGroup);
      if (particleSystem) {
        particleSystem.geometry.dispose();
        if (Array.isArray(particleSystem.material)) {
          particleSystem.material.forEach(m => m.dispose());
        } else {
          particleSystem.material.dispose();
        }
      }
      renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* 3D CANVAS CONTAINER with contrast and brightness filter */}
      <div 
        id="canvas-container"
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'contrast(1.05) brightness(1.1)',
          overflow: 'hidden'
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Subtle Scanline Overlay at 3% Opacity */}
      <div 
        className="scanlines"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 3,
          background: 'repeating-linear-gradient(rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 2px, rgba(0, 0, 0, 0.4) 2px, rgba(0, 0, 0, 0.4) 4px)',
          opacity: 0.03
        }}
      />
    </>
  );
}