'use client';

import React, { useEffect } from 'react';

interface DeletePaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  paperTitle?: string;
}

export function DeletePaperModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  paperTitle,
}: DeletePaperModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => !isDeleting && onClose()}
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-paper-title"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 mb-4 border border-rose-500/20 shadow-lg shadow-rose-500/10">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        <h3 id="delete-paper-title" className="text-base font-bold text-white tracking-tight">
          Delete Research Paper?
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {paperTitle ? (
            <>
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-zinc-200 break-words">"{paperTitle}"</span>?
            </>
          ) : (
            'Are you sure you want to permanently delete this paper?'
          )}
          <br />
          <span className="text-rose-400/90 font-medium">This action cannot be undone.</span>
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeOpacity="1" />
                </svg>
                <span>Deleting Paper...</span>
              </>
            ) : (
              <span>Delete Paper</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
