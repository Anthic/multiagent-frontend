'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { noteService, INote } from '@/src/services/noteService';
import { showAppToast } from '@/src/components/ui/appToastEvents';

export default function NotesVaultPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<INote[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Note creation / edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom Delete Confirm Dialog state
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadNotes();
    loadTags();
  }, [selectedTag]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const data = await noteService.getAllNotes(selectedTag || undefined);
      setNotes(data);
    } catch {
      showAppToast({
        type: 'error',
        title: 'Error',
        message: 'Could not load notes from server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const data = await noteService.getAllTags();
      setTags(data);
    } catch {
      // Best effort
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setTagInput('');
    setSourceUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note: INote) => {
    setEditingNoteId(note.id || note._id || null);
    setTitle(note.title);
    setContent(note.content);
    setTagInput((note.tags || []).join(', '));
    setSourceUrl(note.sourceUrl || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and Content are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const parsedTags = tagInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      if (editingNoteId) {
        await noteService.updateNote(editingNoteId, {
          title: title.trim(),
          content: content.trim(),
          tags: parsedTags,
          sourceUrl: sourceUrl.trim() || undefined,
        });
        showAppToast({
          type: 'success',
          title: 'Note Updated',
          message: `"${title.trim()}" has been updated successfully.`,
        });
      } else {
        await noteService.createNote({
          title: title.trim(),
          content: content.trim(),
          tags: parsedTags,
          sourceUrl: sourceUrl.trim() || undefined,
        });
        showAppToast({
          type: 'success',
          title: 'Note Created',
          message: `"${title.trim()}" saved & vectorized in Qdrant RAG.`,
        });
      }

      setIsModalOpen(false);
      await loadNotes();
      await loadTags();
    } catch (err: any) {
      setError(err?.message || 'Failed to save note.');
      showAppToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Could not save note.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteNote = async () => {
    if (!deletingNoteId) return;
    try {
      setIsDeleting(true);
      await noteService.deleteNote(deletingNoteId);
      setNotes((prev) => prev.filter((n) => (n.id || n._id) !== deletingNoteId));
      showAppToast({
        type: 'info',
        title: 'Note Deleted',
        message: 'The note has been removed from your vault.',
      });
      setDeletingNoteId(null);
      await loadTags();
    } catch {
      showAppToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete note. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyNote = (text: string) => {
    navigator.clipboard.writeText(text);
    showAppToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: 'Note content copied successfully.',
    });
  };

  // Client-side search filter
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q)),
    );
  }, [notes, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* ── Breadcrumb & Back Navigation ──────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link
            href="/dashboard"
            className="hover:text-zinc-200 transition-colors flex items-center gap-1"
          >
            <span>←</span>
            <span>Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium">Notes Vault</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/research"
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Go to Research →
          </Link>
        </div>
      </div>

      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#AAFFC7]/15 text-[#AAFFC7] text-sm font-bold shadow-sm">
              ✦
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Smart Notes Vault
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-zinc-400">
            Capture academic literature snippets, findings, and hypotheses. Synced directly with Qdrant Vector RAG.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#AAFFC7] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#94f5b4] active:scale-95 transition-all shadow-md shadow-[#AAFFC7]/15 cursor-pointer"
        >
          <span>+</span>
          <span>New Note</span>
        </button>
      </div>

      {/* ── Search & Tag Filter Bar ───────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search notes, tags, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#AAFFC7]/70 focus:ring-1 focus:ring-[#AAFFC7]/40 transition-all"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedTag === null
                ? 'bg-[#AAFFC7]/20 text-[#AAFFC7] border border-[#AAFFC7]/40 font-semibold'
                : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            All ({notes.length})
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#AAFFC7]/20 text-[#AAFFC7] border border-[#AAFFC7]/40 font-semibold'
                  : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notes Grid ────────────────────────────────────────────────────────── */}
      <div className="mt-7">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-zinc-500">
            Loading your notes vault...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400 text-xl">
              📝
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-200">No notes found</h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No notes match your search query. Try a different keyword.'
                : 'Start capturing research insights or citations to power your papers.'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
            >
              + Create your first note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredNotes.map((note) => {
              const noteId = note.id || note._id || '';
              return (
                <div
                  key={noteId}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 hover:border-zinc-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 backdrop-blur-md"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-zinc-100 line-clamp-2">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyNote(`${note.title}\n\n${note.content}`)}
                          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                          title="Copy content"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(note)}
                          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                          title="Edit note"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeletingNoteId(noteId)}
                          className="rounded p-1.5 text-zinc-400 hover:bg-rose-950 hover:text-rose-400 transition-colors"
                          title="Delete note"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>

                  {/* Footer (Tags & Vector status) */}
                  <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {(note.tags || []).map((t) => (
                        <span
                          key={t}
                          className="rounded bg-zinc-900 border border-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      <span>RAG Synced</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Custom Delete Confirmation Dialog ─────────────────────────────────── */}
      {deletingNoteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isDeleting && setDeletingNoteId(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 text-lg mb-3">
              🗑️
            </div>
            <h3 className="text-sm font-bold text-white">Delete this research note?</h3>
            <p className="mt-1 text-xs text-zinc-400">
              This action cannot be undone. The note and its vector embedding will be permanently removed.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingNoteId(null)}
                disabled={isDeleting}
                className="rounded-xl border border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteNote}
                disabled={isDeleting}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-400 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-rose-500/20"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Note Modal ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSaving && setIsModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-semibold text-zinc-100">
                {editingNoteId ? 'Edit Note' : 'Create New Research Note'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-2.5 text-xs text-rose-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-400">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lithium-Sulfur Battery Limitations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] focus:ring-1 focus:ring-[#AAFFC7]/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400">Note Content (Markdown supported)</label>
                <textarea
                  rows={6}
                  placeholder="Write your research findings, citations, or notes..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] focus:ring-1 focus:ring-[#AAFFC7]/50 resize-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="battery, methodology, review"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400">Source URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://arxiv.org/abs/..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#AAFFC7]"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-[#AAFFC7] px-5 py-2 text-xs font-bold text-black hover:bg-[#99f3b8] active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-[#AAFFC7]/20 cursor-pointer"
                >
                  {isSaving ? 'Saving & Vectorizing...' : editingNoteId ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
