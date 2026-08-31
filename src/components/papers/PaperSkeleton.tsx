'use client';

import React from 'react';

interface PaperSkeletonProps {
  count?: number;
}

export function PaperSkeleton({ count = 6 }: PaperSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 flex flex-col justify-between"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-800/20 to-transparent" />

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="h-5 w-3/4 rounded-lg bg-zinc-800/70 animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-zinc-800/50 shrink-0 animate-pulse" />
            </div>

            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full rounded bg-zinc-800/50 animate-pulse" />
              <div className="h-3.5 w-5/6 rounded bg-zinc-800/40 animate-pulse" />
              <div className="h-3.5 w-4/6 rounded bg-zinc-800/30 animate-pulse" />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-900/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 rounded bg-zinc-800/60 animate-pulse" />
            </div>
            <div className="h-4 w-16 rounded bg-zinc-800/40 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
