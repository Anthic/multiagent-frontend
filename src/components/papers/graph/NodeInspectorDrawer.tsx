'use client';

import React from 'react';
import { IGraphNode } from './graphTypes';

interface NodeInspectorDrawerProps {
  node: IGraphNode | null;
  allNodes: IGraphNode[];
  onClose: () => void;
  onSelectNode: (node: IGraphNode) => void;
}

const typeConfig: Record<
  IGraphNode['type'],
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  root_paper: {
    label: 'Primary Research Document',
    bg: 'bg-emerald-950/40',
    text: 'text-[#AAFFC7]',
    border: 'border-emerald-500/30',
    icon: '📄',
  },
  citation: {
    label: 'Literature Citation',
    bg: 'bg-sky-950/40',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
    icon: '📚',
  },
  gap: {
    label: 'Research Gap Void',
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    icon: '⚡',
  },
  concept: {
    label: 'Methodological Pillar',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    icon: '🔬',
  },
};

export function NodeInspectorDrawer({
  node,
  allNodes,
  onClose,
  onSelectNode,
}: NodeInspectorDrawerProps) {
  if (!node) return null;

  const cfg = typeConfig[node.type] || typeConfig.citation;

  // Find connected node objects
  const connectedNodes = allNodes.filter((n) => node.connections.includes(n.id));

  return (
    <div className="w-80 sm:w-96 border-l border-zinc-800/90 bg-zinc-950/95 p-5 flex flex-col justify-between overflow-y-auto backdrop-blur-xl animate-in slide-in-from-right duration-200 shadow-2xl z-20">
      <div className="space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: node.color }}
            />
            <span
              className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border}`}
            >
              {cfg.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer text-xs"
            title="Close inspector"
          >
            ✕
          </button>
        </div>

        {/* Node Title */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
            {node.label}
          </h3>
          {node.cluster && (
            <p className="mt-1 text-[11px] font-mono text-zinc-400">
              Cluster: <span className="text-zinc-200">{node.cluster}</span>
            </p>
          )}
        </div>

        {/* Metadata Details (Authors, Year, DOI) */}
        {(node.authors || node.year || node.doi) && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs space-y-2">
            {node.authors && node.authors.length > 0 && (
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Authors</p>
                <p className="text-zinc-300 text-xs font-medium mt-0.5">
                  {node.authors.join(', ')}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/80">
              {node.year && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Year: </span>
                  <span className="text-zinc-200 font-mono">{node.year}</span>
                </div>
              )}

              {node.citationsCount !== undefined && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Citations: </span>
                  <span className="text-emerald-400 font-mono font-bold">~{node.citationsCount}</span>
                </div>
              )}
            </div>

            {node.doi && (
              <div className="pt-1 border-t border-zinc-800/80">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">DOI Identifier</p>
                <a
                  href={`https://doi.org/${node.doi.replace(/^https?:\/\/doi.org\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline font-mono truncate block mt-0.5"
                >
                  {node.doi} ↗
                </a>
              </div>
            )}
          </div>
        )}

        {/* Abstract Snippet / Description */}
        {node.abstractSnippet && (
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Semantic Context / Scope
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed rounded-xl border border-zinc-850 bg-zinc-900/30 p-3 font-sans">
              {node.abstractSnippet}
            </p>
          </div>
        )}

        {/* Connected Graph Nodes */}
        {connectedNodes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Topology Relations ({connectedNodes.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {connectedNodes.map((cn) => (
                <button
                  key={cn.id}
                  type="button"
                  onClick={() => onSelectNode(cn)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: cn.color }}
                    />
                    <span className="text-[11px] text-zinc-300 group-hover:text-white truncate font-medium">
                      {cn.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono ml-2 shrink-0">
                    {cn.type === 'gap' ? 'Gap' : cn.type === 'concept' ? 'Pillar' : 'Paper'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* External Action Button */}
      {node.url && (
        <div className="pt-4 border-t border-zinc-900">
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <span>Open Source Literature</span>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
