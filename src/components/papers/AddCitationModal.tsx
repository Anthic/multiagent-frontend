'use client';

import React, { useState, useEffect } from 'react';
import { ICitation } from '@/src/services/paperService';

interface AddCitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (citation: ICitation) => Promise<void>;
}

export function AddCitationModal({ isOpen, onClose, onAdd }: AddCitationModalProps) {
  const [citationKey, setCitationKey] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [doi, setDoi] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCitationKey('');
      setTitle('');
      setUrl('');
      setDoi('');
      setAuthors('');
      setYear(new Date().getFullYear().toString());
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Citation title is required.');
      return;
    }
    if (!citationKey.trim()) {
      setError('Citation Key (e.g., smith2025) is required.');
      return;
    }
    if (!url.trim()) {
      setError('Source URL is required.');
      return;
    }

    const parsedAuthors = authors
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd({
        citationKey: citationKey.trim().toLowerCase().replace(/\s+/g, '-'),
        title: title.trim(),
        url: url.trim(),
        doi: doi.trim() || undefined,
        authors: parsedAuthors.length > 0 ? parsedAuthors : undefined,
        year: year.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add citation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => !isSubmitting && onClose()}
      />

      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-citation-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 text-xs font-bold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <h2 id="add-citation-title" className="text-base font-bold text-white tracking-tight">
              Add Reference / Citation
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Citation Key <span className="text-[#AAFFC7]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. vaswani2017"
                value={citationKey}
                onChange={(e) => setCitationKey(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] font-mono"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Publication Year
              </label>
              <input
                type="text"
                placeholder="e.g. 2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] font-mono"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Paper / Article Title <span className="text-[#AAFFC7]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Attention Is All You Need"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7]"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Authors <span className="text-[10px] text-zinc-500">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. A. Vaswani, N. Shazeer, N. Parmar"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7]"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Source URL <span className="text-[#AAFFC7]">*</span>
              </label>
              <input
                type="url"
                placeholder="https://arxiv.org/abs/1706.03762"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] font-mono"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                DOI <span className="text-[10px] text-zinc-500">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="10.48550/arXiv.1706.03762"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] font-mono"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#AAFFC7] px-5 py-2 text-xs font-bold text-black hover:bg-[#99f3b8] active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-[#AAFFC7]/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeOpacity="1" />
                  </svg>
                  <span>Adding Citation...</span>
                </>
              ) : (
                <span>Add Citation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
