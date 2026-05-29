'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogItem {
  sender: 'SYSTEM' | 'FRONTEND' | 'ORCHESTRATOR' | 'BACKEND';
  text: string;
  type: 'info' | 'success' | 'warn' | 'action';
}

const SYSTEM_FLOW_LOGS: LogItem[] = [
  { sender: 'FRONTEND', text: 'User inputs prompt in multiagent-frontend UI: "Analyze global EV trends"', type: 'action' },
  { sender: 'SYSTEM', text: 'React client establishes persistent secure WebSocket connection...', type: 'info' },
  { sender: 'ORCHESTRATOR', text: 'MultiAgentPart Gateway intercepting client payload...', type: 'action' },
  { sender: 'ORCHESTRATOR', text: 'Routing vector parameters & query specs to Backend Server...', type: 'info' },
  { sender: 'BACKEND', text: 'MultiAgentPart-Backend received query. Spawning agent cluster...', type: 'action' },
  { sender: 'BACKEND', text: 'Task Parser agent decomposes objective into 3 sub-tasks...', type: 'info' },
  { sender: 'BACKEND', text: 'Deep Search agent crawls source repositories & indexes vector layers...', type: 'action' },
  { sender: 'BACKEND', text: 'Synthesizer agent resolves conflicts and compiles semantic report...', type: 'action' },
  { sender: 'SYSTEM', text: 'Backend compiling final payload. Dispatching via Gateway stream...', type: 'info' },
  { sender: 'FRONTEND', text: 'multiagent-frontend state hydrated. Final markdown output rendered to user!', type: 'success' }
];

