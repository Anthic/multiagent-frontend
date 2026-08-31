'use client';

import React, { useEffect } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  noteTitle?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  noteTitle,
}: DeleteConfirmModalProps) {
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => !isDeleting && onClose()}
      />

      {/* Dialog Box */}
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 text-xl mb-4 border border-rose-500/20 shadow-lg shadow-rose-500/10">
          🗑️
        </div>

        <h3 id="delete-dialog-title" className="text-base font-bold text-white tracking-tight">
          Delete this note?
        </h3>

        <p id="delete-dialog-desc" className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {noteTitle ? (
            <>
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-zinc-200 break-words">"{noteTitle}"</span>?
            </>
          ) : (
            'Are you sure you want to permanently delete this note?'
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
                <span>Deleting Note...</span>
              </>
            ) : (
              <span>Delete Note</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
