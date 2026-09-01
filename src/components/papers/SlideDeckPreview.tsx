'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { showAppToast } from '@/src/components/ui/appToastEvents';
import { exportToPowerPoint } from '@/src/lib/pptxExporter';
import { ThemeId, PRESENTATION_THEMES, IPresentationTheme } from '@/src/lib/presentationThemes';

interface SlideData {
  id: number;
  raw: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  notes?: string;
}

interface SlideDeckPreviewProps {
  marpMarkdown: string;
  paperTitle?: string;
  onClose?: () => void;
  onRegenerate?: () => void;
}

export function SlideDeckPreview({
  marpMarkdown,
  paperTitle,
  onClose,
  onRegenerate,
}: SlideDeckPreviewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);

  // Theme selection state
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>('neon_emerald');
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  const currentTheme: IPresentationTheme = PRESENTATION_THEMES[selectedThemeId] || PRESENTATION_THEMES.neon_emerald;

  // Parse Marp markdown into slide objects
  const slides: SlideData[] = useMemo(() => {
    if (!marpMarkdown) return [];

    // Strip top frontmatter if present (e.g. between first pair of ---)
    let content = marpMarkdown.trim();
    if (content.startsWith('---')) {
      const secondDivider = content.indexOf('\n---', 3);
      if (secondDivider !== -1) {
        content = content.substring(secondDivider + 4).trim();
      }
    }

    // Split slides by '---'
    const rawSlides = content
      .split(/\n---\n|\n---/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return rawSlides.map((raw, index) => {
      // Extract Speaker Note <!-- note: ... -->
      let notes: string | undefined;
      const noteMatch = raw.match(/<!--\s*note:\s*([\s\S]*?)\s*-->/i);
      if (noteMatch) {
        notes = noteMatch[1].trim();
      }

      // Remove the note tag from visible content
      const cleaned = raw.replace(/<!--\s*note:\s*[\s\S]*?\s*-->/gi, '').trim();

      // Extract Title (# ...)
      const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
      let title = `Slide ${index + 1}`;
      let subtitle: string | undefined;
      const bullets: string[] = [];

      lines.forEach((line) => {
        if (line.startsWith('# ')) {
          title = line.replace('# ', '').trim();
        } else if (line.startsWith('## ')) {
          if (!title || title === `Slide ${index + 1}`) {
            title = line.replace('## ', '').trim();
          } else {
            subtitle = line.replace('## ', '').trim();
          }
        } else if (line.startsWith('### ')) {
          bullets.push(line.replace('### ', '').trim());
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          bullets.push(line.replace(/^[-*]\s+/, '').trim());
        } else if (line.length > 0 && !line.startsWith('<!--')) {
          if (!subtitle && bullets.length === 0 && index === 0) {
            subtitle = line;
          } else {
            bullets.push(line);
          }
        }
      });

      return {
        id: index + 1,
        raw,
        title,
        subtitle,
        bullets,
        notes,
      };
    });
  }, [marpMarkdown]);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        if (!isFullscreen) {
          const el = document.getElementById('slide-presentation-container');
          el?.requestFullscreen?.();
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(marpMarkdown);
    setIsCopied(true);
    showAppToast({
      type: 'success',
      title: 'Marp Markdown Copied',
      message: 'Slide markdown ready for Marp CLI, VSCode, or presentation tool.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([marpMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(paperTitle || 'presentation').replace(/\s+/g, '_').toLowerCase()}_slides.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAppToast({
      type: 'info',
      title: 'Slides Downloaded',
      message: 'Saved Marp Markdown presentation file.',
    });
  };

  const handleDownloadPPTX = async () => {
    try {
      setIsExportingPptx(true);
      await exportToPowerPoint(slides, paperTitle || 'Academic Research Presentation', selectedThemeId);
      showAppToast({
        type: 'success',
        title: 'PowerPoint Export Complete',
        message: `Downloaded Microsoft PowerPoint (.pptx) with "${currentTheme.name}" styling & speaker notes.`,
      });
    } catch {
      showAppToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate PPTX file. Please try again.',
      });
    } finally {
      setIsExportingPptx(false);
    }
  };

  const toggleFullscreen = () => {
    const el = document.getElementById('slide-presentation-container');
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No slide content found to preview.</p>
      </div>
    );
  }

  const formalThemes = Object.values(PRESENTATION_THEMES).filter((t) => t.category === 'formal');
  const casualThemes = Object.values(PRESENTATION_THEMES).filter((t) => t.category === 'casual');

  return (
    <div
      id="slide-presentation-container"
      className={`flex flex-col bg-zinc-950 text-zinc-100 ${
        isFullscreen ? 'fixed inset-0 z-[100] h-screen w-screen p-6' : 'w-full rounded-2xl border border-zinc-800'
      }`}
    >
      {/* ── Top Bar Controls ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/70 px-4 sm:px-6 py-3 relative">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#AAFFC7]/15 text-[#AAFFC7] font-bold text-xs border border-[#AAFFC7]/30">
            📑
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {paperTitle || 'Academic Slide Deck'}
            </h3>
            <p className="text-[11px] text-zinc-400">
              Slide {currentSlideIndex + 1} of {slides.length} • {currentTheme.name} ({currentTheme.category})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Selector Button & Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
              title="Change slide theme (Formal / Casual)"
            >
              <span>🎨 {currentTheme.name}</span>
              <svg className="w-3 h-3 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isThemePickerOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl z-40 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono mb-1.5 flex items-center gap-1">
                    <span>🏛️ Formal Themes</span>
                  </div>
                  <div className="space-y-1">
                    {formalThemes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedThemeId(t.id);
                          setIsThemePickerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          selectedThemeId === t.id
                            ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                            : 'text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: `#${t.pptxAccent}` }}
                          />
                          <span>{t.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{t.isDark ? 'Dark' : 'Light'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono mb-1.5 flex items-center gap-1">
                    <span>🎨 Casual & Modern Themes</span>
                  </div>
                  <div className="space-y-1">
                    {casualThemes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedThemeId(t.id);
                          setIsThemePickerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          selectedThemeId === t.id
                            ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                            : 'text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: `#${t.pptxAccent}` }}
                          />
                          <span>{t.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{t.isDark ? 'Dark' : 'Light'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'visual' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Slides View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'code' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Marp Code
            </button>
          </div>

          {/* Toggle Notes */}
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              showNotes
                ? 'border-[#AAFFC7]/40 bg-[#AAFFC7]/10 text-[#AAFFC7]'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Toggle speaker cue notes"
          >
            <span>🎙️ Notes</span>
          </button>

          {/* Download PPTX Button */}
          <button
            type="button"
            onClick={handleDownloadPPTX}
            disabled={isExportingPptx}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 active:scale-95 transition-all cursor-pointer shadow-sm shadow-emerald-950/20"
            title={`Download native PowerPoint (.pptx) with ${currentTheme.name} styling`}
          >
            {isExportingPptx ? (
              <span>Exporting...</span>
            ) : (
              <>
                <span>📊</span>
                <span>Download PPTX</span>
              </>
            )}
          </button>

          {/* Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer hidden sm:inline-block"
            title="Copy Marp Markdown"
          >
            {isCopied ? '✓ Copied' : 'Copy MD'}
          </button>

          {/* Download MD */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer hidden md:inline-block"
            title="Download Marp .md file"
          >
            .md
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            title="Fullscreen presentation mode (F)"
          >
            {isFullscreen ? 'Exit Fullscreen' : '⛶ Present'}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Main Slide Display Area ──────────────────────────────────────────── */}
      {viewMode === 'visual' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden min-h-[420px]">
          {/* 16:9 Aspect Ratio Dynamic Themed Slide Canvas */}
          <div
            className={`relative w-full max-w-4xl aspect-[16/9] rounded-2xl p-6 sm:p-10 flex flex-col justify-between shadow-2xl ring-1 ring-white/5 select-none transition-all duration-300 ${currentTheme.cssBg} ${currentTheme.cssText} ${currentTheme.fontClass}`}
            style={{
              borderColor: `#${currentTheme.pptxAccent}33`,
              boxShadow: `0 20px 40px -15px #${currentTheme.pptxAccent}25`,
            }}
          >
            {/* Slide Header & Category Pill */}
            <div>
              <div
                className="flex items-center justify-between border-b pb-3"
                style={{ borderColor: `#${currentTheme.pptxMuted}33` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ backgroundColor: `#${currentTheme.pptxAccent}` }}
                  />
                  <span
                    className={`text-[11px] font-mono tracking-wider uppercase font-bold px-2 py-0.5 rounded-md ${currentTheme.badgeBg} ${currentTheme.badgeText}`}
                  >
                    {currentSlideIndex === 0
                      ? 'Academic Keynote • Title Slide'
                      : currentSlideIndex === slides.length - 1
                      ? 'Conclusion & Q&A'
                      : `Section ${currentSlideIndex} • Empirical Findings`}
                  </span>
                </div>
                <span className={`text-[11px] font-mono ${currentTheme.cssMuted}`}>
                  {currentSlideIndex + 1} / {slides.length}
                </span>
              </div>

              {/* Slide Title */}
              <h2 className="mt-4 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                {currentSlide.title}
              </h2>

              {currentSlide.subtitle && (
                <p className={`mt-2 text-xs sm:text-sm italic ${currentTheme.cssMuted}`}>
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Slide Bullets / Body Content Card Container */}
            <div
              className={`my-auto py-3 px-4 rounded-xl border space-y-3 ${currentTheme.cssCardBg} ${currentTheme.cssCardBorder}`}
            >
              {currentSlide.bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-xs sm:text-sm lg:text-base leading-relaxed"
                >
                  <span
                    className="mt-2 flex h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: `#${currentTheme.pptxAccent}` }}
                  />
                  <span className="flex-1 font-medium">{bullet}</span>
                </div>
              ))}
            </div>

            {/* Slide Footer */}
            <div
              className={`flex items-center justify-between border-t pt-3 text-[11px] font-mono ${currentTheme.cssMuted}`}
              style={{ borderColor: `#${currentTheme.pptxMuted}33` }}
            >
              <span>{paperTitle || 'Research Presentation'}</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: `#${currentTheme.pptxAccent}` }}
                />
                <span>AtlasAI Academic Studio</span>
              </span>
            </div>
          </div>

          {/* Speaker Notes Drawer */}
          {showNotes && currentSlide.notes && (
            <div className="mt-4 w-full max-w-4xl rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 sm:p-4 text-xs text-amber-200/90 backdrop-blur-md animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-bold text-amber-400 mb-1 text-[11px] uppercase tracking-wider">
                <span>🎙️ 15-Sec Speaker Cue</span>
              </div>
              <p className="leading-relaxed font-sans">{currentSlide.notes}</p>
            </div>
          )}

          {/* ── Carousel Bottom Navigation ────────────────────────────────────── */}
          <div className="mt-5 flex items-center justify-between w-full max-w-4xl gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            >
              ← Previous
            </button>

            {/* Slide indicator dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto px-2 max-w-sm">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlideIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentSlideIndex
                      ? 'w-6'
                      : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  style={
                    i === currentSlideIndex
                      ? { backgroundColor: `#${currentTheme.pptxAccent}` }
                      : undefined
                  }
                  title={`Jump to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentSlideIndex === slides.length - 1}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
              style={{ backgroundColor: `#${currentTheme.pptxAccent}` }}
            >
              Next →
            </button>
          </div>
        </div>
      ) : (
        /* Raw Marp Code View */
        <div className="p-4 sm:p-6 overflow-auto max-h-[550px]">
          <pre className="rounded-xl border border-zinc-800 bg-black/80 p-4 text-xs font-mono text-emerald-300/90 leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {marpMarkdown}
          </pre>
        </div>
      )}
    </div>
  );
}
