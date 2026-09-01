'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { paperService, IPaper, ICitation } from '@/src/services/paperService';
import { showAppToast } from '@/src/components/ui/appToastEvents';
import { PaperCard } from '@/src/components/papers/PaperCard';
import { PaperStatsBar } from '@/src/components/papers/PaperStatsBar';
import { PaperSkeleton } from '@/src/components/papers/PaperSkeleton';
import { PaperEditor } from '@/src/components/papers/PaperEditor';
import { DeletePaperModal } from '@/src/components/papers/DeletePaperModal';
import { SlideGeneratorModal } from '@/src/components/papers/SlideGeneratorModal';
import { CitationGraphModal } from '@/src/components/papers/CitationGraphModal';

type StatusFilter = 'all' | 'draft' | 'in_review' | 'published' | 'archived';

const TEMPLATES: Array<{
  id: string;
  name: string;
  desc: string;
  icon: string;
  content: string;
}> = [
  {
    id: 'imrad',
    name: 'IMRaD Scientific Paper',
    desc: 'Introduction, Methods, Results, Discussion, and Conclusion',
    icon: '🔬',
    content: `# Introduction\n### Background & Objectives\nDescribe the core problem statement, research questions, and domain significance.\n\n# Methodology\n### Experimental Setup & Architecture\nDetail your data pipelines, algorithms, baseline models, and evaluation protocols.\n\n# Results & Findings\n### Empirical Benchmarks\nPresent comparative metrics, key observations, and statistical data.\n\n# Discussion & Limitations\n### Theoretical & Practical Implications\nAnalyze validity, unexpected behaviors, and architectural trade-offs.\n\n# Conclusion\nSummarize main contributions and future research directions.\n`,
  },
  {
    id: 'lit_review',
    name: 'Literature Review & Gap Synthesis',
    desc: 'Systematic taxonomy, synthesis matrix, and literature gaps',
    icon: '📚',
    content: `# Introduction & Scope\nDefine the taxonomy, survey boundaries, and selection criteria for reviewed literature.\n\n# Thematic Literature Synthesis\n### Core Paradigms\nCategorize and critically review prevailing methods and benchmark architectures.\n\n# Identified Literature Gaps\nHighlight unaddressed challenges, scalability bottlenecks, and validation voids.\n\n# Strategic Future Roadmap\nPropose novel methodologies to address the identified literature gaps.\n`,
  },
  {
    id: 'short_paper',
    name: 'Conference Short / Workshop Paper',
    desc: 'Compact 4-page format focused on novelty and preliminary results',
    icon: '⚡',
    content: `# 1. Motivation & Problem Statement\nState the specific challenge and why existing solutions are insufficient.\n\n# 2. Proposed Novel Approach\nExplain your design principles, algorithmic formulation, or prototype.\n\n# 3. Preliminary Experiments\nHighlight initial benchmark gains and validation metrics.\n\n# 4. Impact & Next Steps\nKey takeaways for the workshop community.\n`,
  },
];