export function AgentWorkflowPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Frontend, 2: Orchestrator, 3: Backend, 4: Synchronized/Done
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [showReport, setShowReport] = useState(false);

  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside the terminal container only
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const runWorkflow = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStep(1);
    setLogs([]);
    setShowReport(false);

    // Timeline steps representing the directory flows
    const delayTimeline = [
      { step: 1, logIdx: 0 },
      { step: 1, logIdx: 1 },
      { step: 2, logIdx: 2 },
      { step: 2, logIdx: 3 },
      { step: 3, logIdx: 4 },
      { step: 3, logIdx: 5 },
      { step: 3, logIdx: 6 },
      { step: 3, logIdx: 7 },
      { step: 4, logIdx: 8 },
      { step: 4, logIdx: 9 }
    ];

    delayTimeline.forEach((item, index) => {
      setTimeout(() => {
        setCurrentStep(item.step);
        setLogs((prev) => [...prev, SYSTEM_FLOW_LOGS[item.logIdx]]);
        
        if (index === delayTimeline.length - 1) {
          setIsRunning(false);
          setShowReport(true);
        }
      }, (index + 1) * 800);
    });
  };

  return (
    <div 
      className="w-full relative z-10 rounded-3xl border border-[#ded8c9] bg-[#f2ebd9]/45 backdrop-blur-xl p-6 md:p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] flex flex-col gap-6"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)'
      }}
    >
      {/* PANEL HEADER */}
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex size-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isRunning ? 'bg-[#7c3aed]' : 'bg-[#10b981]'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full size-3 ${isRunning ? 'bg-[#7c3aed]' : 'bg-[#10b981]'}`}></span>
          </span>
          <span className="font-audiowide text-sm tracking-[0.15em] uppercase text-black/70">
            System Core Architecture Flow
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-black/10" />
          <span className="size-2.5 rounded-full bg-black/10" />
          <span className="size-2.5 rounded-full bg-black/10" />
        </div>
      </div>

      {/* SVG REPO PIPELINE FLOW */}
      <div className="bg-[#ede5d1]/40 border border-black/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden h-[180px]">
        <svg viewBox="0 0 400 160" className="w-full max-w-[340px] h-[130px]">
          {/* Connector curves */}
          <path 
            d="M 60,80 Q 130,45 200,80" 
            fill="none" 
            stroke={currentStep >= 2 ? '#7c3aed' : 'rgba(0,0,0,0.06)'} 
            strokeWidth="3" 
            strokeDasharray={isRunning && currentStep === 1 ? '5,5' : '0'}
            className="transition-all duration-500 animate-[dash_12s_linear_infinite]"
          />
          <path 
            d="M 200,80 Q 270,115 340,80" 
            fill="none" 
            stroke={currentStep >= 3 ? '#d4a017' : 'rgba(0,0,0,0.06)'} 
            strokeWidth="3" 
            strokeDasharray={isRunning && currentStep === 2 ? '5,5' : '0'}
            className="transition-all duration-500 animate-[dash_12s_linear_infinite]"
          />

          {/* Node 1: multiagent-frontend */}
          <g className="cursor-pointer">
            <circle 
              cx="60" 
              cy="80" 
              r="24" 
              fill={currentStep >= 1 ? '#7c3aed' : '#ede5d1'} 
              className="transition-all duration-300"
            />
            <text x="60" y="83" textAnchor="middle" className={`text-[6px] font-bold ${currentStep >= 1 ? 'fill-white' : 'fill-black/60'} font-mono`}>
              FRONTEND
            </text>
          </g>

          {/* Node 2: MultiAgentPart (Gateway) */}
          <g className="cursor-pointer">
            <circle 
              cx="200" 
              cy="80" 
              r="24" 
              fill={currentStep >= 2 ? '#06b6d4' : '#ede5d1'} 
              className="transition-all duration-300"
            />
            <text x="200" y="83" textAnchor="middle" className={`text-[6px] font-bold ${currentStep >= 2 ? 'fill-white' : 'fill-black/60'} font-mono`}>
              GATEWAY
            </text>
          </g>

          {/* Node 3: MultiAgentPart-Backend */}
          <g className="cursor-pointer">
            <circle 
              cx="340" 
              cy="80" 
              r="24" 
              fill={currentStep >= 4 ? '#10b981' : currentStep >= 3 ? '#d4a017' : '#ede5d1'} 
              className="transition-all duration-300"
            />
            <text x="340" y="83" textAnchor="middle" className={`text-[6px] font-bold ${currentStep >= 3 ? 'fill-white' : 'fill-black/60'} font-mono`}>
              BACKEND
            </text>
          </g>
        </svg>

        {/* Live step label */}
        <div className="absolute bottom-2 text-center text-[10px] font-semibold text-black/55 select-none">
          {currentStep === 0 && 'Click below to execute dynamic architecture flow demo'}
          {currentStep === 1 && 'Step 1/3: Gaining prompt & launching client in multiagent-frontend...'}
          {currentStep === 2 && 'Step 2/3: MultiAgentPart Gateway routing vector specifications...'}
          {currentStep === 3 && 'Step 3/3: MultiAgentPart-Backend processing agent coordination tasks...'}
          {currentStep === 4 && 'Complete: Sync payload returning to multiagent-frontend UI!'}
        </div>
      </div>

      {/* CONSOLE OR FINAL REPORT DISPLAY */}
      <div className="relative flex flex-col bg-black/90 border border-white/5 shadow-2xl rounded-2xl overflow-hidden min-h-[140px] max-h-[180px]">
        <AnimatePresence mode="wait">
          {!showReport ? (
            <motion.div 
              key="terminal"
              ref={consoleRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#ede5d1] flex flex-col gap-1 scrollbar-none"
            >
              {logs.length === 0 && (
                <span className="text-gray-500 italic select-none">Awaiting system workflow execution…</span>
              )}
              {logs.map((log, index) => {
                let senderColor = 'text-amber-300';
                if (log.sender === 'FRONTEND') senderColor = 'text-[#7c3aed] font-bold';
                else if (log.sender === 'ORCHESTRATOR') senderColor = 'text-cyan-400 font-semibold';
                else if (log.sender === 'BACKEND') senderColor = 'text-[#d4a017] font-semibold';
                else if (log.sender === 'SYSTEM') senderColor = 'text-gray-400';

                let textColor = 'text-gray-200';
                if (log.type === 'success') textColor = 'text-[#10b981] font-bold';
                if (log.type === 'warn') textColor = 'text-amber-400 italic';

                return (
                  <div key={index} className="break-words">
                    <span className={`${senderColor} select-none`}>[{log.sender}]</span>{' '}
                    <span className={textColor}>{log.text}</span>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-grow p-4 overflow-y-auto font-sans text-white flex flex-col gap-2 scrollbar-none"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[11px] font-mono uppercase text-[#AAFFC7] tracking-widest font-bold">System Flow Verified</span>
                <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/70">Port Status: Active</span>
              </div>
              <h3 className="text-xs font-bold text-gray-100 uppercase tracking-wider">How to Run the Platform Workflows</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] mt-1">
                <div className="bg-white/5 border border-white/10 p-2 rounded">
                  <span className="text-purple-400 font-bold block text-[9px] uppercase tracking-wider">1. Frontend Client</span>
                  <p className="text-gray-400 text-[8.5px] mt-1">Run <code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono">npm run dev</code> inside <code className="text-white">multiagent-frontend</code> to render diagnostic panels.</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-2 rounded">
                  <span className="text-[#d4a017] font-bold block text-[9px] uppercase tracking-wider">2. Backend Engine</span>
                  <p className="text-gray-400 text-[8.5px] mt-1">Run <code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono">npm run dev</code> inside <code className="text-white">MultiAgentPart-Backend</code> to execute agent nodes.</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-2 rounded text-[8.5px] text-gray-400 leading-normal">
                <strong className="text-white font-mono">3. Client-Server Interaction:</strong> Enter any prompt in the Hero panel. The React UI forwards requests via HTTP/WS to the multi-agent backend where task parsers coordinate data collection and return beautiful, clean reports directly to your browser!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DYNAMIC EXECUTE TRIGGER */}
      <button
        onClick={runWorkflow}
        disabled={isRunning}
        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-black via-[#191919] to-[#3a3a3a] px-5 py-3.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
        <span className="relative">
          {isRunning ? 'Orchestrating Repository Flow…' : 'Execute Repository Flow Demo'}
        </span>
      </button>

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
