'use client';

import React from 'react';
import { IPaper } from '@/src/services/paperService';

interface PaperCardProps {
  paper: IPaper;
  onOpen: (paper: IPaper) => void;
  onDelete: (paperId: string) => void;
  onOpenSlides?: (paper: IPaper) => void;
  onOpenGraph?: (paper: IPaper) => void;
}

function formatRelativeTime(dateString?: string | Date): string {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 45) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 14) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  draft: {
    label: 'Draft',
    bg: 'bg-zinc-800/80',
    text: 'text-zinc-300',
    border: 'border-zinc-700',
  },
  in_review: {
    label: 'In Review',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
  },
  published: {
    label: 'Published',
    bg: 'bg-[#AAFFC7]/15',
    text: 'text-[#AAFFC7]',
    border: 'border-[#AAFFC7]/30',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
};

export function PaperCard({ paper, onOpen, onDelete, onOpenSlides, onOpenGraph }: PaperCardProps) {
  const paperId = paper.id || paper._id || '';
  const status = paper.status || 'draft';
  const statusBadge = statusConfig[status] || statusConfig.draft;
  const citationCount = paper.citations?.length || 0;
  const relativeTime = formatRelativeTime(paper.updatedAt || paper.createdAt);

  const previewContent =
    paper.abstract?.trim() ||
    paper.contentMarkdown?.replace(/[#*`_]/g, '').trim() ||
    'No abstract or content yet. Open editor to begin writing.';

  return (
    <div
      onClick={() => onOpen(paper)}
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 sm:p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/50 hover:shadow-xl hover:-translate-y-1 backdrop-blur-md cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(paper);
        }
      }}
      aria-label={`Open paper ${paper.title}`}
    >
      <div>
        {/* Top Header: Title & Status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
            {paper.title}
          </h3>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} shrink-0`}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Abstract / Preview */}
        <p className="mt-3 text-xs text-zinc-400 leading-relaxed line-clamp-3">
          {previewContent}
        </p>

        {/* Metadata badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-400">
            <svg className="w-3 h-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>{citationCount} {citationCount === 1 ? 'citation' : 'citations'}</span>
          </span>

          {paper.slidesMarkdown ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-400">
              <span>📑</span>
              <span>{paper.slideCount || 8} Slides</span>
            </span>
          ) : null}

          {paper.peerReviewResults && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[11px] font-medium text-emerald-400">
              <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Peer Reviewed</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="mt-5 pt-3.5 border-t border-zinc-900 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
          <svg className="w-3 h-3 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Updated {relativeTime}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenGraph && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenGraph(paper);
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-sky-300 hover:border-sky-500/40 hover:bg-sky-950/20 transition-all cursor-pointer"
              title="Explore 3D Semantic Citation Graph"
            >
              <span>🌐 Graph</span>
            </button>
          )}

          {onOpenSlides && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSlides(paper);
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-all cursor-pointer"
              title="Generate or view slides"
            >
              <span>📑 Slides</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(paper);
            }}
            className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-[#AAFFC7] hover:text-black hover:border-[#AAFFC7] transition-all cursor-pointer"
          >
            <span>Open</span>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (paperId) onDelete(paperId);
            }}
            className="rounded-xl p-1.5 text-zinc-500 hover:bg-rose-950/60 hover:text-rose-400 transition-colors cursor-pointer"
            title="Delete paper"
            aria-label="Delete paper"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
