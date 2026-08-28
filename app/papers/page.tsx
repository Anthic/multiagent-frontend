'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { paperService, IPaper, ICitation } from '@/src/services/paperService';
import { academicService, IPeerReviewResult, ISlideDeckResult } from '@/src/services/academicService';
import { showAppToast } from '@/src/components/ui/appToastEvents';

export default function PaperStudioPage() {
  const [papers, setPapers] = useState<IPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [status, setStatus] = useState<'draft' | 'in_review' | 'published' | 'archived'>('draft');
  const [citations, setCitations] = useState<ICitation[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // AI Review & Slide Generation States
  const [isReviewing, setIsReviewing] = useState(false);
  const [activeReviewResult, setActiveReviewResult] = useState<IPeerReviewResult | null>(null);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slideDeck, setSlideDeck] = useState<ISlideDeckResult | null>(null);

  // Delete Confirm Dialog
  const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Citation Input Modal State
  const [isAddCitationOpen, setIsAddCitationOpen] = useState(false);
  const [citKey, setCitKey] = useState('');
  const [citTitle, setCitTitle] = useState('');
  const [citUrl, setCitUrl] = useState('');
  const [citYear, setCitYear] = useState('');

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    try {
      setIsLoading(true);
      const data = await paperService.getAllPapers();
      setPapers(data);
    } catch {
      showAppToast({
        type: 'error',
        title: 'Error',
        message: 'Could not load research papers.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setActivePaperId(null);
    setTitle('');
    setAbstract('');
    setContentMarkdown('');
    setStatus('draft');
    setCitations([]);
    setActiveReviewResult(null);
    setSlideDeck(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (paper: IPaper) => {
    setActivePaperId(paper.id || paper._id || null);
    setTitle(paper.title);
    setAbstract(paper.abstract || '');
    setContentMarkdown(paper.contentMarkdown || '');
    setStatus(paper.status || 'draft');
    setCitations(paper.citations || []);
    setActiveReviewResult((paper.peerReviewResults as any) || null);
    setSlideDeck(null);
    setIsEditorOpen(true);
  };

  const handleSavePaper = async () => {
    if (!title.trim()) {
      showAppToast({
        type: 'error',
        title: 'Title Required',
        message: 'Please enter a paper title.',
      });
      return;
    }

    try {
      setIsSaving(true);
      if (activePaperId) {
        await paperService.updatePaper(activePaperId, {
          title: title.trim(),
          abstract: abstract.trim(),
          contentMarkdown,
          status,
          citations,
        });
        showAppToast({
          type: 'success',
          title: 'Paper Updated',
          message: `"${title}" has been saved.`,
        });
      } else {
        const created = await paperService.createPaper({
          title: title.trim(),
          abstract: abstract.trim(),
          contentMarkdown,
          status,
          citations,
        });
        setActivePaperId(created.id || created._id || null);
        showAppToast({
          type: 'success',
          title: 'Paper Created',
          message: `"${title}" created in Paper Studio.`,
        });
      }
      await loadPapers();
    } catch (err: any) {
      showAppToast({
        type: 'error',
        title: 'Save Failed',
        message: err?.message || 'Could not save paper.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunPeerReview = async () => {
    if (!contentMarkdown.trim() || contentMarkdown.length < 20) {
      showAppToast({
        type: 'error',
        title: 'Content Too Short',
        message: 'Please write at least a few paragraphs before running Peer Review.',
      });
      return;
    }

    try {
      setIsReviewing(true);
      showAppToast({
        type: 'info',
        title: '3-Agent Panel Activated',
        message: 'Reviewing methodology, novelty, and clarity...',
      });
      const review = await academicService.peerReview(title || 'Academic Paper', contentMarkdown);
      setActiveReviewResult(review);

      // Auto-attach review feedback to paper in database
      if (activePaperId) {
        await paperService.updatePaper(activePaperId, {
          peerReviewResults: {
            overallScore: review.overall_score,
            methodologyFeedback: review.methodology_review?.detailed_comments || '',
            domainFeedback: review.novelty_review?.detailed_comments || '',
            clarityFeedback: review.clarity_review?.detailed_comments || '',
          },
        });
        await loadPapers();
      }

      showAppToast({
        type: 'success',
        title: 'Peer Review Complete',
        message: `Decision: ${review.decision} (Score: ${review.overall_score}/10)`,
      });
    } catch (err: any) {
      showAppToast({
        type: 'error',
        title: 'Review Failed',
        message: err?.message || 'Peer review evaluation failed.',
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleGenerateSlides = async () => {
    if (!contentMarkdown.trim()) {
      showAppToast({
        type: 'error',
        title: 'Content Required',
        message: 'Please write paper content first to generate presentation slides.',
      });
      return;
    }

    try {
      setIsGeneratingSlides(true);
      showAppToast({
        type: 'info',
        title: 'Generating Marp Slides',
        message: 'Formatting academic slide deck...',
      });
      const deck = await academicService.generateSlides(title || 'Research Presentation', contentMarkdown, 8);
      setSlideDeck(deck);
      showAppToast({
        type: 'success',
        title: 'Slide Deck Ready',
        message: `Generated ${deck.num_slides} Marp slides in ${deck.duration_sec.toFixed(1)}s.`,
      });
    } catch (err: any) {
      showAppToast({
        type: 'error',
        title: 'Slide Gen Failed',
        message: err?.message || 'Could not generate slide deck.',
      });
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  const handleAddCitation = () => {
    if (!citTitle.trim() || !citUrl.trim()) {
      showAppToast({
        type: 'error',
        title: 'Missing Details',
        message: 'Citation title and URL are required.',
      });
      return;
    }

    const newCit: ICitation = {
      citationKey: citKey.trim() || `ref_${citations.length + 1}`,
      title: citTitle.trim(),
      url: citUrl.trim(),
      year: citYear.trim() || undefined,
    };

    setCitations((prev) => [...prev, newCit]);
    setCitKey('');
    setCitTitle('');
    setCitUrl('');
    setCitYear('');
    setIsAddCitationOpen(false);
    showAppToast({
      type: 'success',
      title: 'Citation Added',
      message: `Reference [${newCit.citationKey}] added.`,
    });
  };

  const confirmDeletePaper = async () => {
    if (!deletingPaperId) return;
    try {
      setIsDeleting(true);
      await paperService.deletePaper(deletingPaperId);
      setPapers((prev) => prev.filter((p) => (p.id || p._id) !== deletingPaperId));
      setDeletingPaperId(null);
      showAppToast({
        type: 'info',
        title: 'Paper Deleted',
        message: 'The paper has been removed.',
      });
    } catch {
      showAppToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete paper.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* ── Breadcrumb Header ─────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
            <span>←</span>
            <span>Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium">Academic Paper Studio</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/notes" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
            Notes Vault →
          </Link>
        </div>
      </div>

      {/* ── Top Bar ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-bold shadow-sm">
              📄
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Academic Paper Studio
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-zinc-400">
            Write LaTeX/Markdown papers, manage citations, and run 3-Agent Simulated Peer Reviews.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#AAFFC7] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#94f5b4] active:scale-95 transition-all shadow-md shadow-[#AAFFC7]/15 cursor-pointer"
        >
          <span>+</span>
          <span>New Paper</span>
        </button>
      </div>

      {/* ── Papers Grid ───────────────────────────────────────────────────────── */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-zinc-500">Loading paper manuscripts...</div>
        ) : papers.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400 text-xl">
              ✍️
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-200">No manuscripts drafted yet</h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              Draft your next research paper with automatic citations, AI paraphraser, and peer-review simulation.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
            >
              + Start drafting paper
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {papers.map((paper) => {
              const paperId = paper.id || paper._id || '';
              const wordCount = (paper.contentMarkdown || '').split(/\s+/).filter(Boolean).length;
              return (
                <div
                  key={paperId}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 hover:border-zinc-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 backdrop-blur-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-block rounded-full bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        {paper.status || 'draft'}
                      </span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(paper)}
                          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                          title="Open in Studio"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeletingPaperId(paperId)}
                          className="rounded p-1.5 text-zinc-400 hover:bg-rose-950 hover:text-rose-400 transition-colors"
                          title="Delete paper"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-zinc-100 line-clamp-2">
                      {paper.title}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {paper.abstract || paper.contentMarkdown || 'No abstract provided.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{wordCount} words • {(paper.citations || []).length} citations</span>
                    {paper.peerReviewResults?.overallScore ? (
                      <span className="text-emerald-400 font-semibold">
                        Score: {paper.peerReviewResults.overallScore}/10
                      </span>
                    ) : (
                      <span className="text-zinc-500">Unreviewed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────────── */}
      {deletingPaperId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isDeleting && setDeletingPaperId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 text-lg mb-3">
              🗑️
            </div>
            <h3 className="text-sm font-bold text-white">Delete this paper?</h3>
            <p className="mt-1 text-xs text-zinc-400">
              This manuscript and its attached citations will be deleted.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingPaperId(null)}
                disabled={isDeleting}
                className="rounded-xl border border-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePaper}
                disabled={isDeleting}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-400 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-rose-500/20"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full Academic Editor Workspace Modal ─────────────────────────────── */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => !isSaving && setIsEditorOpen(false)} />

          <div className="relative z-10 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            {/* Top Workspace Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-6 py-3.5 bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#AAFFC7]">PAPER STUDIO</span>
                <span className="text-zinc-600">|</span>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-300 outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* AI Action Tools */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunPeerReview}
                  disabled={isReviewing}
                  className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>🧠</span>
                  <span>{isReviewing ? 'Peer Reviewing...' : '3-Agent Peer Review'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateSlides}
                  disabled={isGeneratingSlides}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>📊</span>
                  <span>{isGeneratingSlides ? 'Generating...' : 'Generate Slides'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSavePaper}
                  disabled={isSaving}
                  className="rounded-xl bg-[#AAFFC7] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#94f5b4] active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-[#AAFFC7]/15"
                >
                  {isSaving ? 'Saving...' : 'Save Paper'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Editor Body (2 Columns: Main Editor + Sidecar Tools) */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/80">
              {/* Left Column: Title, Abstract & Content */}
              <div className="p-6 space-y-4 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Paper Title (e.g. Next-Generation Solid-State Electrolytes for High-Voltage Cells)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white placeholder-zinc-600 outline-none border-b border-zinc-800/60 pb-2 focus:border-[#AAFFC7]"
                />

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Abstract</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a concise abstract summarizing the objectives, methodology, and key discoveries..."
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-[#AAFFC7] resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-400">
                      Manuscript Content (Markdown / LaTeX)
                    </label>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {contentMarkdown.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    rows={14}
                    placeholder="# 1. Introduction&#10;&#10;Write your academic manuscript here..."
                    value={contentMarkdown}
                    onChange={(e) => setContentMarkdown(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-[#AAFFC7] resize-none font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Column: Citations & AI Sidecar Inspector */}
              <div className="p-5 bg-zinc-950/40 space-y-6 overflow-y-auto">
                {/* Citations Manager */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Citations ({citations.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddCitationOpen(true)}
                      className="text-[11px] text-[#AAFFC7] hover:underline cursor-pointer"
                    >
                      + Add Citation
                    </button>
                  </div>

                  {citations.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800/80 p-3 text-center text-[11px] text-zinc-500">
                      No citations attached yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {citations.map((c, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs flex items-start justify-between gap-2"
                        >
                          <div>
                            <span className="font-mono text-[10px] text-[#AAFFC7] font-semibold">
                              [{c.citationKey}]
                            </span>
                            <p className="font-medium text-zinc-200 mt-0.5 line-clamp-1">{c.title}</p>
                            {c.url && (
                              <a href={c.url} target="_blank" rel="noreferrer" className="text-[10px] text-zinc-400 hover:text-zinc-200 truncate block mt-0.5">
                                🔗 {c.url}
                              </a>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCitations((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-zinc-500 hover:text-rose-400 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Peer Review Scorecard */}
                {activeReviewResult && (
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">Peer Review Decision</span>
                      <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                        {activeReviewResult.decision}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {activeReviewResult.overall_score} <span className="text-xs text-zinc-400 font-normal">/ 10</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-zinc-300">
                      <p><strong>Methodology:</strong> {activeReviewResult.methodology_review?.detailed_comments}</p>
                      <p><strong>Novelty:</strong> {activeReviewResult.novelty_review?.detailed_comments}</p>
                      <p><strong>Clarity:</strong> {activeReviewResult.clarity_review?.detailed_comments}</p>
                    </div>
                  </div>
                )}

                {/* Marp Slide Deck Export */}
                {slideDeck && (
                  <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300">Marp Slide Deck</span>
                      <span className="text-[10px] text-zinc-400">{slideDeck.num_slides} Slides</span>
                    </div>
                    <textarea
                      rows={6}
                      readOnly
                      value={slideDeck.marp_markdown}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-[10px] text-zinc-300 font-mono resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(slideDeck.marp_markdown);
                        showAppToast({ type: 'success', title: 'Copied', message: 'Marp Markdown copied.' });
                      }}
                      className="w-full rounded-xl bg-blue-500/20 border border-blue-500/40 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition-all cursor-pointer"
                    >
                      Copy Marp Presentation Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Citation Modal ────────────────────────────────────────────────── */}
      {isAddCitationOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddCitationOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-bold text-white">Add Research Citation</h4>
            <div>
              <label className="block text-[11px] text-zinc-400">Citation Key</label>
              <input
                type="text"
                placeholder="e.g. Goodenough2020"
                value={citKey}
                onChange={(e) => setCitKey(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-[#AAFFC7]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400">Paper / Source Title</label>
              <input
                type="text"
                placeholder="Title of referenced paper..."
                value={citTitle}
                onChange={(e) => setCitTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-[#AAFFC7]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-zinc-400">URL / DOI Link</label>
              <input
                type="url"
                placeholder="https://doi.org/..."
                value={citUrl}
                onChange={(e) => setCitUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-[#AAFFC7]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddCitationOpen(false)}
                className="rounded-xl border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCitation}
                className="rounded-xl bg-[#AAFFC7] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#94f5b4]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
