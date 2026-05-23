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

    const modelGroup = new THREE.Group();
    let particleSystem: THREE.Points | null = null;
    const particleData: Array<{ x: number; y: number; z: number; vx: number; vy: number; vz: number }> = [];
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
    let hasRevealedCanvas = false;
    const MAX_PARTICLES = 180;

    // 1. Initialize Scene
    const scene = new THREE.Scene();

    // 2. Initialize Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8); // Perfect depth positioning

    // 3. Initialize WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,           // Seamless transparent integration with CSS page gradient
      antialias: true,       // Beautiful clean edges
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);

    // Fog/mist effect
    scene.fog = new THREE.Fog('#0d0a04', 12, 35);

    // 4. Initialize Core Lights (Brighter Gold Setup)
    const ambientLight = new THREE.AmbientLight(0x2a1a00, 0.5); // Brighter ambient
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffb732, 2.5); // Much brighter warm gold from top
    dirLight.position.set(5, 8, 3);
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0xd4a017, 2.0, 15); // Lighter amber from left
    pointLight1.position.set(-5, 2, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffdf73, 3.0, 15); // Brighter rim light
    pointLight2.position.set(0, -2, -5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x1a1200, 0.4, 15); // Subtle cool shadow fill
    pointLight3.position.set(3, -4, 2);
    scene.add(pointLight3);

    // Environment/IBL fallback - handled in materials now

    // 5. Add Model Container
    scene.add(modelGroup);

    // Add a glowing scanning ring
    const ringGeo = new THREE.RingGeometry(1.6, 1.65, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffb732, // Gold glow
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const scanningRing = new THREE.Mesh(ringGeo, ringMat);
    scanningRing.rotation.x = Math.PI / 2; // Flat horizontal
    scene.add(scanningRing);

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
      const solidMaterial = new THREE.MeshStandardMaterial({
        color: 0xcd9a2b,       // Lighter, brighter gold
        emissive: 0x4a3200,    // Slightly warmer inner glow
        emissiveIntensity: 0.4,
        metalness: 0.90,       // Very metallic
        roughness: 0.15,       // Smoother for better sharp reflections
      });
      mesh.material = solidMaterial;
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
        child.traverse((node: THREE.Object3D) => {
          const meshNode = node as THREE.Mesh;
          if (meshNode.geometry) meshNode.geometry.dispose();
          if (meshNode.material) {
            if (Array.isArray(meshNode.material)) {
              meshNode.material.forEach((m: THREE.Material) => m.dispose());
            } else {
              meshNode.material.dispose();
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
        model.traverse((child: THREE.Object3D) => {
          const meshChild = child as THREE.Mesh;
          if (meshChild.isMesh) {
            styleMesh(meshChild);
          }
        });
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        
        // Recenter the model so the exact middle of the bounding box is the pivot
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        unscaledModelHeight = size.y || 3.5;
        modelGroup.add(model);
        updateDimensions();
        console.log('GLTF loaded successfully inside Next.js page.');
      },
      undefined,
      (_err) => {
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
    
    // Add Mouse Tracking Setups
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };

    function onMouseMove(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMouseMove);

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
    let lastAnimateTime = performance.now();
    function animate() {
      animationId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastAnimateTime) * 0.001; // in seconds
      lastAnimateTime = currentTime;
      const time = currentTime * 0.001;

      monitorPerformance();

      if (modelGroup) {
        // Assume the head looks to the right. We rotate it left by 90 degrees to face forward.
        // Change '- Math.PI / 2' to '+ Math.PI / 2' if it ends up facing backwards.
        targetRotation.y = (mouse.x * 0.35) - (Math.PI / 2);
        targetRotation.x = -mouse.y * 0.15;

        // Smooth Lerp for Mouse Tracking
        modelGroup.rotation.y = THREE.MathUtils.lerp(
          modelGroup.rotation.y,
          targetRotation.y,
          deltaTime * 2.0
        );
        modelGroup.rotation.x = THREE.MathUtils.lerp(
          modelGroup.rotation.x,
          targetRotation.x,
          deltaTime * 2.0
        );

        const floatOffset = Math.sin(time * 1.5) * 0.12;

        const baseY = 0.5; // Lowered slightly from 1.0
        const scrollParallaxY = -(window.scrollY * 0.003);
        
        // Centered horizontally (x=0), and applied scroll/float on Y
        modelGroup.position.set(0, baseY + scrollParallaxY + floatOffset, 0);

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        const scrollScaleFactor = 1.0 - (Math.min(scrollProgress, 1) * 0.15);
        
        modelGroup.scale.setScalar(baseScale * scrollScaleFactor);

        if (scanningRing) {
          const scrollY = window.scrollY;
          const height = window.innerHeight;
          const startScroll = height * 0.4;
          const endScroll = height * 1.6;
          
          if (scrollY >= startScroll && scrollY <= endScroll) {
            // Smoothly fade in scanning ring
            (scanningRing.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
              (scanningRing.material as THREE.MeshBasicMaterial).opacity,
              0.9,
              deltaTime * 4
            );
            
            // Sweep Y position up and down relative to the model position
            scanningRing.position.y = modelGroup.position.y + Math.sin(time * 2.2) * 1.1;
            scanningRing.position.x = modelGroup.position.x;
            scanningRing.position.z = modelGroup.position.z;
            
            // Pulse size
            const scale = 1.0 + Math.sin(time * 4) * 0.04;
            scanningRing.scale.set(scale, scale, scale);
          } else {
            // Smoothly fade out scanning ring
            (scanningRing.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
              (scanningRing.material as THREE.MeshBasicMaterial).opacity,
              0,
              deltaTime * 4
            );
          }
        }
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

      if (!hasRevealedCanvas && containerRef.current) {
        hasRevealedCanvas = true;
        containerRef.current.style.opacity = '1';
      }
    }

    animate();

    // 13. System Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('mousemove', onMouseMove);
      clearGroup(modelGroup);

      // Cleanup scanning ring
      ringGeo.dispose();
      ringMat.dispose();

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
          overflow: 'hidden',
          opacity: 0,
          transition: 'opacity 900ms ease'
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
