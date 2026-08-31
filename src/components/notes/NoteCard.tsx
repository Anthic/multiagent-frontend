'use client';

import React, { useState } from 'react';
import { INote } from '@/src/services/noteService';
import { showAppToast } from '@/src/components/ui/appToastEvents';

interface NoteCardProps {
  note: INote;
  onView: (note: INote) => void;
  onEdit: (note: INote) => void;
  onDelete: (noteId: string) => void;
  onTagClick?: (tag: string) => void;
  viewMode?: 'grid' | 'list';
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

function getHostName(url?: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'Source';
  }
}

export function NoteCard({
  note,
  onView,
  onEdit,
  onDelete,
  onTagClick,
  viewMode = 'grid',
}: NoteCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const noteId = note.id || note._id || '';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${note.title}\n\n${note.content}${
      note.sourceUrl ? `\n\nSource: ${note.sourceUrl}` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    showAppToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `"${note.title}" copied.`,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(note);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (noteId) onDelete(noteId);
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleTagBadgeClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onTagClick?.(tag);
  };

  const relativeTime = formatRelativeTime(note.updatedAt || note.createdAt);
  const sourceHost = getHostName(note.sourceUrl);

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onView(note)}
        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/60 hover:shadow-lg backdrop-blur-md cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView(note);
          }
        }}
        aria-label={`View note ${note.title}`}
      >
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors truncate max-w-md">
              {note.title}
            </h3>
            {note.audioUrl && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                🎙️ Audio
              </span>
            )}
            {note.sourceUrl && (
              <a
                href={note.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSourceClick}
                className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-300 hover:bg-violet-500/20 transition-colors"
                title={note.sourceUrl}
              >
                🔗 {sourceHost || 'Source'}
              </a>
            )}
          </div>

          <p className="mt-1 text-xs text-zinc-400 line-clamp-1 leading-relaxed">
            {note.content}
          </p>

          {note.tags && note.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {note.tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={(e) => handleTagBadgeClick(e, t)}
                  className="rounded bg-zinc-900/80 border border-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 hover:text-[#AAFFC7] hover:border-[#AAFFC7]/30 transition-colors"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900">
          <span className="text-[11px] text-zinc-500 font-mono">
            {relativeTime}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Copy note content"
              aria-label="Copy note"
            >
              {isCopied ? (
                <span className="text-xs text-[#AAFFC7]">✓</span>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={handleEdit}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Edit note"
              aria-label="Edit note"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-950/60 hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete note"
              aria-label="Delete note"
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

  // Grid view (Default)
  return (
    <div
      onClick={() => onView(note)}
      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/50 hover:shadow-xl hover:-translate-y-1 backdrop-blur-md cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView(note);
        }
      }}
      aria-label={`View note ${note.title}`}
    >
      <div>
        {/* Top bar: title + actions */}
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
            {note.title}
          </h3>

          <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
              title="Copy note"
              aria-label="Copy note"
            >
              {isCopied ? (
                <span className="text-xs text-[#AAFFC7]">✓</span>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={handleEdit}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
              title="Edit note"
              aria-label="Edit note"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-950/60 hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete note"
              aria-label="Delete note"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content preview */}
        <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed line-clamp-4 whitespace-pre-wrap">
          {note.content}
        </p>

        {/* Badges / indicators (Source & Audio) */}
        {(note.sourceUrl || note.audioUrl) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {note.sourceUrl && (
              <a
                href={note.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSourceClick}
                className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300 hover:bg-violet-500/25 transition-colors"
                title={note.sourceUrl}
              >
                <span>🔗</span>
                <span className="truncate max-w-[120px]">{sourceHost || 'View Source'}</span>
                <svg className="w-2.5 h-2.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}

            {note.audioUrl && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                <span>🎙️</span>
                <span>Audio Memo</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Tags & relative time */}
      <div className="mt-4 pt-3.5 border-t border-zinc-900 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap items-center gap-1">
          {note.tags && note.tags.length > 0 ? (
            note.tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={(e) => handleTagBadgeClick(e, t)}
                className="rounded bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400 hover:text-[#AAFFC7] hover:border-[#AAFFC7]/30 transition-colors"
              >
                #{t}
              </button>
            ))
          ) : (
            <span className="text-[10px] text-zinc-600 italic">No tags</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
          <svg className="w-3 h-3 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{relativeTime}</span>
        </div>
      </div>
    </div>
  );
}
