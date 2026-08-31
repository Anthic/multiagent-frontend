'use client';

import React from 'react';
import { INote } from '@/src/services/noteService';

interface NotesStatsBarProps {
  notes: INote[];
  tags: string[];
}

export function NotesStatsBar({ notes, tags }: NotesStatsBarProps) {
  const sourcesCount = notes.filter((n) => Boolean(n.sourceUrl)).length;
  const audioCount = notes.filter((n) => Boolean(n.audioUrl)).length;

  const stats = [
    {
      label: 'Total Notes',
      value: notes.length,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      color: 'text-[#AAFFC7]',
      bg: 'bg-[#AAFFC7]/10',
      border: 'border-[#AAFFC7]/20',
    },
    {
      label: 'Active Tags',
      value: tags.length,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
      border: 'border-cyan-400/20',
    },
    {
      label: 'Linked Sources',
      value: sourcesCount,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      color: 'text-violet-400',
      bg: 'bg-violet-400/10',
      border: 'border-violet-400/20',
    },
    {
      label: 'Audio Memos',
      value: audioCount,
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      ),
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      {stats.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-3 rounded-xl border ${item.border} bg-zinc-950/50 p-3 backdrop-blur-md transition-all hover:bg-zinc-900/60`}
        >
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
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
