'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Defined commands for interactive experience
interface CommandResponse {
  type: 'info' | 'success' | 'warn' | 'system';
  text: string;
}

const COMMAND_LOGS: Record<string, CommandResponse[]> = {
  search: [
    { type: 'system', text: '[ATLAS SYSTEM] Initiating deep web crawl...' },
    { type: 'info', text: '[Searcher] Query: "Autonomous agentic research workflows"' },
    { type: 'info', text: '[Searcher] Querying vector data networks...' },
    { type: 'info', text: '[Searcher] Fetched 14 authoritative web sources' },
    { type: 'success', text: '[Searcher] Scraped, cleaned, and vectorized search indices (100% OK)' }
  ],
  synthesize: [
    { type: 'system', text: '[ATLAS SYSTEM] Synthesizing gathered intelligence...' },
    { type: 'info', text: '[Synthesizer] Compiling semantic search vectors...' },
    { type: 'info', text: '[Synthesizer] Generating multi-perspective comparison layers' },
    { type: 'warn', text: '[Synthesizer] Resolving conflicting points from Source #4...' },
    { type: 'success', text: '[Synthesizer] Core findings compressed into 4 actionable tasks!' }
  ],
  optimize: [
    { type: 'system', text: '[ATLAS SYSTEM] Running real-time pipeline optimization...' },
    { type: 'info', text: '[Optimizer] Pruning redundant agent reasoning branches...' },
    { type: 'info', text: '[Optimizer] Allocating vector weights dynamically...' },
    { type: 'success', text: '[Optimizer] Optimized rendering pipeline to 60 FPS (Latency: 8ms)' }
  ],
  help: [
    { type: 'system', text: '--- ATLAS CONSOLE UTILITY ---' },
    { type: 'info', text: 'Available commands:' },
    { type: 'info', text: '  /search      - Spawn agents to crawl and analyze data' },
    { type: 'info', text: '  /synthesize  - Run synthesis and task break-down' },
    { type: 'info', text: '  /optimize    - Trigger procedural computation boost' },
    { type: 'info', text: '  /clear       - Clear the console logs' }
  ]
};

const DEFAULT_STREAM = [
  '[ATLAS INITIALIZED] Multi-agent orchestration engine active.',
  '[PARSER] Input received: "Turn raw research into structured AI pipelines"',
  '[PARSER] Breaking down request into 3 autonomous sub-tasks...',
  '[SEARCHER] Spawned agent-1 to index active research vectors...',
  '[SEARCHER] Crawling dynamic academic databases...',
  '[SYNTHESIZER] Spawned agent-2 to map cross-node associations...',
  '[SYNTHESIZER] Organizing findings into sequential roadmap layers...',
  '[OPTIMIZER] Dynamically balancing GPU-CPU vector pipelines...',
  '[SUCCESS] Research roadmap prepared in 820ms!'
];

