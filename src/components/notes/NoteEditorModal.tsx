'use client';

import React, { useState, useEffect, useRef } from 'react';
import { INote, ICreateNotePayload, IUpdateNotePayload } from '@/src/services/noteService';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ICreateNotePayload | IUpdateNotePayload, editingId?: string) => Promise<void>;
  editingNote: INote | null;
  availableTags: string[];
}

function isValidUrl(str: string): boolean {
  if (!str.trim()) return true;
  try {
    const parsed = new URL(str.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function NoteEditorModal({
  isOpen,
  onClose,
  onSave,
  editingNote,
  availableTags,
}: NoteEditorModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingNote) {
        setTitle(editingNote.title || '');
        setContent(editingNote.content || '');
        setTags(editingNote.tags || []);
        setSourceUrl(editingNote.sourceUrl || '');
        setAudioUrl(editingNote.audioUrl || '');
      } else {
        setTitle('');
        setContent('');
        setTags([]);
        setSourceUrl('');
        setAudioUrl('');
      }
      setTagInput('');
      setError(null);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, editingNote]);

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

  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().toLowerCase().replace(/^#/, '');
    if (!clean) return;
    if (tags.includes(clean)) {
      setTagInput('');
      return;
    }
    setTags([...tags, clean]);
    setTagInput('');
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedSourceUrl = sourceUrl.trim();
    const trimmedAudioUrl = audioUrl.trim();

    if (!trimmedTitle) {
      setError('Title is required (at least 2 characters).');
      return;
    }
    if (trimmedTitle.length < 2) {
      setError('Title must be at least 2 characters.');
      return;
    }
    if (!trimmedContent) {
      setError('Content is required.');
      return;
    }

    if (trimmedSourceUrl && !isValidUrl(trimmedSourceUrl)) {
      setError('Source URL must be a valid URL starting with http:// or https://');
      return;
    }

    if (trimmedAudioUrl && !isValidUrl(trimmedAudioUrl)) {
      setError('Audio URL must be a valid URL starting with http:// or https://');
      return;
    }

    // Process any lingering tag in tagInput
    let finalTags = [...tags];
    if (tagInput.trim()) {
      const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (clean && !finalTags.includes(clean)) {
        finalTags.push(clean);
      }
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload: ICreateNotePayload = {
        title: trimmedTitle,
        content: trimmedContent,
        tags: finalTags,
        sourceUrl: trimmedSourceUrl || undefined,
        audioUrl: trimmedAudioUrl || undefined,
      };

      const editingId = editingNote?.id || editingNote?._id;
      await onSave(payload, editingId);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save note. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const unusedSuggestions = availableTags
    .filter((t) => !tags.includes(t.toLowerCase()))
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Dialog Box */}
      <div
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#AAFFC7]/15 text-[#AAFFC7] text-xs font-bold">
              {editingNote ? '✏️' : '✦'}
            </span>
            <h2 id="editor-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
              {editingNote ? 'Edit Research Note' : 'Create New Research Note'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close editor"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 animate-in fade-in duration-150">
              <span className="shrink-0 text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Title <span className="text-[#AAFFC7]">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              placeholder="e.g., DeepSeek-R1 Architecture & Reinforcement Learning Breakthroughs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] focus:ring-1 focus:ring-[#AAFFC7]/40 transition-all"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Content Field */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300">
                Content <span className="text-[#AAFFC7]">*</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {wordCount} words • {charCount} chars
              </span>
            </div>
            <textarea
              rows={6}
              placeholder="Capture insights, literature excerpts, hypotheses, key takeaways, and findings..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] focus:ring-1 focus:ring-[#AAFFC7]/40 transition-all resize-none font-sans leading-relaxed"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Interactive Tag Management */}
          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Tags <span className="text-[10px] text-zinc-500 font-normal">(Press Enter or comma to add)</span>
            </label>
            
            {/* Tag pills + input box */}
            <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2 focus-within:border-[#AAFFC7] focus-within:ring-1 focus-within:ring-[#AAFFC7]/40 transition-all">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-md bg-[#AAFFC7]/15 border border-[#AAFFC7]/30 px-2 py-0.5 text-xs font-medium text-[#AAFFC7]"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-white transition-colors cursor-pointer text-xs leading-none"
                    title="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={tags.length === 0 ? "Type tag e.g. 'ai' and press Enter..." : "Add tag..."}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none px-1 py-0.5"
                disabled={isSubmitting}
              />
            </div>

            {/* Suggestions Chips */}
            {unusedSuggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-zinc-500 mr-1">Suggestions:</span>
                {unusedSuggestions.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleAddTag(st)}
                    className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400 hover:text-[#AAFFC7] hover:border-[#AAFFC7]/30 transition-colors cursor-pointer"
                  >
                    +{st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* URLs Grid (Source URL & Audio URL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Source URL <span className="text-[10px] text-zinc-500 font-normal">(Optional)</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                  🔗
                </span>
                <input
                  type="url"
                  placeholder="https://arxiv.org/abs/..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] focus:ring-1 focus:ring-[#AAFFC7]/40 transition-all font-mono"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Audio URL <span className="text-[10px] text-zinc-500 font-normal">(Optional)</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                  🎙️
                </span>
                <input
                  type="url"
                  placeholder="https://.../memo.mp3"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 pl-8 pr-3 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] focus:ring-1 focus:ring-[#AAFFC7]/40 transition-all font-mono"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
                  <span>{editingNote ? 'Updating Note...' : 'Saving Note...'}</span>
                </>
              ) : (
                <span>{editingNote ? 'Update Note' : 'Save Note'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
