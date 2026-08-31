'use client';

import React from 'react';
import { IPaper } from '@/src/services/paperService';

interface PaperStatsBarProps {
  papers: IPaper[];
}

export function PaperStatsBar({ papers }: PaperStatsBarProps) {
  const draftsCount = papers.filter((p) => (p.status || 'draft') === 'draft').length;
  const publishedCount = papers.filter((p) => p.status === 'published').length;
  const totalCitations = papers.reduce((acc, p) => acc + (p.citations?.length || 0), 0);

  const stats = [
    {
      label: 'Total Papers',
      value: papers.length,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      color: 'text-[#AAFFC7]',
      bg: 'bg-[#AAFFC7]/10',
      border: 'border-[#AAFFC7]/20',
    },
    {
      label: 'Draft Works',
      value: draftsCount,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
    },
    {
      label: 'Published',
      value: publishedCount,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
    },
    {
      label: 'Total Citations',
      value: totalCitations,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'border-cyan-400/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-3 rounded-2xl border ${item.border} bg-zinc-950/60 p-3.5 backdrop-blur-md transition-all hover:bg-zinc-900/60`}
        >
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
            {item.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-zinc-400 truncate">{item.label}</p>
            <p className="text-base sm:text-lg font-bold text-white tracking-tight">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
