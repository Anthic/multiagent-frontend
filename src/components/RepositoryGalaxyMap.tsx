'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NodeDetails {
  id: string;
  name: string;
  role: string;
  purpose: string;
  techStack: string[];
  deployment: string;
  commands: string[];
  coordinates: { cx: number; cy: number };
  color: string;
  glowColor: string;
}

const NODES_BLUEPRINT: NodeDetails[] = [
  {
    id: 'frontend',
    name: 'multiagent-frontend',
    role: 'Presentation & Interactive UI Client',
    purpose: 'A high-performance React 19 / Next.js 16 web interface. Accepts user prompts, manages websocket state via Zustand and TanStack Query, and renders three-dimensional R3F models, real-time agent diagnostics, and final markdown report outputs.',
    techStack: [
      'Next.js 16.2.4',
      'React 19.2.4',
      'Three.js 0.184.0',
      '@react-three/fiber 9.6.1',
      'Framer Motion 12.38.0',
      'GSAP 3.15.0',
      'Zustand 5.0.13',
      '@tanstack/react-query',
      'Tailwind CSS 4'
    ],
    deployment: 'Vercel Edge Network / Global CDN caching',
    commands: ['npm run dev (next dev)', 'npm run build (next build)', 'npm run start (next start)'],
    coordinates: { cx: 70, cy: 140 },
    color: '#a855f7', // Neon Purple
    glowColor: 'rgba(168, 85, 247, 0.25)'
  },
  {
    id: 'gateway',
    name: 'MultiAgentPart',
    role: 'Production Gateway Broker & Auth API',
    purpose: 'The central Express/TypeScript gateway routing layer. Manages client authentication via JSON Web Tokens, logs server traffic, handles rate limiting, and establishes WebSockets between React and background layers.',
    techStack: [
      'Express 5.2.1',
      'Mongoose 9.5.0',
      '@types/node 25.6.0',
      '@upstash/redis 1.37.0',
      'jsonwebtoken 9.0.3',
      'zod 3.25.76',
      'bcryptjs 3.0.3',
      'helmet 8.1.0',
      'xss 1.0.15'
    ],
    deployment: 'AWS ECS / Docker Containers / Redis Caching Shards',
    commands: [
      'npm run dev (nodemon ts-node)',
      'npm run build (tsc compile)',
      'npm run start (node server)'
    ],
    coordinates: { cx: 200, cy: 60 },
    color: '#06b6d4', // Cyber Cyan
    glowColor: 'rgba(6, 182, 212, 0.25)'
  },
  {
    id: 'backend',
    name: 'MultiAgentPart-Backend',
    role: 'Cognitive Multi-Agent Coordinator Hub',
    purpose: 'The AI core hub that accepts routed research payloads. Spawns primary orchestrator engines, handles recursive goal decomposition, manages conversation state with PostgreSQL, and queries cloud vector stores.',
    techStack: [
      'Python 3.11',
      'FastAPI / Uvicorn',
      'LangChain & LCEL',
      'LangGraph Workflow Engine',
      'Mistral AI LLM & Embeddings',
      'Qdrant Cloud (Vector Store)',
      'Supabase PostgreSQL'
    ],
    deployment: 'AWS ECS / GPU Scaled Kubernetes Clusters',
    commands: [
      'uvicorn src.main:app --reload (Port 8000)',
      'python run_agents.py --task EV_battery'
    ],
    coordinates: { cx: 330, cy: 140 },
    color: '#f59e0b', // Amber Gold
    glowColor: 'rgba(245, 158, 11, 0.25)'
  },
  {
    id: 'agents',
    name: 'Autonomous Agent Tools & Shards',
    role: 'Parallel Scrapers & Search Executors',
    purpose: 'Dedicated operational entities and crawlers invoked dynamically to carry out atomic agent duties. Utilizes web search APIs, handles deep PDF analysis, and executes semantic deduplication in parallel pipelines.',
    techStack: [
      'Tavily Python API / tavily-python',
      'BeautifulSoup4 (bs4)',
      'LXML Parser',
      'PyPDF Extractor',
      'HTTPX Client / Requests',
      'Tenacity (Retry Logics)',
      'Pydantic Data validation'
    ],
    deployment: 'Distributed serverless background executors / Celery Workers',
    commands: [
      'pytest tests/test_agents.py',
      'python -m scrapers.web_crawler'
    ],
    coordinates: { cx: 200, cy: 220 },
    color: '#10b981', // Emerald Green
    glowColor: 'rgba(16, 185, 129, 0.25)'
  }
];

