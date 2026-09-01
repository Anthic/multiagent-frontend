'use client';

import React, { useState, useMemo } from 'react';
import { IPaper } from '@/src/services/paperService';
import { buildSemanticGraphFromPaper } from './graph/graphGenerator';
import { SemanticGraph3D } from './graph/SemanticGraph3D';
import { NodeInspectorDrawer } from './graph/NodeInspectorDrawer';
import { IGraphNode, NodeType } from './graph/graphTypes';

interface CitationGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: IPaper;
}

export function CitationGraphModal({
  isOpen,
  onClose,
  paper,
}: CitationGraphModalProps) {
  const [selectedNode, setSelectedNode] = useState<IGraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | NodeType>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const graphData = useMemo(() => {
    return buildSemanticGraphFromPaper(paper);
  }, [paper]);

  if (!isOpen) return null;

  const citationsCount = paper.citations?.length || 0;
  const gapCount = graphData.nodes.filter((n) => n.type === 'gap').length;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200 ${
        isFullscreen ? 'p-0' : ''
      }`}
    >
      <div
        className={`relative flex flex-col bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-screen h-screen rounded-none'
            : 'w-full max-w-6xl h-[88vh] rounded-2xl'
        }`}
      >
        {/* ── Top Bar Controls ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 bg-zinc-900/80 px-4 sm:px-6 py-3 gap-3 shrink-0 backdrop-blur-md">
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-[#AAFFC7] font-bold text-sm border border-emerald-500/30">
              🌐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white leading-none">
                  Semantic Citation Knowledge Graph
                </h2>
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                  3D View
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 truncate max-w-sm sm:max-w-md">
                {paper.title || 'Untitled Research Paper'}
              </p>
            </div>
          </div>

          {/* Right Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative w-44 sm:w-56">
              <input
                type="text"
                placeholder="Search literature node..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-1.5 pl-3 pr-7 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] focus:ring-1 focus:ring-[#AAFFC7]/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                  activeFilter === 'all'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All ({graphData.nodes.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('citation')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                  activeFilter === 'citation'
                    ? 'bg-zinc-800 text-sky-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Citations
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('gap')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                  activeFilter === 'gap'
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Gaps ({gapCount})
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-850 transition-colors cursor-pointer hidden md:inline-block"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? 'Exit' : '⛶'}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              title="Close knowledge map"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Main Workspace Body ──────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* 3D Canvas Viewport */}
          <SemanticGraph3D
            data={graphData}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
          />

          {/* Node Inspector Drawer */}
          {selectedNode && (
            <NodeInspectorDrawer
              node={selectedNode}
              allNodes={graphData.nodes}
              onClose={() => setSelectedNode(null)}
              onSelectNode={setSelectedNode}
            />
          )}
        </div>

        {/* ── Bottom Summary Footer ────────────────────────────────────────────── */}
        <div className="h-9 border-t border-zinc-900 bg-zinc-950 px-4 sm:px-6 flex items-center justify-between text-[11px] text-zinc-500 font-mono shrink-0">
          <div className="flex items-center gap-4">
            <span>Nodes: {graphData.nodes.length}</span>
            <span>Links: {graphData.links.length}</span>
            <span>Citations: {citationsCount}</span>
            <span className="text-amber-400/90">Gaps Mapped: {gapCount}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-zinc-500">
            <span>Drag to rotate • Scroll to zoom • Click node to inspect</span>
          </div>
        </div>
      </div>
    </div>
  );
}
