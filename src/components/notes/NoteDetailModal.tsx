'use client';

import React, { useEffect, useState } from 'react';
import { INote, noteService } from '@/src/services/noteService';
import { showAppToast } from '@/src/components/ui/appToastEvents';

interface NoteDetailModalProps {
  note: INote | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (note: INote) => void;
  onDelete: (noteId: string) => void;
}

export function NoteDetailModal({
  note,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: NoteDetailModalProps) {
  const [detailedNote, setDetailedNote] = useState<INote | null>(note);
  const [isLoadingFresh, setIsLoadingFresh] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !note) {
      setDetailedNote(null);
      return;
    }

    setDetailedNote(note);

    const noteId = note.id || note._id;
    if (noteId) {
      let isMounted = true;
      setIsLoadingFresh(true);
      noteService
        .getSingleNote(noteId)
        .then((freshData) => {
          if (isMounted && freshData && (freshData.id || freshData._id || freshData.title)) {
            setDetailedNote(freshData);
          }
        })
        .catch(() => {
          // Fall back gracefully to the initial note data passed via props
        })
        .finally(() => {
          if (isMounted) setIsLoadingFresh(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, note]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !detailedNote) return null;

  const noteId = detailedNote.id || detailedNote._id || '';

  const handleCopy = () => {
    const textToCopy = `${detailedNote.title}\n\n${detailedNote.content}${
      detailedNote.sourceUrl ? `\n\nSource: ${detailedNote.sourceUrl}` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    showAppToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: 'Note content copied.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEditClick = () => {
    onClose();
    onEdit(detailedNote);
  };

  const handleDeleteClick = () => {
    if (noteId) {
      onClose();
      onDelete(noteId);
    }
  };

  const formatFullDate = (d?: string | Date) => {
    if (!d) return 'N/A';
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-detail-title"
      >
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#AAFFC7]/15 text-[#AAFFC7] text-xs font-bold">
                📝
              </span>
              <h2
                id="note-detail-title"
                className="text-lg sm:text-xl font-bold text-white tracking-tight break-words"
              >
                {detailedNote.title}
              </h2>
            </div>

            {/* Timestamps */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500 font-mono">
              {detailedNote.createdAt && (
                <span>Created: {formatFullDate(detailedNote.createdAt)}</span>
              )}
              {detailedNote.updatedAt && (
                <span>Updated: {formatFullDate(detailedNote.updatedAt)}</span>
              )}
              {isLoadingFresh && (
                <span className="text-[#AAFFC7] animate-pulse">Syncing...</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close note details"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-5">
          {/* Main Note Content */}
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-800/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Note Content
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <span className="text-[#AAFFC7]">✓</span>
                    <span className="text-[#AAFFC7]">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans select-text">
              {detailedNote.content}
            </p>
          </div>

          {/* Audio Player if audioUrl exists */}
          {detailedNote.audioUrl && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <span>🎙️</span>
                <span>Voice Memo Recording</span>
              </div>
              <audio
                controls
                className="w-full h-10 rounded-lg accent-[#AAFFC7] focus:outline-none"
                src={detailedNote.audioUrl}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Source Link if sourceUrl exists */}
          {detailedNote.sourceUrl && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">🔗</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-violet-200">Source Reference</p>
                  <p className="text-[11px] text-violet-300/70 truncate font-mono">
                    {detailedNote.sourceUrl}
                  </p>
                </div>
              </div>
              <a
                href={detailedNote.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600/30 border border-violet-500/30 px-3.5 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-600/50 hover:text-white transition-all shrink-0"
              >
                <span>View Source</span>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}

          {/* Tags */}
          {detailedNote.tags && detailedNote.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detailedNote.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-4 shrink-0">
          <button
            type="button"
            onClick={handleDeleteClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete Note</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#AAFFC7] px-4 py-2 text-xs font-bold text-black hover:bg-[#99f3b8] active:scale-95 transition-all shadow-md shadow-[#AAFFC7]/20 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Edit Note</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