export function EngineDiagnosticPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [metrics, setMetrics] = useState({
    coherence: 98.4,
    velocity: 2.4,
    depth: 16,
    activeAgents: 4
  });

  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scrolling console logs (inside the terminal container only!)
  useEffect(() => {
    const container = terminalContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [logs]);

  // Initial streaming simulation
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < DEFAULT_STREAM.length) {
        setLogs((prev) => [...prev, DEFAULT_STREAM[index]]);
        index++;
      } else {
        // Subtle drift in metrics to make it look alive
        setMetrics((prev) => ({
          coherence: parseFloat((98.0 + Math.random() * 1.5).toFixed(1)),
          velocity: parseFloat((2.1 + Math.random() * 0.6).toFixed(1)),
          depth: Math.floor(14 + Math.random() * 4),
          activeAgents: prev.activeAgents
        }));
      }
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCmd = inputVal.trim().toLowerCase();
    if (!cleanCmd) return;

    setLogs((prev) => [...prev, `> ${inputVal}`]);
    setInputVal('');

    // Remove leading slash if typed
    const cmdKey = cleanCmd.startsWith('/') ? cleanCmd.substring(1) : cleanCmd;

    if (cmdKey === 'clear') {
      setLogs([]);
      return;
    }

    if (cmdKey in COMMAND_LOGS) {
      const response = COMMAND_LOGS[cmdKey];
      // Highlight corresponding visual nodes
      if (cmdKey === 'search') setActiveNode(1);
      if (cmdKey === 'synthesize') setActiveNode(2);
      if (cmdKey === 'optimize') setActiveNode(3);

      response.forEach((logItem, idx) => {
        setTimeout(() => {
          setLogs((prev) => [...prev, logItem.text]);
        }, idx * 350);
      });

      // Clear highlights after a delay
      setTimeout(() => {
        setActiveNode(null);
      }, 2500);

      // Mutate metrics in response to commands
      if (cmdKey === 'optimize') {
        setMetrics((prev) => ({ ...prev, velocity: 1.1, coherence: 99.8 }));
      } else if (cmdKey === 'search') {
        setMetrics((prev) => ({ ...prev, activeAgents: 8 }));
      }
    } else {
      setLogs((prev) => [
        ...prev,
        `[ERROR] Unknown command: "${inputVal}". Type "/help" for system commands.`
      ]);
    }
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
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]"></span>
          </span>
          <span className="font-audiowide text-sm tracking-[0.15em] uppercase text-black/70">
            Atlas Diagnostic Console
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
        </div>
      </div>

      {/* METRIC PILLS CONTAINER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#ede5d1]/60 border border-black/5 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider">Cognitive Sync</span>
          <span className="text-xl font-bold font-audiowide text-amber-700 mt-1 select-none">
            {metrics.coherence}%
          </span>
        </div>
        <div className="bg-[#ede5d1]/60 border border-black/5 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider">Search Latency</span>
          <span className="text-xl font-bold font-audiowide text-amber-700 mt-1 select-none">
            {metrics.velocity} ms
          </span>
        </div>
        <div className="bg-[#ede5d1]/60 border border-black/5 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider">Reasoning Depth</span>
          <span className="text-xl font-bold font-audiowide text-amber-700 mt-1 select-none">
            {metrics.depth} Layers
          </span>
        </div>
        <div className="bg-[#ede5d1]/60 border border-black/5 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-black/45 uppercase tracking-wider">Active Agents</span>
          <span className="text-xl font-bold font-audiowide text-[#10b981] mt-1 select-none">
            {metrics.activeAgents} Spawned
          </span>
        </div>
      </div>

      {/* DYNAMIC PIPELINE SVG MAP */}
      <div className="bg-[#ede5d1]/40 border border-black/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-2 left-3 text-[9px] font-semibold text-black/35 uppercase tracking-widest">
          Active Reasoning Pipeline Map
        </div>
        
        <svg 
          viewBox="0 0 420 120" 
          className="w-full max-w-[380px] h-[90px] mt-2 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
        >
          {/* Connector Paths (Pipelines) */}
          <path 
            d="M 60,60 L 190,60" 
            fill="none" 
            stroke="rgba(0,0,0,0.08)" 
            strokeWidth="3" 
            strokeDasharray="4,4" 
            className="animate-[dash_12s_linear_infinite]"
          />
          <path 
            d="M 190,60 L 320,60" 
            fill="none" 
            stroke="rgba(0,0,0,0.08)" 
            strokeWidth="3" 
            strokeDasharray="4,4" 
            className="animate-[dash_12s_linear_infinite]"
          />

          {/* Traveling Web3 Vector Packets */}
          <circle r="4" fill="#d4a017">
            <animateMotion 
              dur="4s" 
              repeatCount="indefinite" 
              path="M 60,60 L 190,60"
            />
          </circle>
          <circle r="4" fill="#10b981">
            <animateMotion 
              dur="3s" 
              begin="1.5s" 
              repeatCount="indefinite" 
              path="M 190,60 L 320,60"
            />
          </circle>

          {/* Node 1: Task Parser */}
          <g 
            className="cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => setActiveNode(1)}
          >
            <circle 
              cx="60" 
              cy="60" 
              r="22" 
              fill={activeNode === 1 ? '#d4a017' : '#ede5d1'} 
              stroke={activeNode === 1 ? '#d4a017' : 'rgba(0,0,0,0.1)'} 
              strokeWidth="2" 
              className="transition-all duration-300"
            />
            <text 
              x="60" 
              y="64" 
              textAnchor="middle" 
              className={`text-[9px] font-bold ${activeNode === 1 ? 'fill-white' : 'fill-black/60'} select-none`}
            >
              PARSER
            </text>
          </g>

          {/* Node 2: Crawler Agent */}
          <g 
            className="cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => setActiveNode(2)}
          >
            <circle 
              cx="190" 
              cy="60" 
              r="22" 
              fill={activeNode === 2 ? '#d4a017' : '#ede5d1'} 
              stroke={activeNode === 2 ? '#d4a017' : 'rgba(0,0,0,0.1)'} 
              strokeWidth="2"
              className="transition-all duration-300"
            />
            <text 
              x="190" 
              y="64" 
              textAnchor="middle" 
              className={`text-[9px] font-bold ${activeNode === 2 ? 'fill-white' : 'fill-black/60'} select-none`}
            >
              CRAWL
            </text>
          </g>

          {/* Node 3: Synthesizer */}
          <g 
            className="cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => setActiveNode(3)}
          >
            <circle 
              cx="320" 
              cy="60" 
              r="22" 
              fill={activeNode === 3 ? '#d4a017' : '#ede5d1'} 
              stroke={activeNode === 3 ? '#d4a017' : 'rgba(0,0,0,0.1)'} 
              strokeWidth="2"
              className="transition-all duration-300"
            />
            <text 
              x="320" 
              y="64" 
              textAnchor="middle" 
              className={`text-[8px] font-bold ${activeNode === 3 ? 'fill-white' : 'fill-black/60'} select-none`}
            >
              SYNTH
            </text>
          </g>
        </svg>

        {/* Hover / Active Node Details */}
        <div className="text-[10px] text-black/50 text-center select-none font-medium mt-2 h-4">
          {activeNode === 1 && 'Node 01: Breaking raw queries into sub-tasks (Active)'}
          {activeNode === 2 && 'Node 02: Launching deep-crawlers and vector indexing (Active)'}
          {activeNode === 3 && 'Node 03: Alchemizing findings into clear structured outcomes (Active)'}
          {!activeNode && 'Click nodes to inspect live processing pipelines'}
        </div>
      </div>

      {/* AGENT STREAM TERMINAL */}
      <div className="flex flex-col flex-grow bg-black/90 border border-white/5 shadow-2xl rounded-2xl overflow-hidden min-h-[160px] max-h-[220px]">
        {/* Terminal logs viewer */}
        <div 
          ref={terminalContainerRef}
          className="flex-grow p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-amber-100 flex flex-col gap-1 scrollbar-none"
        >
          {logs.map((log, index) => {
            if (!log || typeof log !== 'string') return null;
            let textColor = 'text-[#e6dfd1]';
            if (log.startsWith('>')) textColor = 'text-[#AAFFC7] font-bold';
            else if (log.includes('[SUCCESS]')) textColor = 'text-[#10b981]';
            else if (log.includes('[ERROR]')) textColor = 'text-red-400 font-semibold';
            else if (log.includes('[WARNING]') || log.includes('[Synthesizer] Resolving')) textColor = 'text-amber-400';
            else if (log.startsWith('[ATLAS')) textColor = 'text-[#e2c174] font-semibold';

            return (
              <div key={index} className={`${textColor} break-words`}>
                {log}
              </div>
            );
          })}
        </div>

        {/* Interactive command input */}
        <form 
          onSubmit={handleCommandSubmit}
          className="flex items-center border-t border-white/10 bg-black/95 px-3 py-2"
        >
          <span className="font-mono text-[12px] text-[#AAFFC7] font-bold mr-1.5 select-none">{`>`}</span>
          <input
            type="text"
            className="flex-grow bg-transparent text-[11px] font-mono text-white outline-none border-none placeholder-gray-600 caret-[#AAFFC7]"
            placeholder="Type /search, /synthesize, /optimize, or /help..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
        </form>
      </div>

      {/* Styled inline scrollbar hides and dash keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -120;
          }
        }
      `}} />
    </div>
  );
}
