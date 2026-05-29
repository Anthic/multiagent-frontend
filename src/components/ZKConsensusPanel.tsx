'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface NodeData {
  name: string;
  hash: string;
  weight: string;
  ping: string;
  color: string;
}

const NODES_DATA: NodeData[] = [
  { name: 'ALPHA', hash: '0x7c3a9f...8d21', weight: '25.0%', ping: '12ms', color: '#d4a017' },
  { name: 'BETA', hash: '0x3b5f92...a418', weight: '25.0%', ping: '16ms', color: '#10b981' },
  { name: 'GAMMA', hash: '0x8e2c64...f352', weight: '25.0%', ping: '14ms', color: '#7c3aed' },
  { name: 'DELTA', hash: '0xf9d15b...9a4c', weight: '25.0%', ping: '19ms', color: '#06b6d4' }
];

const INITIAL_LOGS = [
  '[ZK-WRAPPER] Initializing Zero-Knowledge peer cluster...',
  '[PEER-LAYER] Connection established between 4 validator shards',
  '[CONSENSUS] Merkle root generated: 0x9a4f...3e2d',
  '[ZK-WRAPPER] Shard Alpha signature validated successfully',
  '[PEER-LAYER] Shard Beta verified consensus block #10842'
];

export function ZKConsensusPanel() {
  const [logs, setLogs] = useState<string[]>(INITIAL_LOGS);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll console inside the terminal only
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  // Dynamic continuous consensus logs simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isVerifying) return; // Pause generic logs during validation animation

      const peers = ['Alpha', 'Beta', 'Gamma', 'Delta'];
      const actions = [
        `[ZK-WRAPPER] Peer ${peers[Math.floor(Math.random() * 4)]} verified signature successfully`,
        `[CONSENSUS] Shards synchronized: Merkle root verified state synced`,
        `[ZK-PROOF] Zero knowledge SNARK proof verified in ${parseFloat((3.5 + Math.random() * 2).toFixed(1))}ms`,
        `[PEER-LAYER] Synced state verified across distributed nodes`
      ];

      setLogs((prev) => [...prev, actions[Math.floor(Math.random() * actions.length)]].slice(-100));
    }, 3200);

    return () => clearInterval(interval);
  }, [isVerifying]);

  // ZK Verification trigger handler
  const handleVerifyTrigger = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setVerificationSuccess(false);

    const steps = [
      { delay: 300, text: '[ZK-ENGINE] Generating cryptographic SNARK wrapper...' },
      { delay: 800, text: '[ZK-ENGINE] Accumulating shard commitments (4/4 nodes online)...' },
      { delay: 1300, text: '[ZK-ENGINE] Constructing polynomial commitment proofs...' },
      { delay: 1800, text: '[CONSENSUS] SECURED: 100% Shard consensus achieved! (0x00 error rate)' },
      { delay: 2200, text: '[SUCCESS] ZK-Proof mapped, aligned, and sealed in 2200ms!' }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step.text].slice(-100));
        if (step.text.includes('[SUCCESS]')) {
          setVerificationSuccess(true);
          setIsVerifying(false);
        }
      }, step.delay);
    });
  };

  return (
    <div 
      className="w-full relative z-10 rounded-3xl border border-[#ded8c9] bg-[#f2ebd9]/45 backdrop-blur-xl p-6 md:p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] flex flex-col gap-6"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)'
      }}
    >
      {/* PANEL TITLE BAR */}
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex size-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c3aed] opacity-75"></span>
            <span className="relative inline-flex rounded-full size-3 bg-[#7c3aed]"></span>
          </span>
          <span className="font-audiowide text-sm tracking-[0.15em] uppercase text-black/70">
            ZK Consensus Shard
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-black/10" />
          <span className="size-2.5 rounded-full bg-black/10" />
          <span className="size-2.5 rounded-full bg-black/10" />
        </div>
      </div>

      {/* SVG INTERACTIVE ORBITAL SHARDS */}
      <div className="bg-[#ede5d1]/40 border border-black/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden h-[180px]">
        
        {/* Orbital nodes SVG */}
        <svg viewBox="0 0 200 200" className="size-[140px]">
          {/* Orbital path */}
          <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="2" strokeDasharray="3,3" />

          {/* Central Cryptographic ZK Shield */}
          <g className="cursor-pointer">
            <circle 
              cx="100" 
              cy="100" 
              r="24" 
              fill={isVerifying ? '#7c3aed' : verificationSuccess ? '#10b981' : '#ede5d1'} 
              className="transition-all duration-500 animate-pulse"
              stroke="rgba(0,0,0,0.06)" 
              strokeWidth="2" 
            />
            {/* Elegant shield vector icon inside */}
            <path 
              d="M100 89 L111 94 L111 103 C111 109 106 113 100 115 C94 113 89 109 89 103 L89 94 L100 89 Z" 
              fill="none" 
              stroke={isVerifying || verificationSuccess ? '#ffffff' : '#4b5563'} 
              strokeWidth="2" 
            />
          </g>

          {/* Shard Shards Orbiting */}
          {NODES_DATA.map((node, index) => {
            // Distribute 4 nodes at 90 degrees intervals
            const angle = (index * 90 * Math.PI) / 180;
            // Radius of orbit is 60
            const x = 100 + 60 * Math.cos(angle);
            const y = 100 + 60 * Math.sin(angle);

            return (
              <g 
                key={node.name}
                className="cursor-pointer transition-transform duration-300 hover:scale-115"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle 
                  cx={x} 
                  cy={y} 
                  r="12" 
                  fill={node.color} 
                  className={isVerifying ? 'animate-[spin_10s_linear_infinite]' : ''}
                  style={{ transformOrigin: '100px 100px' }}
                />
                <text 
                  x={x} 
                  y={y + 3} 
                  textAnchor="middle" 
                  className="text-[6px] font-bold fill-white select-none font-sans"
                >
                  {node.name[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Hover Information Display */}
        <div className="absolute bottom-2 inset-x-0 text-center select-none">
          <div className="text-[10px] font-mono font-medium text-black/60 h-4">
            {hoveredNode ? (
              <span className="text-[#7c3aed] font-bold">
                {hoveredNode.name}: {hoveredNode.hash} (Ping: {hoveredNode.ping})
              </span>
            ) : isVerifying ? (
              <span className="text-[#7c3aed] font-semibold animate-pulse">Running proof validation…</span>
            ) : verificationSuccess ? (
              <span className="text-[#10b981] font-bold">Block consensus verified successfully</span>
            ) : (
              'Hover validator shards to inspect peer states'
            )}
          </div>
        </div>
      </div>

      {/* PEER CONSENSUS LIVE LOGS */}
      <div className="flex flex-col bg-black/90 border border-white/5 shadow-2xl rounded-2xl overflow-hidden min-h-[120px] max-h-[160px]">
        <div 
          ref={containerRef}
          className="flex-grow p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#f4efe4] flex flex-col gap-1 scrollbar-none"
        >
          {logs.map((log, index) => {
            if (!log || typeof log !== 'string') return null;
            let textColor = 'text-[#e6dfd1]';
            if (log.includes('[SUCCESS]')) textColor = 'text-[#10b981] font-bold';
            else if (log.includes('[ERROR]')) textColor = 'text-red-400 font-semibold';
            else if (log.includes('[PEER-LAYER]')) textColor = 'text-[#06b6d4]';
            else if (log.includes('[ZK-ENGINE]') || log.startsWith('[ZK-WRAPPER]')) textColor = 'text-[#d4a017] font-semibold';

            return (
              <div key={`log-${index}-${log.slice(0, 15)}`} className={`${textColor} break-words`}>
                {log}
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* INTERACTIVE GENERATE PROOF TRIGGER BUTTON */}
      <button
        onClick={handleVerifyTrigger}
        disabled={isVerifying}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-black via-[#191919] to-[#3a3a3a] px-5 py-3.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
        <span className="relative">
          {isVerifying ? 'Verifying Consensus…' : 'Generate ZK-Proof Shard'}
        </span>
      </button>

      {/* Styled inline scrollbar hides */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
