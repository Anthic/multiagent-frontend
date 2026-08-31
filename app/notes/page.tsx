'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  noteService,
  INote,
  ICreateNotePayload,
  IUpdateNotePayload,
} from '@/src/services/noteService';
import { showAppToast } from '@/src/components/ui/appToastEvents';
import { NoteCard } from '@/src/components/notes/NoteCard';
import { NoteDetailModal } from '@/src/components/notes/NoteDetailModal';
import { NoteEditorModal } from '@/src/components/notes/NoteEditorModal';
import { DeleteConfirmModal } from '@/src/components/notes/DeleteConfirmModal';
import { NoteSkeleton } from '@/src/components/notes/NoteSkeleton';
import { NotesStatsBar } from '@/src/components/notes/NotesStatsBar';

type SortOption = 'updated_desc' | 'created_desc' | 'title_asc' | 'title_desc';

export default function NotesPage() {
  // Data states
  const [notes, setNotes] = useState<INote[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Filters & Sorting & View mode
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('updated_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);

  const [detailNote, setDetailNote] = useState<INote | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search input debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load notes and tags
  const fetchNotes = useCallback(async (tag?: string | null, search?: string) => {
    try {
      setIsSearching(true);
      const data = await noteService.getAllNotes({
        tag: tag || undefined,
        search: search || undefined,
      });
      setNotes(data);
    } catch {
      showAppToast({
        type: 'error',
        title: 'Error loading notes',
        message: 'Could not fetch notes from server. Please check your connection.',
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const data = await noteService.getAllTags();
      setTags(data);
    } catch {
      // Best effort tag retrieval
    }
  }, []);

  useEffect(() => {
    fetchNotes(selectedTag, debouncedSearch);
  }, [selectedTag, debouncedSearch, fetchNotes]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Sort notes
  const sortedNotes = useMemo(() => {
    const list = [...notes];
    return list.sort((a, b) => {
      if (sortBy === 'updated_desc') {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'created_desc') {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title_desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  }, [notes, sortBy]);

  // Note CRUD handlers
  const handleOpenCreate = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (note: INote) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleOpenDetail = (note: INote) => {
    setDetailNote(note);
    setIsDetailOpen(true);
  };

  const handlePromptDelete = (noteId: string) => {
    setDeletingNoteId(noteId);
  };

  const handleSaveNote = async (
    payload: ICreateNotePayload | IUpdateNotePayload,
    editingId?: string
  ) => {
    if (editingId) {
      const updated = await noteService.updateNote(editingId, payload);
      setNotes((prev) =>
        prev.map((n) => ((n.id || n._id) === editingId ? { ...n, ...updated } : n))
      );
      if (detailNote && (detailNote.id || detailNote._id) === editingId) {
        setDetailNote((prev) => (prev ? { ...prev, ...updated } : null));
      }
      showAppToast({
        type: 'success',
        title: 'Note updated',
        message: `"${payload.title || 'Note'}" has been updated.`,
      });
    } else {
      const created = await noteService.createNote(payload as ICreateNotePayload);
      setNotes((prev) => [created, ...prev]);
      showAppToast({
        type: 'success',
        title: 'Note created',
        message: `"${created.title}" added to your vault.`,
      });
    }
    await fetchTags();
  };

  const handleConfirmDelete = async () => {
    if (!deletingNoteId) return;
    try {
      setIsDeleting(true);
      await noteService.deleteNote(deletingNoteId);
      setNotes((prev) => prev.filter((n) => (n.id || n._id) !== deletingNoteId));
      if (detailNote && (detailNote.id || detailNote._id) === deletingNoteId) {
        setIsDetailOpen(false);
        setDetailNote(null);
      }
      showAppToast({
        type: 'info',
        title: 'Note deleted',
        message: 'The note has been removed from your vault.',
      });
      setDeletingNoteId(null);
      await fetchTags();
    } catch {
      showAppToast({
        type: 'error',
        title: 'Delete failed',
        message: 'Could not delete note. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const deletingNoteObject = useMemo(() => {
    if (!deletingNoteId) return undefined;
    return notes.find((n) => (n.id || n._id) === deletingNoteId);
  }, [notes, deletingNoteId]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-24 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── Breadcrumb & Navigation Bar ────────────────────────────────────────── */}
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
          <span className="text-[#AAFFC7] font-medium">Notes Vault</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/research"
            className="text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:inline"
          >
            AI Research →
          </Link>
          <Link
            href="/papers"
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Paper Studio →
          </Link>
        </div>
      </div>

      {/* ── Top Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AAFFC7]/15 text-[#AAFFC7] text-base font-bold shadow-sm shadow-[#AAFFC7]/20 border border-[#AAFFC7]/30">
              ✦
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Notes Vault
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Capture academic literature snippets, research ideas, audio memos, and hypotheses in your private workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#AAFFC7] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-black hover:bg-[#94f5b4] active:scale-95 transition-all shadow-lg shadow-[#AAFFC7]/20 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <span className="text-base leading-none">+</span>
          <span>New Note</span>
        </button>
      </div>

      {/* ── Stats Summary Bar ─────────────────────────────────────────────────── */}
      <div className="mt-6">
        <NotesStatsBar notes={notes} tags={tags} />
      </div>

      {/* ── Controls Bar: Search, Tags, Sorting, View Toggle ──────────────────── */}
      <div className="mt-7 space-y-3.5 rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search notes by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2.5 pl-9 pr-9 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] focus:ring-1 focus:ring-[#AAFFC7]/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs p-1"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls: Sort & View Toggle */}
          <div className="flex items-center gap-2.5 shrink-0 justify-between md:justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="hidden sm:inline text-zinc-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#AAFFC7] cursor-pointer"
              >
                <option value="updated_desc">Recently Updated</option>
                <option value="created_desc">Recently Created</option>
                <option value="title_asc">Title A–Z</option>
                <option value="title_desc">Title Z–A</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-zinc-800 text-[#AAFFC7]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-zinc-800 text-[#AAFFC7]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="List view"
                aria-label="List view"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tag Filters Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedTag === null
                ? 'bg-[#AAFFC7]/20 text-[#AAFFC7] border border-[#AAFFC7]/40 font-semibold shadow-sm'
                : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            All Notes ({notes.length})
          </button>
          {tags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#AAFFC7]/20 text-[#AAFFC7] border border-[#AAFFC7]/40 font-semibold shadow-sm'
                    : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Notes Display Area ─────────────────────────────────────────────────── */}
      <div className="mt-7">
        {isLoading || isSearching ? (
          <NoteSkeleton count={6} viewMode={viewMode} />
        ) : sortedNotes.length === 0 ? (
          /* Empty States */
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-12 sm:p-16 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400 text-2xl border border-zinc-800 shadow-inner">
              {searchQuery ? '🔍' : selectedTag ? '🏷️' : '📝'}
            </div>

            <h3 className="mt-4 text-base font-semibold text-zinc-200">
              {searchQuery
                ? 'No matching notes found'
                : selectedTag
                ? `No notes with tag #${selectedTag}`
                : 'No notes in your vault yet'}
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `No notes matched "${searchQuery}". Try a different keyword or reset filters.`
                : selectedTag
                ? `You have not tagged any notes with #${selectedTag} yet.`
                : 'Capture your first research idea, literature insight, or voice memo to power your papers.'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                >
                  Clear Search
                </button>
              ) : selectedTag ? (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
                >
                  Reset Tag Filter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#AAFFC7] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#94f5b4] active:scale-95 transition-all shadow-md shadow-[#AAFFC7]/20 cursor-pointer"
                >
                  <span>+</span>
                  <span>Create your first note</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Notes Grid / List */
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
                : 'flex flex-col gap-3'
            }
          >
            {sortedNotes.map((note) => (
              <NoteCard
                key={note.id || note._id || note.title}
                note={note}
                viewMode={viewMode}
                onView={handleOpenDetail}
                onEdit={handleOpenEdit}
                onDelete={handlePromptDelete}
                onTagClick={(t) => setSelectedTag(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals & Dialogs ───────────────────────────────────────────────────── */}
      <NoteDetailModal
        note={detailNote}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleOpenEdit}
        onDelete={handlePromptDelete}
      />

      <NoteEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveNote}
        editingNote={editingNote}
        availableTags={tags}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingNoteId)}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        noteTitle={deletingNoteObject?.title}
      />
    </div>
  );
}
