'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { IGraphData, IGraphNode, IGraphLink, NodeType } from './graphTypes';

interface SemanticGraph3DProps {
  data: IGraphData;
  selectedNode: IGraphNode | null;
  onSelectNode: (node: IGraphNode | null) => void;
  searchQuery: string;
  activeFilter: 'all' | NodeType;
}

interface Node3DState {
  node: IGraphNode;
  mesh: THREE.Mesh;
  halo: THREE.Mesh;
  pos: THREE.Vector3;
  targetPos: THREE.Vector3;
}

export function SemanticGraph3D({
  data,
  selectedNode,
  onSelectNode,
  searchQuery,
  activeFilter,
}: SemanticGraph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<IGraphNode | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [labelPositions, setLabelPositions] = useState<
    Array<{ id: string; label: string; color: string; x: number; y: number; visible: boolean; isRoot: boolean }>
  >([]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodes3DRef = useRef<Node3DState[]>([]);
  const linesGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({ theta: 0.4, phi: 1.2, radius: 120 });
  const reqAnimationRef = useRef<number | null>(null);

  // Filter nodes according to active filter
  const visibleNodes = useMemo(() => {
    return data.nodes.filter((n) => {
      if (activeFilter === 'all') return true;
      if (n.type === 'root_paper') return true; // always show root
      return n.type === activeFilter;
    });
  }, [data.nodes, activeFilter]);

  const visibleLinks = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    return data.links.filter((l) => visibleIds.has(l.source) && visibleIds.has(l.target));
  }, [data.links, visibleNodes]);

  // Generate 3D Spherical Force Positions
  const layoutPositions = useMemo(() => {
    const positions: Record<string, THREE.Vector3> = {};
    const count = visibleNodes.length;

    visibleNodes.forEach((node, i) => {
      if (node.type === 'root_paper') {
        positions[node.id] = new THREE.Vector3(0, 0, 0);
      } else {
        // Distribute on sphere shells according to type
        let radius = 45;
        if (node.type === 'citation') radius = 42;
        if (node.type === 'gap') radius = 55;
        if (node.type === 'concept') radius = 48;

        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;

        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        positions[node.id] = new THREE.Vector3(x, y, z);
      }
    });

    return positions;
  }, [visibleNodes]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b); // Dark Obsidian
    scene.fog = new THREE.FogExp2(0x09090b, 0.004);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xaaffc7, 2, 300);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x38bdf8, 1.5, 300);
    pointLight2.position.set(-50, -30, -50);
    scene.add(pointLight2);

    // Node & Link Groups
    const linesGroup = new THREE.Group();
    scene.add(linesGroup);
    linesGroupRef.current = linesGroup;

    // Resize Listener
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqAnimationRef.current) cancelAnimationFrame(reqAnimationRef.current);
      renderer.dispose();
    };
  }, []);

  // Update Nodes and Links in 3D Scene
  useEffect(() => {
    const scene = sceneRef.current;
    const linesGroup = linesGroupRef.current;
    if (!scene || !linesGroup) return;

    // Clean old nodes
    nodes3DRef.current.forEach(({ mesh, halo }) => {
      scene.remove(mesh);
      scene.remove(halo);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      halo.geometry.dispose();
      (halo.material as THREE.Material).dispose();
    });
    nodes3DRef.current = [];

    // Create 3D Nodes
    const newNodes3D: Node3DState[] = [];

    visibleNodes.forEach((node) => {
      const pos = layoutPositions[node.id] || new THREE.Vector3();
      const nodeColor = new THREE.Color(node.color);

      // Core Node Mesh
      const geometry = new THREE.SphereGeometry(node.size * 0.45, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: nodeColor,
        roughness: 0.25,
        metalness: 0.2,
        emissive: nodeColor,
        emissiveIntensity: node.type === 'root_paper' ? 0.6 : 0.25,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pos);
      mesh.userData = { nodeId: node.id };
      scene.add(mesh);

      // Subtle Outer Halo Glow Ring
      const haloGeo = new THREE.SphereGeometry(node.size * 0.65, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: node.type === 'root_paper' ? 0.2 : 0.1,
        wireframe: true,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(pos);
      scene.add(halo);

      newNodes3D.push({
        node,
        mesh,
        halo,
        pos: pos.clone(),
        targetPos: pos,
      });
    });

    nodes3DRef.current = newNodes3D;

    // Rebuild Links
    while (linesGroup.children.length > 0) {
      const child = linesGroup.children[0] as THREE.Line;
      linesGroup.remove(child);
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
    }

    visibleLinks.forEach((link) => {
      const sPos = layoutPositions[link.source];
      const tPos = layoutPositions[link.target];
      if (!sPos || !tPos) return;

      const points = [sPos, tPos];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      let lineColor = 0x52525b; // Zinc-600
      let lineOpacity = 0.25;

      if (link.type === 'addresses_gap') {
        lineColor = 0xf59e0b; // Amber
        lineOpacity = 0.4;
      } else if (link.type === 'thematic_cluster') {
        lineColor = 0xa855f7; // Purple
        lineOpacity = 0.35;
      }

      const lineMat = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: lineOpacity,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      linesGroup.add(line);
    });
  }, [visibleNodes, visibleLinks, layoutPositions]);

  // Main Render & Animation Loop
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const container = containerRef.current;
    if (!scene || !camera || !renderer || !container) return;

    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Auto-Rotate camera if active
      if (isAutoRotating && !isDraggingRef.current) {
        cameraRotationRef.current.theta += 0.0018;
      }

      // Calculate camera position from spherical coords
      const { theta, phi, radius } = cameraRotationRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);

      // Update projected 2D billboard labels for HTML overlay
      const w = container.clientWidth;
      const h = container.clientHeight;
      const labels: Array<{
        id: string;
        label: string;
        color: string;
        x: number;
        y: number;
        visible: boolean;
        isRoot: boolean;
      }> = [];

      nodes3DRef.current.forEach(({ node, mesh }) => {
        const tempVec = new THREE.Vector3();
        mesh.getWorldPosition(tempVec);
        tempVec.project(camera);

        // Check if node is in front of camera
        const isBehind = tempVec.z > 1;
        const x = (tempVec.x * 0.5 + 0.5) * w;
        const y = (-tempVec.y * 0.5 + 0.5) * h;

        labels.push({
          id: node.id,
          label: node.label,
          color: node.color,
          x,
          y,
          visible: !isBehind,
          isRoot: node.type === 'root_paper',
        });
      });

      setLabelPositions(labels);
    };

    animate();
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotating]);

  // Mouse drag Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraRotationRef.current.theta -= deltaX * 0.006;
    cameraRotationRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI - 0.1, cameraRotationRef.current.phi - deltaY * 0.006),
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraRotationRef.current.radius = Math.max(
      40,
      Math.min(220, cameraRotationRef.current.radius + e.deltaY * 0.08),
    );
  };

  // Raycaster click on 3D node
  const handleCanvasClick = (e: React.MouseEvent) => {
    const container = containerRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!container || !scene || !camera) return;

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const meshes = nodes3DRef.current.map((n) => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object as THREE.Mesh;
      const clickedId = clickedMesh.userData.nodeId;
      const targetNode = data.nodes.find((n) => n.id === clickedId);
      if (targetNode) {
        onSelectNode(targetNode);
      }
    } else {
      // Clicked empty background
      onSelectNode(null);
    }
  };

  const resetCamera = () => {
    cameraRotationRef.current = { theta: 0.4, phi: 1.2, radius: 120 };
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 select-none overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing bg-zinc-950"
      />

      {/* 2D Projected Floating Labels Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {labelPositions.map((lbl) => {
          if (!lbl.visible) return null;

          const isSelected = selectedNode?.id === lbl.id;
          const isHovered = hoveredNode?.id === lbl.id;
          const isSearchMatch =
            searchQuery.trim().length > 0 &&
            lbl.label.toLowerCase().includes(searchQuery.toLowerCase().trim());

          return (
            <div
              key={lbl.id}
              style={{
                transform: `translate(-50%, -100%) translate(${lbl.x}px, ${lbl.y - 12}px)`,
              }}
              className={`absolute transition-opacity duration-150 pointer-events-auto cursor-pointer ${
                isSelected || isHovered || isSearchMatch || lbl.isRoot ? 'opacity-100 z-10' : 'opacity-65 hover:opacity-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                const node = data.nodes.find((n) => n.id === lbl.id);
                if (node) onSelectNode(node);
              }}
              onMouseEnter={() => {
                const node = data.nodes.find((n) => n.id === lbl.id);
                if (node) setHoveredNode(node);
              }}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans font-medium backdrop-blur-md shadow-lg border transition-all ${
                  isSelected
                    ? 'bg-zinc-900 border-[#AAFFC7] text-white ring-1 ring-[#AAFFC7]'
                    : isSearchMatch
                    ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                    : lbl.isRoot
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-[#AAFFC7] font-bold'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: lbl.color }}
                />
                <span className="max-w-[140px] truncate">{lbl.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Controls (Auto-Rotate, Reset Camera) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
            isAutoRotating
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
          title="Toggle smooth auto rotation"
        >
          <span>{isAutoRotating ? '⏸ Rotate: ON' : '▶ Rotate: OFF'}</span>
        </button>

        <button
          type="button"
          onClick={resetCamera}
          className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors backdrop-blur-md cursor-pointer"
          title="Reset camera perspective"
        >
          Reset View ↺
        </button>
      </div>

      {/* Helper Legend Badge */}
      <div className="absolute top-4 left-4 hidden sm:flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-[11px] font-mono text-zinc-400 backdrop-blur-md z-10">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#00E599]" />
          <span>Active Paper</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
          <span>Citations</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
          <span>Literature Gaps</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#A855F7]" />
          <span>Pillars</span>
        </span>
      </div>
    </div>
  );
}