export function RepositoryGalaxyMap() {
  const [activeNode, setActiveNode] = useState<NodeDetails | null>(null);

  return (
    <div className="w-full relative rounded-3xl border border-white/[0.08] bg-[#0c0c0b] p-6 md:p-10 shadow-[0_35px_70px_-15px_rgba(0,0,0,0.6)] overflow-hidden h-[760px] lg:h-[710px] flex flex-col justify-between select-none">
      
      {/* Dynamic Cosmic Space Nebula Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-50 mix-blend-screen">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-[#a855f7]/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-[#f59e0b]/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#06b6d4]/10 blur-[140px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '35px 35px'
        }}
      />

      {/* Star Particles */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(white 1px, transparent 0), radial-gradient(white 1.5px, transparent 0)',
          backgroundSize: '60px 60px, 120px 120px',
          backgroundPosition: '0 0, 60px 60px'
        }}
      />

      {/* TITLE HEADER */}
      <div className="relative z-10 flex flex-col items-center text-center gap-3 max-w-[800px] mx-auto border-b border-white/5 pb-5">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] text-[10px] font-mono tracking-widest uppercase select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b] animate-ping" />
          Interactive System Telemetry HUD
        </span>
        <h3 className="font-audiowide text-xl md:text-2xl text-white tracking-[0.08em] uppercase">
          Multi-Agent Repository Constellation
        </h3>
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-sans max-w-[660px]">
          We built this architecture to automate manual query processing. Spawns parallel LangGraph search agents, runs Node brokers, and binds them to Next.js clients. Hover nodes to read active package specs!
        </p>
      </div>

      {/* TWO COLUMN WORKSPACE: LEFT MAP & RIGHT HUD BOTH LOCKED TO STABLE EQUAL HEIGHTS */}
      <div className="relative z-10 grid lg:grid-cols-[1.25fr_1.1fr] gap-8 items-start flex-grow mt-6">
        
        {/* LEFT COLUMN: PERFECTLY ALIGNED SVG MAP (LOCKED HEIGHT) */}
        <div className="w-full bg-[#131211]/50 border border-white/[0.04] rounded-2xl p-6 relative flex items-center justify-center h-[465px] lg:h-[480px]">
          <div className="w-full max-w-[480px] aspect-[400/280] relative">
            
            <svg viewBox="0 0 400 280" className="w-full h-full overflow-visible">
              {/* Grid guide markings */}
              <circle cx="200" cy="140" r="100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <circle cx="200" cy="140" r="60" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

              {/* Sleek Dashed Laser Lines representing the workflow loop */}
              <g className="opacity-45">
                {/* Frontend -> Gateway */}
                <line x1="70" y1="140" x2="200" y2="60" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="4,4" />
                {/* Gateway -> Backend */}
                <line x1="200" y1="60" x2="330" y2="140" stroke="#f59e0b" strokeWidth="2.5" />
                {/* Backend -> Agents */}
                <line x1="330" y1="140" x2="200" y2="220" stroke="#10b981" strokeWidth="2.5" />
                {/* Agents -> Frontend */}
                <line x1="200" y1="220" x2="70" y2="140" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="4,4" />
              </g>

              {/* Smooth hardware-accelerated moving data packets */}
              <circle r="4.2" fill="#f59e0b" className="animate-pulse opacity-90">
                <animateMotion dur="5.5s" repeatCount="indefinite" path="M 70,140 L 200,60 L 330,140 L 200,220 L 70,140" />
              </circle>
              <circle r="4.2" fill="#a855f7" className="opacity-90">
                <animateMotion dur="7s" begin="2s" repeatCount="indefinite" path="M 200,60 L 330,140 L 200,220 L 70,140 L 200,60" />
              </circle>

              {/* Render Nodes as SVG Groups to guarantee absolute coordinate mapping */}
              {NODES_BLUEPRINT.map((node) => {
                const isDimmed = activeNode !== null && activeNode.id !== node.id;
                const isActive = activeNode?.id === node.id;

                return (
                  <g 
                    key={node.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveNode(node)}
                    onMouseLeave={() => setActiveNode(null)}
                    style={{ opacity: isDimmed ? 0.35 : 1, transition: 'opacity 0.3s ease' }}
                  >
                    {/* Pulsing Outer Glow Ring */}
                    <circle 
                      cx={node.coordinates.cx} 
                      cy={node.coordinates.cy} 
                      r={isActive ? "21" : "15"} 
                      fill="none" 
                      stroke={node.color} 
                      strokeWidth="2" 
                      className={isActive ? "animate-[ping_2.5s_infinite]" : ""}
                      style={{ opacity: isActive ? 0.8 : 0.3, transition: 'all 0.3s ease' }}
                    />

                    {/* Layer 1: Ambient Vector Glow Aura */}
                    <circle 
                      cx={node.coordinates.cx} 
                      cy={node.coordinates.cy} 
                      r={isActive ? "24" : "17"} 
                      fill={node.color}
                      opacity={isActive ? 0.35 : 0.12}
                      style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Layer 2: Core Vector Ring */}
                    <circle 
                      cx={node.coordinates.cx} 
                      cy={node.coordinates.cy} 
                      r={isActive ? "14.5" : "11"} 
                      fill={node.color}
                      opacity="0.9"
                      style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* High contrast inner core */}
                    <circle 
                      cx={node.coordinates.cx} 
                      cy={node.coordinates.cy} 
                      r="4.5" 
                      fill="#ffffff" 
                    />

                    {/* High-visibility Monospaced Text Labels underneath */}
                    <rect
                      x={node.coordinates.cx - 50}
                      y={node.coordinates.cy + 19}
                      width="100"
                      height="13"
                      rx="3.5"
                      fill="rgba(0,0,0,0.85)"
                      stroke={isActive ? node.color : "rgba(255,255,255,0.08)"}
                      strokeWidth="1.2"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    
                    <text 
                      x={node.coordinates.cx} 
                      y={node.coordinates.cy + 28} 
                      textAnchor="middle" 
                      fill={isActive ? "#ffffff" : "rgba(255,255,255,0.7)"} 
                      fontSize="7" 
                      fontWeight="bold" 
                      fontFamily="monospace"
                      letterSpacing="0.08em"
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      {node.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>

          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-CONTRAST SCIFI HUD CONSOLE (LOCKED TO MATCH LEFT HEIGHT, COMPACT SPACING FOR FULL VISIBILITY) */}
        <div className="w-full relative h-[465px] lg:h-[480px] flex flex-col justify-stretch">
          <AnimatePresence mode="wait">
            {!activeNode ? (
              <motion.div
                key="idle-hud"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-grow rounded-2xl border border-white/[0.04] bg-[#131211]/30 p-6 flex flex-col items-center justify-center text-center gap-4 h-full"
              >
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                  <span className="text-gray-400 font-mono text-xs animate-pulse">HUD</span>
                </div>
                <h4 className="font-audiowide text-sm uppercase tracking-[0.2em] text-white/50">
                  Awaiting Telemetry Sync
                </h4>
                <p className="text-[12px] text-gray-500 font-mono leading-relaxed max-w-[280px]">
                  Hover over any node in the interactive star map to engage core tech stack diagnostic logs & npm script telemetry.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="flex-grow rounded-2xl border bg-black/90 p-5 md:p-6 flex flex-col justify-between h-full shadow-2xl"
                style={{ borderColor: `${activeNode.color}45` }}
              >
                {/* HUD Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: activeNode.color }} />
                    <span className="font-mono text-[15px] md:text-[17px] font-extrabold uppercase tracking-widest text-white">
                      {activeNode.name}
                    </span>
                  </div>
                  <span className="font-mono text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/70 uppercase">
                    Active Readout
                  </span>
                </div>

                {/* HUD Body Telemetry (COMPACT SPACING: 100% VISIBLE WITH NO SCROLLING) */}
                <div className="flex-grow flex flex-col justify-between py-3 gap-2 overflow-hidden select-text">
                  <div>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-gray-500 block">Repository Layer Role</span>
                    <span className="text-[13px] md:text-[14px] font-bold text-white mt-0.5 block leading-tight">
                      {activeNode.role}
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-gray-500 block">Functional Purpose</span>
                    <p className="text-[11.5px] md:text-[12px] text-gray-300 leading-[1.5] mt-0.5">
                      {activeNode.purpose}
                    </p>
                  </div>

                  <div>
                    <span className="text-[8px] font-mono uppercase tracking-widest text-gray-500 block">Technology Stack & Libraries</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeNode.techStack.map((tech) => (
                        <span 
                          key={tech} 
                          className="px-2 py-0.5 rounded-full bg-white/5 border text-white font-mono text-[9px] transition-all duration-300 hover:bg-white/10"
                          style={{ borderColor: `${activeNode.color}35` }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[8px] font-mono uppercase tracking-widest text-gray-500 block">Deployment Cluster</span>
                      <span className="text-[10px] font-mono font-bold text-amber-400 mt-0.5 block leading-tight">
                        {activeNode.deployment}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono uppercase tracking-widest text-gray-500 block">Operational Commands</span>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        {activeNode.commands.map((cmd) => (
                          <code key={cmd} className="text-[8px] font-mono text-cyan-400 bg-white/5 px-1 py-0.5 rounded block whitespace-nowrap overflow-hidden text-ellipsis">
                            {cmd}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* HUD Footer Signal */}
                <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[9px] font-mono text-gray-500 flex-shrink-0">
                  <span>TELEMETRY STABLE: 100%</span>
                  <span className="uppercase font-bold" style={{ color: activeNode.color }}>[ {activeNode.id} ]</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* FOOTER status info */}
      <div className="relative z-10 flex items-center justify-center border-t border-white/5 pt-4 mt-6 text-[10px] text-gray-500 font-mono select-none">
        Stellar Telemetry Console: Active & Operational
      </div>
    </div>
  );
}