export default function PapersStudioPage() {
  const [papers, setPapers] = useState<IPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Active Editor State
  const [activePaper, setActivePaper] = useState<IPaper | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Slide Generator / Viewer State
  const [slideModalPaper, setSlideModalPaper] = useState<IPaper | null>(null);

  // 3D Knowledge Graph State
  const [graphModalPaper, setGraphModalPaper] = useState<IPaper | null>(null);

  // Template Dropdown Toggle
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Guide Banner Collapse State
  const [isGuideDismissed, setIsGuideDismissed] = useState(false);

  // Delete Confirmation Dialog
  const [deletingPaperId, setDeletingPaperId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPapers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleOpenCreatePaper = async (templateContent?: string, templateTitle?: string) => {
    setIsTemplateMenuOpen(false);
    try {
      const newPaper = await paperService.createPaper({
        title: templateTitle || 'Untitled Research Paper',
        abstract: '',
        contentMarkdown:
          templateContent || '# Introduction\n\nStart writing your research findings here...\n',
        status: 'draft',
        citations: [],
      });
      setPapers((prev) => [newPaper, ...prev]);
      setActivePaper(newPaper);
      setIsEditorOpen(true);
      showAppToast({
        type: 'success',
        title: 'Paper Created',
        message: templateTitle ? `Created paper from ${templateTitle} template.` : 'New research draft ready for writing.',
      });
    } catch {
      showAppToast({
        type: 'error',
        title: 'Creation Failed',
        message: 'Could not initialize a new paper draft.',
      });
    }
  };

  const handleOpenExistingPaper = (paper: IPaper) => {
    setActivePaper(paper);
    setIsEditorOpen(true);
  };

  const handleSaveActivePaper = async (updatedFields: Partial<IPaper>) => {
    if (!activePaper) return;
    const paperId = activePaper.id || activePaper._id;
    if (!paperId) return;

    const updated = await paperService.updatePaper(paperId, updatedFields);
    setPapers((prev) =>
      prev.map((p) => ((p.id || p._id) === paperId ? { ...p, ...updated } : p)),
    );
    setActivePaper((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const handleSaveSlidesForPaper = async (slidesMarkdown: string, slideCount: number) => {
    if (!slideModalPaper) return;
    const paperId = slideModalPaper.id || slideModalPaper._id;
    if (!paperId) return;

    const updated = await paperService.updatePaper(paperId, {
      slidesMarkdown,
      slideCount,
    });

    setPapers((prev) =>
      prev.map((p) => ((p.id || p._id) === paperId ? { ...p, ...updated } : p)),
    );
    setSlideModalPaper((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const handleAddCitationToActivePaper = async (citation: ICitation) => {
    if (!activePaper) return;
    const paperId = activePaper.id || activePaper._id;
    if (!paperId) return;

    const updated = await paperService.addCitation(paperId, citation);
    setPapers((prev) =>
      prev.map((p) => ((p.id || p._id) === paperId ? { ...p, ...updated } : p)),
    );
    setActivePaper((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const handleConfirmDelete = async () => {
    if (!deletingPaperId) return;
    try {
      setIsDeleting(true);
      await paperService.deletePaper(deletingPaperId);
      setPapers((prev) => prev.filter((p) => (p.id || p._id) !== deletingPaperId));
      if (activePaper && (activePaper.id || activePaper._id) === deletingPaperId) {
        setIsEditorOpen(false);
        setActivePaper(null);
      }
      showAppToast({
        type: 'info',
        title: 'Paper Deleted',
        message: 'Research paper removed from workspace.',
      });
      setDeletingPaperId(null);
    } catch {
      showAppToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Could not delete paper. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered & Searched Papers
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      const matchesStatus =
        statusFilter === 'all' ? true : (p.status || 'draft') === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q
        ? true
        : p.title.toLowerCase().includes(q) ||
          (p.abstract && p.abstract.toLowerCase().includes(q)) ||
          (p.contentMarkdown && p.contentMarkdown.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [papers, statusFilter, searchQuery]);

  const deletingPaperObject = useMemo(() => {
    if (!deletingPaperId) return undefined;
    return papers.find((p) => (p.id || p._id) === deletingPaperId);
  }, [papers, deletingPaperId]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-24 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── Breadcrumb & Top Bar ──────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Link
            href="/dashboard"
            className="hover:text-zinc-200 transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-[#AAFFC7] font-medium">Paper Studio</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/notes"
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Notes Vault →
          </Link>
          <Link
            href="/research"
            className="text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:inline"
          >
            AI Research →
          </Link>
        </div>
      </div>

      {/* ── Page Header & Quick Creation Actions ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#AAFFC7]/15 text-[#AAFFC7] font-bold shadow-sm shadow-[#AAFFC7]/20 border border-[#AAFFC7]/30">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Paper Studio
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Draft scientific literature, paraphrase with AI, manage citations, simulate peer reviews, and generate 1-click Marp presentation slide decks.
          </p>
        </div>

        {/* Action Buttons: New Paper & Templates */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 relative">
          {/* Template Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
            >
              <span>📋 Templates</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Select Academic Template
                </div>
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleOpenCreatePaper(tmpl.content, tmpl.name)}
                    className="w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left hover:bg-zinc-900 transition-colors cursor-pointer group"
                  >
                    <span className="text-lg">{tmpl.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-200 group-hover:text-[#AAFFC7] transition-colors">
                        {tmpl.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-snug">{tmpl.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreatePaper()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#AAFFC7] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-black hover:bg-[#94f5b4] active:scale-95 transition-all shadow-lg shadow-[#AAFFC7]/20 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Paper</span>
          </button>
        </div>
      </div>

      {/* ── User-Friendly 4-Step Interactive Workflow Guide ───────────────────── */}
      {!isGuideDismissed && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-zinc-950/80 to-zinc-950 p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-emerald-500/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#AAFFC7]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Academic Studio Workflow Guide
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsGuideDismissed(true)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              title="Dismiss guide banner"
            >
              Hide Guide ✕
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-bold text-white">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">📝 Draft & Outline</h4>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Compose research in rich Markdown with auto-generated outline structure.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-bold text-[#AAFFC7]">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">⚡ AI Paraphrase</h4>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Highlight sentences to rewrite in Academic, Simplified, or Humanize modes.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-bold text-cyan-400">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">📚 Citations & Review</h4>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Link DOI citations and simulate 3-agent academic peer reviews.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-900/60 text-sm font-bold text-[#AAFFC7]">
                4
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-300">📑 1-Click Slides</h4>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                  Turn your paper into a 8-12 slide Marp conference deck with speaker cues.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Summary Bar ─────────────────────────────────────────────────── */}
      <div className="mt-6">
        <PaperStatsBar papers={papers} />
      </div>

      {/* ── Search & Filter Controls ──────────────────────────────────────────── */}
      <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-4 sm:p-5 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search papers by title, abstract, or content..."
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
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {(['all', 'draft', 'in_review', 'published', 'archived'] as StatusFilter[]).map((tab) => {
            const isSelected = statusFilter === tab;
            const labelMap: Record<StatusFilter, string> = {
              all: 'All',
              draft: 'Drafts',
              in_review: 'In Review',
              published: 'Published',
              archived: 'Archived',
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#AAFFC7]/20 text-[#AAFFC7] border border-[#AAFFC7]/40 shadow-sm'
                    : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Papers Display Grid ────────────────────────────────────────────────── */}
      <div className="mt-7">
        {isLoading ? (
          <PaperSkeleton count={6} />
        ) : filteredPapers.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-12 sm:p-16 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400 text-2xl border border-zinc-800 shadow-inner">
              <svg className="w-7 h-7 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-zinc-200">
              {searchQuery
                ? 'No matching papers found'
                : statusFilter !== 'all'
                ? `No papers in ${statusFilter.replace('_', ' ')} status`
                : 'No research papers in your workspace yet'}
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `No papers matched "${searchQuery}". Try a different keyword or reset filters.`
                : 'Begin drafting your academic paper with integrated AI tools, Markdown editor, and references.'}
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
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenCreatePaper()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#AAFFC7] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#94f5b4] active:scale-95 transition-all shadow-md shadow-[#AAFFC7]/20 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Create your first paper</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredPapers.map((paper) => (
              <PaperCard
                key={paper.id || paper._id || paper.title}
                paper={paper}
                onOpen={handleOpenExistingPaper}
                onDelete={(id) => setDeletingPaperId(id)}
                onOpenSlides={(p) => setSlideModalPaper(p)}
                onOpenGraph={(p) => setGraphModalPaper(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals & Dialogs ───────────────────────────────────────────────────── */}
      {isEditorOpen && activePaper && (
        <PaperEditor
          paper={activePaper}
          onSave={handleSaveActivePaper}
          onClose={() => {
            setIsEditorOpen(false);
            setActivePaper(null);
          }}
          onDelete={(id) => setDeletingPaperId(id)}
          onAddCitation={handleAddCitationToActivePaper}
        />
      )}

      {/* Slide Deck Generator Modal from Card */}
      {slideModalPaper && (
        <SlideGeneratorModal
          isOpen={Boolean(slideModalPaper)}
          onClose={() => setSlideModalPaper(null)}
          paperTitle={slideModalPaper.title}
          paperContent={slideModalPaper.contentMarkdown || slideModalPaper.abstract}
          initialSlidesMarkdown={slideModalPaper.slidesMarkdown}
          onSaveSlides={handleSaveSlidesForPaper}
        />
      )}

      {/* 3D Semantic Citation Knowledge Graph Modal */}
      {graphModalPaper && (
        <CitationGraphModal
          isOpen={Boolean(graphModalPaper)}
          onClose={() => setGraphModalPaper(null)}
          paper={graphModalPaper}
        />
      )}

      <DeletePaperModal
        isOpen={Boolean(deletingPaperId)}
        onClose={() => setDeletingPaperId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        paperTitle={deletingPaperObject?.title}
      />
    </div>
  );
}
