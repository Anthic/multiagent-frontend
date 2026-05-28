'use client';

import { AgentVisualizerProps } from '@/src/types/research';
import React from 'react';



interface Node {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export const AgentVisualizer: React.FC<AgentVisualizerProps> = ({
  currentStage,
  progress,
  status,
  rewrittenQueries = [],
  outlinePlan = '',
}) => {
  const nodes: Node[] = [
    {
      id: 'planner',
      label: 'Planner',
      desc: 'Decomposing topic & drafting outline',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: 'searcher',
      label: 'Searcher',
      desc: 'Executing parallel multi-query web indexer',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: 'reader',
      label: 'Reader',
      desc: 'Scraping and downloading core source links',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: 'summarize',
      label: 'Summarizer',
      desc: 'Condensing and cleaning web texts',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
    },
    {
      id: 'rag',
      label: 'RAG Retriever',
      desc: 'Executing vector index semantic matches',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'writer',
      label: 'Writer',
      desc: 'Synthesizing comprehensive research report',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      id: 'fact_check',
      label: 'Fact Checker',
      desc: 'Validating claims against primary sources',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'critic',
      label: 'Critic Agent',
      desc: 'Scoring quality and directing rewrite loops',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      id: 'knowledge_graph',
      label: 'Knowledge Graph',
      desc: 'Constructing dynamic concept semantic links',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
  ];

  const getStageIndex = (stage: string) => {
    if (status === 'done') return nodes.length;
    if (status === 'queued' || status === 'idle') return -1;

    const mapping: Record<string, number> = {
      planner: 0,
      searcher: 1,
      reader: 2,
      summarize: 3,
      rag: 4,
      writer: 5,
      fact_check: 6,
      critic: 7,
      knowledge_graph: 8,
    };

    if (mapping[stage] !== undefined) return mapping[stage];

    // Progress percentage fallback mappings
    if (progress <= 15) return 0;
    if (progress <= 30) return 1;
    if (progress <= 45) return 2;
    if (progress <= 55) return 3;
    if (progress <= 65) return 4;
    if (progress <= 75) return 5;
    if (progress <= 85) return 6;
    if (progress <= 95) return 7;
    return 8;
  };

  const activeIndex = getStageIndex(currentStage);

  return (
    <div className="flex flex-col gap-4 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/5 p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-audiowide text-sm font-bold text-[#11100d] dark:text-white uppercase tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          MULTI-AGENT PIPELINE
        </h3>
        <span className="font-mono text-[8px] md:text-[9px] text-black/50 dark:text-white/45 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
          {status === 'running' ? 'EXECUTING GRAPH' : status === 'done' ? 'PROCESS COMPLETE' : status === 'queued' ? 'QUEUED' : 'STANDBY'}
        </span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        .active-connector {
          stroke: #10b981;
          stroke-dasharray: 6, 4;
          animation: dash 1s linear infinite;
        }
        .completed-connector {
          stroke: #10b981;
        }
      `}} />

      <div className="relative flex flex-col gap-2.5 py-2">
        {nodes.map((node, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex && status === 'running';
          const isPending = index > activeIndex || status === 'idle' || status === 'queued';

          let stateColor = 'border-black/10 dark:border-white/10 bg-white/60 dark:bg-black/40 text-black/45 dark:text-white/40';
          let glowStyle = {};

          if (isActive) {
            stateColor = 'border-emerald-500 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold scale-[1.03] shadow-[0_0_20px_rgba(16,185,129,0.25)]';
            glowStyle = {
              animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)',
            };
          } else if (isCompleted) {
            stateColor = 'border-emerald-500/50 bg-emerald-500/5 text-emerald-600 dark:text-emerald-500';
          }

          return (
            <div key={node.id} className="relative flex items-start gap-3.5">
              {index < nodes.length - 1 && (
                <div className="absolute left-[18px] top-9 w-0.5 h-6 -ml-[1px]">
                  <svg className="w-full h-full" viewBox="0 0 2 24" preserveAspectRatio="none">
                    <line
                      x1="1"
                      y1="0"
                      x2="1"
                      y2="24"
                      strokeWidth="2"
                      className={
                        index < activeIndex
                          ? 'stroke-emerald-500'
                          : index === activeIndex && status === 'running'
                          ? 'active-connector'
                          : 'stroke-black/10 dark:stroke-white/10 stroke-dasharray-[4_4]'
                      }
                    />
                  </svg>
                </div>
              )}

              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all duration-300 z-10 shrink-0 ${stateColor}`}
                style={glowStyle}
              >
                <div className="scale-90 flex items-center justify-center">{node.icon}</div>
              </div>

              <div className="flex flex-col pt-0.5">
                <span className={`text-xs tracking-wide ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : isCompleted ? 'text-black/80 dark:text-white/80' : 'text-black/45 dark:text-white/40'}`}>
                  {node.label}
                </span>
                <span className="text-[10px] font-mono tracking-wide text-black/45 dark:text-white/35 mt-0.5 leading-snug">
                  {isActive ? node.desc : isCompleted ? 'Task completed successfully' : 'Pending orchestrator queue'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {status === 'running' && (
        <div className="mt-2 p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl flex flex-col gap-3 font-mono text-[11px] leading-relaxed">
          {rewrittenQueries.length > 0 && activeIndex >= 1 && (
            <div className="flex flex-col gap-1">
              <span className="text-[#67C090] font-bold uppercase tracking-wider">➔ Searcher expanded queries:</span>
              <ul className="list-inside list-disc pl-2 text-black/75 dark:text-white/70 flex flex-col gap-0.5">
                {rewrittenQueries.map((q, idx) => (
                  <li key={`q-${idx}-${q.slice(0, 12)}`} className="truncate">"{q}"</li>
                ))}
              </ul>
            </div>
          )}

          {outlinePlan && activeIndex >= 0 && (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto border-t border-black/5 dark:border-white/5 pt-2">
              <span className="text-[#67C090] font-bold uppercase tracking-wider">➔ Decomposed blueprint plan:</span>
              <pre className="text-black/70 dark:text-white/60 whitespace-pre-wrap pl-2 leading-tight">
                {outlinePlan}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
