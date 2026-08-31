'use client';

import React, { useState, useEffect } from 'react';
import {
  paraphraseService,
  ParaphraseMode,
  IParaphraseResult,
} from '@/src/services/paraphraseService';
import { useWalletStore } from '@/src/store/walletStore';
import { showAppToast } from '@/src/components/ui/appToastEvents';

interface IntegratedParaphrasePanelProps {
  selectedText: string;
  onReplaceSelection: (newText: string) => void;
  onInsertBelow: (newText: string) => void;
  onClose?: () => void;
}

const MODES: Array<{
  id: ParaphraseMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'academic',
    label: 'Academic',
    description: 'Journal-quality formal rewrite with scholarly tone',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: 'simplify',
    label: 'Simplify',
    description: 'Clear, plain-language explanation without jargon',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'Concise executive summary of core takeaways',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: 'humanize',
    label: 'Humanize',
    description: 'Natural human cadence, eliminating repetitive AI phrasing',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function IntegratedParaphrasePanel({
  selectedText,
  onReplaceSelection,
  onInsertBelow,
  onClose,
}: IntegratedParaphrasePanelProps) {
  const [inputText, setInputText] = useState(selectedText);
  const [selectedMode, setSelectedMode] = useState<ParaphraseMode>('academic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<IParaphraseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInsufficientCredits, setIsInsufficientCredits] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { openTopUpModal, fetchWalletBalance } = useWalletStore();

  useEffect(() => {
    if (selectedText) {
      setInputText(selectedText);
      setResult(null);
      setError(null);
      setIsInsufficientCredits(false);
    }
  }, [selectedText]);

  const handleParaphrase = async () => {
    const textToProcess = inputText.trim();
    if (!textToProcess) {
      setError('Please select or enter text to paraphrase.');
      return;
    }
    if (textToProcess.length < 10) {
      setError('Text must be at least 10 characters long.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setIsInsufficientCredits(false);
    setResult(null);

    try {
      const data = await paraphraseService.paraphrase({
        text: textToProcess,
        mode: selectedMode,
      });

      setResult(data);
      fetchWalletBalance();
      showAppToast({
        type: 'success',
        title: 'Paraphrase Complete',
        message: `Rewritten in ${selectedMode} mode.`,
      });
    } catch (err: any) {
      const statusCode = err?.statusCode || err?.response?.status;
      const message = err?.message || err?.response?.data?.message || 'Failed to paraphrase text.';

      if (statusCode === 402 || message.toLowerCase().includes('insufficient')) {
        setIsInsufficientCredits(true);
        setError('Insufficient wallet balance to perform this operation.');
      } else if (statusCode === 429) {
        setError('Rate limit reached for your plan. Please wait a moment before trying again.');
      } else {
        setError(message);
      }

      showAppToast({
        type: 'error',
        title: 'Paraphrase Failed',
        message: message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result?.paraphrased_text) return;
    navigator.clipboard.writeText(result.paraphrased_text);
    setIsCopied(true);
    showAppToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: 'Paraphrased text copied.',
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const charCount = inputText.length;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800/90 bg-zinc-950/90 p-4 sm:p-5 backdrop-blur-xl shadow-2xl overflow-y-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#AAFFC7]/15 text-[#AAFFC7]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="m4.93 4.93 2.83 2.83" />
              <path d="m16.24 16.24 2.83 2.83" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="m4.93 19.07 2.83-2.83" />
              <path d="m16.24 7.76 2.83-2.83" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">AI Paraphraser</h3>
            <p className="text-[10px] text-zinc-400">Refine, simplify, or restructure selected text</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="Close AI panel"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4 flex-1">
        {/* Mode Selector Tabs */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
            Paraphrase Mode
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => {
              const isSelected = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMode(m.id)}
                  className={`flex items-center gap-2 rounded-xl p-2 text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#AAFFC7]/15 border-[#AAFFC7]/40 text-[#AAFFC7] shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <div className={`shrink-0 ${isSelected ? 'text-[#AAFFC7]' : 'text-zinc-400'}`}>
                    {m.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-none">{m.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Input Text */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Source Text
            </label>
            <span className="text-[10px] text-zinc-500 font-mono">
              {charCount} characters
            </span>
          </div>
          <textarea
            rows={4}
            placeholder="Highlight text in the paper canvas or paste text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#AAFFC7] focus:ring-1 focus:ring-[#AAFFC7]/40 resize-none font-sans leading-relaxed transition-all"
            disabled={isProcessing}
          />
        </div>

        {/* Error / Insufficient credits notification */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300 space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
            {isInsufficientCredits && (
              <button
                type="button"
                onClick={() => openTopUpModal()}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#AAFFC7] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#94f5b4] transition-colors cursor-pointer"
              >
                <span>Recharge Wallet Balance</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Generate Trigger Button */}
        <button
          type="button"
          onClick={handleParaphrase}
          disabled={isProcessing || !inputText.trim()}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#AAFFC7] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#94f5b4] active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-[#AAFFC7]/15 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeOpacity="1" />
              </svg>
              <span>Paraphrasing Text...</span>
            </>
          ) : (
            <>
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
              <span>Paraphrase with AI</span>
            </>
          )}
        </button>

        {/* Result Area */}
        {result && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>AI Rewritten Version</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                {result.duration_sec ? `${result.duration_sec.toFixed(2)}s` : 'Completed'}
              </span>
            </div>

            <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans select-text">
              {result.paraphrased_text}
            </p>

            {/* Actions: Replace Selection, Insert Below, Copy */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-emerald-500/20">
              <button
                type="button"
                onClick={() => onReplaceSelection(result.paraphrased_text)}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#AAFFC7] px-2.5 py-1.5 text-[11px] font-bold text-black hover:bg-[#94f5b4] transition-all cursor-pointer shadow-sm"
                title="Replace selected text in paper"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m16 3 4 4-4 4" />
                  <path d="M20 7H4" />
                  <path d="m8 21-4-4 4-4" />
                  <path d="M4 17h16" />
                </svg>
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={() => onInsertBelow(result.paraphrased_text)}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
                title="Insert below selection"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
                <span>Insert</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
                title="Copy paraphrased text"
              >
                {isCopied ? (
                  <>
                    <span className="text-[#AAFFC7]">✓</span>
                    <span className="text-[#AAFFC7]">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
