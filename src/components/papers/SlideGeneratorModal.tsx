'use client';

import React, { useState, useEffect } from 'react';
import { academicService, ISlideDeckResult } from '@/src/services/academicService';
import { showAppToast } from '@/src/components/ui/appToastEvents';
import { SlideDeckPreview } from './SlideDeckPreview';

interface SlideGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperTitle: string;
  paperContent?: string;
  initialSlidesMarkdown?: string;
  onSaveSlides?: (slidesMarkdown: string, slideCount: number) => Promise<void> | void;
}

const SLIDE_COUNT_OPTIONS = [
  { count: 5, label: '5 Slides', desc: 'Rapid Lightning Talk (3-5 min)' },
  { count: 8, label: '8 Slides', desc: 'Standard Conference Presentation (10 min)' },
  { count: 10, label: '10 Slides', desc: 'Thesis / Defense Overview (15 min)' },
  { count: 12, label: '12 Slides', desc: 'Comprehensive Seminar Keynote (20 min)' },
];

const GENERATION_TIPS = [
  'Extracting core problem statement and research novelty...',
  'Structuring narrative arc: Background → Methods → Results → Discussion...',
  'Generating 15-second imperative speaker cues for each slide...',
  'Formatting Marp-compliant clean academic layouts...',
  'Optimizing bullet points for maximum audience engagement...',
];

export function SlideGeneratorModal({
  isOpen,
  onClose,
  paperTitle,
  paperContent,
  initialSlidesMarkdown,
  onSaveSlides,
}: SlideGeneratorModalProps) {
  const [numSlides, setNumSlides] = useState<number>(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slidesMarkdown, setSlidesMarkdown] = useState<string>(initialSlidesMarkdown || '');
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [generationMeta, setGenerationMeta] = useState<{ duration?: number; tokens?: number } | null>(null);

  // Sync initial slides
  useEffect(() => {
    if (initialSlidesMarkdown) {
      setSlidesMarkdown(initialSlidesMarkdown);
    }
  }, [initialSlidesMarkdown]);

  // Rotate generation tips while generating
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % GENERATION_TIPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!paperTitle.trim()) {
      showAppToast({
        type: 'error',
        title: 'Title Required',
        message: 'Please give your paper a title before generating slides.',
      });
      return;
    }

    try {
      setIsGenerating(true);
      const result: ISlideDeckResult = await academicService.generateSlides(
        paperTitle,
        paperContent || '',
        numSlides,
      );

      const markdown = (result as unknown as { marp_slides_markdown?: string }).marp_slides_markdown || result.marp_markdown || '';
      
      setSlidesMarkdown(markdown);
      setGenerationMeta({
        duration: result.duration_sec,
      });

      if (onSaveSlides) {
        await onSaveSlides(markdown, numSlides);
      }

      showAppToast({
        type: 'success',
        title: 'Slide Deck Generated!',
        message: `Successfully created ${numSlides} academic presentation slides.`,
      });
    } catch {
      showAppToast({
        type: 'error',
        title: 'Generation Failed',
        message: 'Could not generate slide deck. Please verify agent connection.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AAFFC7]/15 text-[#AAFFC7] font-bold border border-[#AAFFC7]/30">
              📑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Academic Slide Deck Generator
              </h2>
              <p className="text-xs text-zinc-400">
                1-Click Marp conference presentation builder with speaker notes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            /* Generating Progress State */
            <div className="py-16 text-center max-w-md mx-auto space-y-6">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#AAFFC7]/20 border-t-[#AAFFC7] animate-spin" />
                <span className="text-2xl">✨</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Crafting Conference Presentation...
                </h3>
                <p className="mt-2 text-xs text-emerald-400/90 font-mono min-h-[20px] transition-all">
                  {GENERATION_TIPS[activeTipIndex]}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-[11px] text-zinc-400 text-left">
                <p className="font-semibold text-zinc-300">Targeting {numSlides} Slides:</p>
                <p className="mt-1 text-zinc-500">
                  Paper: <span className="text-zinc-300 font-medium">{paperTitle}</span>
                </p>
              </div>
            </div>
          ) : slidesMarkdown ? (
            /* Render Generated Slides */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <span>✓ Slide deck ready</span>
                  {generationMeta?.duration && (
                    <span className="text-zinc-500">• Generated in {generationMeta.duration}s</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSlidesMarkdown('')}
                  className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
                >
                  Configure & Regenerate ↺
                </button>
              </div>

              <SlideDeckPreview
                marpMarkdown={slidesMarkdown}
                paperTitle={paperTitle}
                onClose={onClose}
                onRegenerate={() => setSlidesMarkdown('')}
              />
            </div>
          ) : (
            /* Configure & Generate State */
            <div className="space-y-6 max-w-2xl mx-auto py-4">
              {/* Paper Context Card */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Source Research
                </span>
                <h3 className="mt-1 text-sm sm:text-base font-bold text-white">
                  {paperTitle || 'Untitled Paper'}
                </h3>
                <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                  {paperContent?.replace(/^[#\s]+/, '') || 'No body content yet. The AI will synthesize slides from the paper title and topic.'}
                </p>
              </div>

              {/* Slide Count Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Select Slide Count & Duration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SLIDE_COUNT_OPTIONS.map((opt) => {
                    const isSelected = numSlides === opt.count;
                    return (
                      <button
                        key={opt.count}
                        type="button"
                        onClick={() => setNumSlides(opt.count)}
                        className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#AAFFC7] bg-[#AAFFC7]/10 ring-1 ring-[#AAFFC7]/30'
                            : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/60 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#AAFFC7]' : 'text-white'}`}>
                            {opt.label}
                          </span>
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-[#AAFFC7]" />
                          )}
                        </div>
                        <span className="mt-1 text-[11px] text-zinc-400 leading-tight">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Key Features Bullet Points */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-xs text-zinc-400 space-y-2">
                <p className="font-semibold text-zinc-300 text-xs">Included in this deck:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="text-[#AAFFC7]">✓</span> Title & Research Problem slide
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="text-[#AAFFC7]">✓</span> Methodology & Novelty breakdown
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="text-[#AAFFC7]">✓</span> Results & Key Empirical Takeaways
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="text-[#AAFFC7]">✓</span> 15-sec Speaker Cues per slide
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#AAFFC7] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#94f5b4] active:scale-95 transition-all shadow-lg shadow-[#AAFFC7]/20 cursor-pointer"
                >
                  <span>Generate {numSlides} Slides</span>
                  <span>✨</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
