'use client';

import React, { useState } from 'react';
import {
  defenseService,
  IDefenseQuestion,
  IDefenseVerdict,
} from '@/src/services/defenseService';
import { showAppToast } from '../ui/appToastEvents';

interface DefenseSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperId: string;
  paperTitle: string;
}

function getExaminerIcon(examinerId: string) {
  const id = (examinerId || '').toLowerCase();
  if (id.includes('vance')) {
    // Methodology / Empirical rigor -> Microscope SVG
    return (
      <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18h8M3 22h18M14 22a7 7 0 1 0-14 0M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
        <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
      </svg>
    );
  }
  if (id.includes('evelyn')) {
    // SOTA & Theoretical foundations -> Compass / Star SVG
    return (
      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    );
  }
  // Hastings / Dean / Scalability -> Landmark / Shield SVG
  return (
    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function DefenseSimulatorModal({
  isOpen,
  onClose,
  paperId,
  paperTitle,
}: DefenseSimulatorModalProps) {
  const [questions, setQuestions] = useState<IDefenseQuestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<Record<string, IDefenseVerdict>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  if (!isOpen) return null;

  const handleStartDefense = async () => {
    try {
      setIsLoading(true);
      const data = await defenseService.getQuestions(paperId);
      setQuestions(data.questions || []);
      setActiveIdx(0);
      showAppToast({
        type: 'info',
        title: 'Committee Convened',
        message: '3 distinguished examiners have formulated defense questions.',
      });
    } catch {
      showAppToast({
        type: 'error',
        title: 'Failed to Convene',
        message: 'Could not generate defense panel. Verify agent connection.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentQ = questions[activeIdx];

  const handleSubmitRebuttal = async () => {
    if (!currentQ) return;
    const ans = answers[currentQ.examiner_id]?.trim();
    if (!ans || ans.length < 15) {
      showAppToast({
        type: 'error',
        title: 'Detailed Answer Required',
        message: 'Please formulate a substantive defense rebuttal (at least 2-3 sentences).',
      });
      return;
    }

    try {
      setIsEvaluating(true);
      const verdict = await defenseService.evaluateRebuttal(paperId, {
        examiner_name: currentQ.examiner_name,
        examiner_title: currentQ.examiner_title,
        question: currentQ.question,
        student_answer: ans,
      });

      setVerdicts((prev) => ({ ...prev, [currentQ.examiner_id]: verdict }));
      showAppToast({
        type: 'success',
        title: 'Committee Deliberated',
        message: `Verdict: ${verdict.verdict} (Score: ${verdict.score}/100)`,
      });
    } catch {
      showAppToast({
        type: 'error',
        title: 'Deliberation Failed',
        message: 'Failed to evaluate answer. Please try again.',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
              <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2 2 7h20z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Thesis Defense & Viva Simulator
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  3-Examiner Panel
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Defend your methodology, novelty, and scalability against senior academics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {questions.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto space-y-5">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Enter the Defense Chamber</h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                  The committee will review <span className="text-amber-300 font-semibold">{paperTitle}</span> and formulate tough, interrogation-style questions to challenge your findings.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartDefense}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-bold text-black hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    <span>Convening Committee...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 3 14 9-14 9V3z" />
                    </svg>
                    <span>Convene Examination Panel</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Examiner Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {questions.map((q, idx) => {
                  const isSelected = activeIdx === idx;
                  const isAnswered = !!verdicts[q.examiner_id];
                  return (
                    <button
                      key={q.examiner_id}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                          : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800/80 border border-zinc-700/50">
                          {getExaminerIcon(q.examiner_id)}
                        </div>
                        {isAnswered && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                            {verdicts[q.examiner_id].score}/100
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs font-bold text-white truncate">{q.examiner_name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{q.examiner_title}</p>
                    </button>
                  );
                })}
              </div>

              {/* Active Question Box */}
              {currentQ && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                      Targeted Section: {currentQ.targeted_section}
                    </span>
                    <h4 className="mt-1 text-sm font-semibold text-white leading-snug">
                      "{currentQ.question}"
                    </h4>
                    <div className="mt-2 flex items-start gap-2 text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                      <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                      </svg>
                      <p>
                        <strong className="text-zinc-300">Examiner is probing for:</strong> {currentQ.what_examiner_looks_for}
                      </p>
                    </div>
                  </div>

                  {/* Rebuttal Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-300">
                      Your Defense / Rebuttal:
                    </label>
                    <textarea
                      rows={4}
                      value={answers[currentQ.examiner_id] || ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQ.examiner_id]: e.target.value,
                        }))
                      }
                      placeholder="State your empirical reasoning, theoretical justification, or data controls..."
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitRebuttal}
                      disabled={isEvaluating}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-black hover:bg-amber-300 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isEvaluating ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" />
                          </svg>
                          <span>Committee Deliberating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m22 2-7 20-4-9-9-4Z" />
                            <path d="M22 2 11 13" />
                          </svg>
                          <span>Submit Rebuttal</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Verdict Display */}
                  {verdicts[currentQ.examiner_id] && (
                    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Verdict: {verdicts[currentQ.examiner_id].verdict}
                        </span>
                        <span className="text-sm font-bold text-white bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                          {verdicts[currentQ.examiner_id].score} / 100
                        </span>
                      </div>
                      <p className="text-xs italic text-zinc-300">
                        "{verdicts[currentQ.examiner_id].examiner_reaction}"
                      </p>
                      <div className="text-xs text-zinc-400 space-y-1">
                        <p><strong className="text-emerald-300">Strengths:</strong> {verdicts[currentQ.examiner_id].strengths.join(', ')}</p>
                        <p><strong className="text-amber-300">Weaknesses:</strong> {verdicts[currentQ.examiner_id].weaknesses.join(', ')}</p>
                        <p><strong className="text-zinc-200">Advice:</strong> {verdicts[currentQ.examiner_id].closing_advice}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

