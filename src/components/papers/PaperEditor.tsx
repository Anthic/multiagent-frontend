'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IPaper, ICitation } from '@/src/services/paperService';
import { IntegratedParaphrasePanel } from './IntegratedParaphrasePanel';
import { AddCitationModal } from './AddCitationModal';
import { SlideGeneratorModal } from './SlideGeneratorModal';
import { CitationGraphModal } from './CitationGraphModal';
import { showAppToast } from '@/src/components/ui/appToastEvents';
import { academicService } from '@/src/services/academicService';

interface PaperEditorProps {
  paper: IPaper;
  onSave: (updated: Partial<IPaper>) => Promise<void>;
  onClose: () => void;
  onDelete: (paperId: string) => void;
  onAddCitation: (citation: ICitation) => Promise<void>;
}

export function PaperEditor({
  paper,
  onSave,
  onClose,
  
  onAddCitation,
}: PaperEditorProps) {
  const [title, setTitle] = useState(paper.title || '');
  const [abstract, setAbstract] = useState(paper.abstract || '');
  const [contentMarkdown, setContentMarkdown] = useState(paper.contentMarkdown || '');
  const [status, setStatus] = useState<IPaper['status']>(paper.status || 'draft');
  const [citations, setCitations] = useState<ICitation[]>(paper.citations || []);
  const [slidesMarkdown, setSlidesMarkdown] = useState<string>(paper.slidesMarkdown || '');
  const [slideCount, setSlideCount] = useState<number>(paper.slideCount || 0);

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'outline' | 'citations' | 'slides' | 'review'>('outline');
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date>(new Date());
  const [isAddCitationOpen, setIsAddCitationOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
   const handleTriggerPeerReview = async () => {
    if (!contentMarkdown || contentMarkdown.trim().length < 50) {
      showAppToast({
        type: 'error',
        title: 'Insufficient Content',
        message: 'Please write some research content before running peer review.',
      });
      return;
    }
    try {
      setIsReviewing(true);
      showAppToast({
        type: 'info',
        title: 'Running Peer Review',
        message: '3-Agent simulated panel is evaluating your paper...',
      });
      const reviewRes = await academicService.peerReview(title || 'Untitled Paper', contentMarkdown);
      const reviewText = (reviewRes as any).review_markdown || '';
      
      const scoreMatch = reviewText.match(/Score:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 80;
      const peerReviewData = {
        overallScore: score,
        methodologyFeedback: reviewText ? reviewText.slice(0, 300) + '...' : 'Review completed',
        domainFeedback: 'Evaluated by 3-agent academic panel',
        clarityFeedback: reviewText,
      };
      await onSave({
        peerReviewResults: peerReviewData,
      });
      showAppToast({
        type: 'success',
        title: 'Peer Review Complete',
        message: 'Review findings and scores have been attached to your paper.',
      });
    } catch {
      showAppToast({
        type: 'error',
        title: 'Peer Review Failed',
        message: 'Could not connect to AI review panel. Please check your agent connection.',
      });
    } finally {
      setIsReviewing(false);
    }
  };
  // Sync state when paper prop changes
  useEffect(() => {
    setTitle(paper.title || '');
    setAbstract(paper.abstract || '');
    setContentMarkdown(paper.contentMarkdown || '');
    setStatus(paper.status || 'draft');
    setCitations(paper.citations || []);
    setSlidesMarkdown(paper.slidesMarkdown || '');
    setSlideCount(paper.slideCount || 0);
  }, [paper]);

  const handleSaveSlides = async (newSlidesMarkdown: string, count: number) => {
    setSlidesMarkdown(newSlidesMarkdown);
    setSlideCount(count);
    await onSave({
      slidesMarkdown: newSlidesMarkdown,
      slideCount: count,
    });
  };

  const insertTemplateSection = (secTitle: string) => {
    const template = `\n\n## ${secTitle}\nWrite ${secTitle.toLowerCase()} findings and analysis here...\n`;
    setContentMarkdown((prev) => prev + template);
    showAppToast({
      type: 'info',
      title: 'Section Inserted',
      message: `Appended "## ${secTitle}" to research document.`,
    });
  };

  // Keyboard shortcut for saving (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        // close if not in input
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, abstract, contentMarkdown, status, citations]);

  const handleSave = async () => {
    if (!title.trim()) {
      showAppToast({
        type: 'error',
        title: 'Title Required',
        message: 'Please provide a title for the research paper.',
      });
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        abstract: abstract.trim(),
        contentMarkdown,
        status,
        citations,
      });
      setLastSavedTime(new Date());
      showAppToast({
        type: 'success',
        title: 'Paper Saved',
        message: 'All changes saved to your workspace.',
      });
    } catch {
      showAppToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save paper. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Text selection handler
  const handleTextSelect = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = contentMarkdown.substring(start, end).trim();

    if (text && text.length > 5) {
      setSelectedText(text);
      setSelectionRange({ start, end });
      if (!isAiPanelOpen) setIsAiPanelOpen(true);
    }
  };

  // Replace Selection from AI Paraphraser
  const handleReplaceSelection = useCallback(
    (newText: string) => {
      if (!selectionRange) {
        // Fallback: replace whole content or append
        setContentMarkdown((prev) => (selectedText ? prev.replace(selectedText, newText) : prev + '\n\n' + newText));
      } else {
        const { start, end } = selectionRange;
        const before = contentMarkdown.substring(0, start);
        const after = contentMarkdown.substring(end);
        const updated = before + newText + after;
        setContentMarkdown(updated);

        // Update range for continuous editing
        setSelectionRange({ start, end: start + newText.length });
      }

      showAppToast({
        type: 'success',
        title: 'Selection Replaced',
        message: 'Paraphrased text applied to your paper.',
      });
    },
    [contentMarkdown, selectionRange, selectedText],
  );

  // Insert Below Selection from AI Paraphraser
  const handleInsertBelow = useCallback(
    (newText: string) => {
      if (!selectionRange) {
        setContentMarkdown((prev) => prev + '\n\n' + newText);
      } else {
        const { end } = selectionRange;
        const before = contentMarkdown.substring(0, end);
        const after = contentMarkdown.substring(end);
        const updated = before + '\n\n' + newText + after;
        setContentMarkdown(updated);
      }

      showAppToast({
        type: 'info',
        title: 'Inserted Below',
        message: 'Paraphrased text added to paper.',
      });
    },
    [contentMarkdown, selectionRange],
  );

  // Toolbar Formatting Actions
  const applyFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = contentMarkdown.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;

    const updated =
      contentMarkdown.substring(0, start) + replacement + contentMarkdown.substring(end);
    setContentMarkdown(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + (selected.length || 4),
        );
      }
    }, 50);
  };

  const handleAddNewCitation = async (citation: ICitation) => {
    await onAddCitation(citation);
    setCitations((prev) => [...prev, citation]);
    showAppToast({
      type: 'success',
      title: 'Citation Added',
      message: `[${citation.citationKey}] linked to paper.`,
    });
  };

  const wordCount = contentMarkdown.trim() ? contentMarkdown.trim().split(/\s+/).length : 0;
  const charCount = contentMarkdown.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-zinc-100 overflow-hidden animate-in fade-in duration-200">
      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <header className="h-14 sm:h-16 border-b border-zinc-800 bg-zinc-950/90 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Return to Papers vault"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="hidden sm:inline">Papers</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block shrink-0" />

          {/* Editable Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Research Paper..."
            className="flex-1 max-w-lg bg-transparent text-sm sm:text-base font-bold text-white placeholder-zinc-500 outline-none border-b border-transparent hover:border-zinc-700 focus:border-[#AAFFC7] transition-all px-1 py-0.5 truncate"
          />
        </div>

        {/* Center/Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as IPaper['status'])}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 outline-none focus:border-[#AAFFC7] cursor-pointer"
          >
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          {/* Save Status & Button */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 hidden md:inline font-mono">
              {isSaving ? 'Saving...' : `Saved ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </span>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#AAFFC7] px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-black hover:bg-[#94f5b4] active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-[#AAFFC7]/20 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeOpacity="1" />
                  </svg>
                  <span className="hidden sm:inline">Saving</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Save</span>
                </>
              )}
            </button>
          </div>

          {/* 3D Semantic Citation & Knowledge Graph */}
          <button
            type="button"
            onClick={() => setIsGraphModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:text-sky-300 hover:border-sky-500/40 hover:bg-sky-950/20 transition-all cursor-pointer"
            title="Open 3D Semantic Citation Knowledge Graph"
          >
            <span>🌐</span>
            <span className="hidden sm:inline">3D Knowledge Map</span>
          </button>

          {/* Presentation Slides Generator & Viewer */}
          <button
            type="button"
            onClick={() => setIsSlideModalOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              slidesMarkdown
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 shadow-sm shadow-emerald-950/30'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="Generate or Present Marp Slide Deck"
          >
            <span>📑</span>
            <span className="hidden sm:inline">
              {slidesMarkdown ? `Slides (${slideCount || 8})` : 'Presentation Slides'}
            </span>
          </button>

          {/* AI Tools Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              isAiPanelOpen
                ? 'bg-[#AAFFC7]/20 border-[#AAFFC7]/40 text-[#AAFFC7]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle AI Paraphrase Assistant"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="m16.24 16.24 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="m16.24 7.76 2.83-2.83" />
            </svg>
            <span className="hidden sm:inline">AI Paraphrase</span>
          </button>
        </div>
      </header>

      {/* ── Main Workspace Body ──────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Sidebar (Outline, Citations, Slides, Review) ───────────────── */}
        <aside className="w-72 lg:w-80 border-r border-zinc-800/80 bg-zinc-950/60 hidden md:flex flex-col shrink-0">
          {/* Sidebar Navigation Tabs */}
          <div className="flex items-center border-b border-zinc-800/80 p-2 gap-1 bg-zinc-950">
            <button
              type="button"
              onClick={() => setActiveSidebarTab('outline')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeSidebarTab === 'outline'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Outline
            </button>
            <button
              type="button"
              onClick={() => setActiveSidebarTab('citations')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeSidebarTab === 'citations'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Citations ({citations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSidebarTab('slides')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeSidebarTab === 'slides'
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Slides {slidesMarkdown ? '✓' : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveSidebarTab('review')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeSidebarTab === 'review'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Review
            </button>
          </div>

          {/* Sidebar Content Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeSidebarTab === 'outline' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Paper Structure
                  </h4>
                  <span className="text-[10px] text-zinc-500">Auto generated</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-zinc-300 font-medium flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-[#AAFFC7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>Abstract</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-zinc-300 font-medium flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                    </svg>
                    <span>Main Research Body</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-zinc-300 font-medium flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>References ({citations.length})</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-900">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Writing Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2.5">
                      <p className="text-zinc-500 text-[10px]">Words</p>
                      <p className="font-bold text-white text-sm">{wordCount}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-2.5">
                      <p className="text-zinc-500 text-[10px]">Characters</p>
                      <p className="font-bold text-white text-sm">{charCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSidebarTab === 'citations' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Citations ({citations.length})
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsGraphModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-950/40 border border-sky-500/30 px-2 py-1 text-[11px] font-semibold text-sky-300 hover:bg-sky-900/50 transition-colors cursor-pointer"
                      title="View 3D Semantic Citation Graph"
                    >
                      <span>🌐 3D Map</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddCitationOpen(true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-[#AAFFC7] hover:text-black transition-colors cursor-pointer"
                    >
                      <span>+ Add</span>
                    </button>
                  </div>
                </div>

                {citations.length === 0 ? (
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 text-center">
                    <p className="text-xs text-zinc-400">No citations added yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddCitationOpen(true)}
                      className="mt-2 text-xs font-semibold text-[#AAFFC7] hover:underline cursor-pointer"
                    >
                      + Add first reference
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {citations.map((c, i) => (
                      <div
                        key={c.citationKey || i}
                        className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-[#AAFFC7] bg-[#AAFFC7]/10 px-1.5 py-0.5 rounded">
                            [{c.citationKey}]
                          </span>
                          {c.year && <span className="text-zinc-500 text-[11px]">{c.year}</span>}
                        </div>
                        <p className="font-medium text-zinc-200 line-clamp-2">{c.title}</p>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline truncate max-w-full"
                          >
                            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            <span className="truncate">Open Source</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Slides Presentation Sidebar Tab ── */}
            {activeSidebarTab === 'slides' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Conference Presentation
                  </h4>
                  {slidesMarkdown && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-0.5 rounded-md border border-emerald-500/30">
                      Marp Ready
                    </span>
                  )}
                </div>

                {slidesMarkdown ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <span>📑</span>
                      <span>{slideCount || 8} Academic Slides Generated</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Complete with 15-second speaker cues, conference title slide, and methodology takeaways.
                    </p>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSlideModalOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#AAFFC7] px-3 py-2 text-xs font-bold text-black hover:bg-[#94f5b4] transition-all cursor-pointer shadow-md shadow-[#AAFFC7]/20"
                      >
                        <span>⛶ Open Presentation Deck</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSlideModalOpen(true)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        ↺ Regenerate / Customize
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-center space-y-3">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#AAFFC7]/15 text-[#AAFFC7] text-lg border border-[#AAFFC7]/30">
                      📑
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">No slides created yet</p>
                      <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                        Transform this research paper into a 8-12 slide Marp conference deck in seconds.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSlideModalOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#AAFFC7] px-3 py-2 text-xs font-bold text-black hover:bg-[#94f5b4] transition-all cursor-pointer shadow-md shadow-[#AAFFC7]/20"
                    >
                      <span>✨ Generate Slide Deck</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSidebarTab === 'review' && (
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Peer Review Panel
                </h4>
                {paper.peerReviewResults ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-400">Score</span>
                      <span className="font-bold text-white text-sm">
                        {paper.peerReviewResults.overallScore}/10
                      </span>
                    </div>
                    {paper.peerReviewResults.methodologyFeedback && (
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-semibold">Methodology</p>
                        <p className="text-zinc-300 text-[11px] mt-0.5">{paper.peerReviewResults.methodologyFeedback}</p>
                      </div>
                    )}
                    {paper.peerReviewResults.clarityFeedback && (
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-semibold">Clarity</p>
                        <p className="text-zinc-300 text-[11px] mt-0.5">{paper.peerReviewResults.clarityFeedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 text-center space-y-3">
                    <p className="text-xs text-zinc-400">No peer review generated yet.</p>
                    <button
                      type="button"
                      onClick={handleTriggerPeerReview}
                      disabled={isReviewing}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>{isReviewing ? ' Reviewing...' : ' Run 3-Agent Review'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── Center Panel: Markdown Writing Canvas ──────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 bg-black overflow-y-auto">
          {/* Canvas Formatting Toolbar */}
          <div className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-2 flex items-center justify-between gap-2 shrink-0 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => applyFormat('# ', '')}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white text-xs font-bold"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => applyFormat('## ', '')}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white text-xs font-bold"
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => applyFormat('### ', '')}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white text-xs font-bold"
                title="Heading 3"
              >
                H3
              </button>

              <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

              <button
                type="button"
                onClick={() => applyFormat('**', '**')}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white text-xs font-bold"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyFormat('*', '*')}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white text-xs italic font-serif"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => applyFormat('> ', '')}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
                title="Blockquote"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => applyFormat('- ', '')}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
                title="Bullet List"
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
              <button
                type="button"
                onClick={() => applyFormat('```\n', '\n```')}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white font-mono text-xs"
                title="Code Block"
              >
                {'</>'}
              </button>

              <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

              {/* Quick Section Inserters */}
              <div className="hidden lg:flex items-center gap-1">
                {['Introduction', 'Methodology', 'Results & Findings', 'Discussion', 'Conclusion'].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => insertTemplateSection(sec)}
                    className="px-2 py-1 rounded-md text-[11px] bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-[#AAFFC7] hover:border-[#AAFFC7]/30 transition-all"
                  >
                    + {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Write vs Preview Tabs */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'write'
                    ? 'bg-zinc-800 text-[#AAFFC7]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-zinc-800 text-[#AAFFC7]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Canvas Writing Area */}
          <div className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
            {/* Quick UX Hint Banner */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#AAFFC7]/20 bg-[#AAFFC7]/5 px-4 py-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="text-[#AAFFC7]">💡</span>
                <span>
                  <strong>Tip:</strong> Highlight any text to paraphrase with AI, or click <strong>Presentation Slides</strong> to build conference slides.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(true)}
                className="font-bold text-[#AAFFC7] hover:underline shrink-0 cursor-pointer"
              >
                📑 Slides →
              </button>
            </div>

            {/* Abstract Block */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4 sm:p-5 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Abstract
              </label>
              <textarea
                rows={3}
                placeholder="Write a concise overview of the problem, methodology, and key discoveries..."
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 outline-none resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Content Markdown Canvas */}
            <div className="min-h-[450px]">
              {activeTab === 'write' ? (
                <textarea
                  ref={textareaRef}
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  onSelect={handleTextSelect}
                  placeholder="Start composing your research paper in Markdown format... Highlight any sentence or paragraph to trigger AI Paraphrase!"
                  className="w-full min-h-[500px] bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-600 outline-none resize-none font-sans leading-relaxed select-text"
                />
              ) : (
                <div className="prose prose-invert max-w-none text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {contentMarkdown ? (
                    contentMarkdown
                  ) : (
                    <p className="text-zinc-500 italic">No content to preview.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── Right Panel: Integrated AI Paraphraser ─────────────────────────── */}
        {isAiPanelOpen && (
          <aside className="w-80 sm:w-96 border-l border-zinc-800/80 bg-zinc-950/95 flex flex-col shrink-0 p-2 sm:p-3">
            <IntegratedParaphrasePanel
              selectedText={selectedText}
              onReplaceSelection={handleReplaceSelection}
              onInsertBelow={handleInsertBelow}
              onClose={() => setIsAiPanelOpen(false)}
            />
          </aside>
        )}
      </div>

      {/* Add Citation Dialog */}
      <AddCitationModal
        isOpen={isAddCitationOpen}
        onClose={() => setIsAddCitationOpen(false)}
        onAdd={handleAddNewCitation}
      />

      {/* Presentation Slide Generator & Deck Viewer */}
      <SlideGeneratorModal
        isOpen={isSlideModalOpen}
        onClose={() => setIsSlideModalOpen(false)}
        paperTitle={title}
        paperContent={contentMarkdown || abstract}
        initialSlidesMarkdown={slidesMarkdown}
        onSaveSlides={handleSaveSlides}
      />

      {/* 3D Semantic Citation Knowledge Map */}
      <CitationGraphModal
        isOpen={isGraphModalOpen}
        onClose={() => setIsGraphModalOpen(false)}
        paper={{
          ...paper,
          title,
          abstract,
          contentMarkdown,
          citations,
          slidesMarkdown,
          slideCount,
        }}
      />
    </div>
  );
}
