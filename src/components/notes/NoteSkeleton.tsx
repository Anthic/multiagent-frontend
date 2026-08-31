'use client';

import React from 'react';

interface NoteSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

export function NoteSkeleton({ count = 6, viewMode = 'grid' }: NoteSkeletonProps) {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
          : 'flex flex-col gap-3'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 ${
            viewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4' : 'flex flex-col justify-between'
          }`}
        >
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-800/20 to-transparent" />

          <div className="flex-1 space-y-3">
            {/* Title & Badge Skeleton */}
            <div className="flex items-start justify-between gap-3">
              <div className="h-4.5 w-3/4 rounded-lg bg-zinc-800/70 animate-pulse" />
              <div className="h-4 w-12 rounded-full bg-zinc-800/50 shrink-0 animate-pulse" />
            </div>

            {/* Content Lines */}
            <div className="space-y-2 pt-1">
              <div className="h-3 w-full rounded bg-zinc-800/50 animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-zinc-800/40 animate-pulse" />
              {viewMode === 'grid' && (
                <div className="h-3 w-4/6 rounded bg-zinc-800/30 animate-pulse" />
              )}
            </div>
          </div>

          {/* Footer Skeleton */}
          <div
            className={`flex items-center justify-between gap-2 pt-4 border-t border-zinc-900/80 ${
              viewMode === 'list' ? 'sm:border-t-0 sm:pt-0 sm:shrink-0 sm:min-w-[200px]' : 'mt-4'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-14 rounded-md bg-zinc-800/60 animate-pulse" />
              <div className="h-5 w-12 rounded-md bg-zinc-800/40 animate-pulse" />
            </div>
            <div className="h-3 w-16 rounded bg-zinc-800/40 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
