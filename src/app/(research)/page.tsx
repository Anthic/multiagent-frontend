"use client";
import { Navbar } from "@/src/components/Navbar"
import { AgentVisualizer } from "@/src/components/research/AgentVisualizer"
import { CustomMarkdown } from "@/src/components/research/CustomMarkdown"
import { ScoreMeter } from "@/src/components/research/ScoreMeter"
import { showAppToast } from "@/src/components/ui/appToastEvents"
import { api } from "@/src/lib/api"
import { initalJobState, jobReducer } from "@/src/reducer/jobReducer"
import { ResearchService } from "@/src/services/researchService"
import { noteService } from "@/src/services/noteService"
import { useAuthStore, useIsAuthenticated, useUser } from "@/src/store/authStore"
import { useWalletStore } from "@/src/store/walletStore"
import { ApiError } from "@/src/types/api"
import { Job, ResearchQuota } from "@/src/types/research"
import { useJobStatus, useResearchHistory } from "@/src/hooks/useResearch"
import { ActiveTab, DiagnosticsState, UIState } from "@/src/types/researchState"
import { useEffect, useMemo, useReducer, useRef, useState } from "react"
import { useSearchParams } from 'next/navigation';


export default function ResearchPage() {

    const isAuthenticated = useIsAuthenticated()
    const user = useUser()
    const searchParams = useSearchParams()
    const queryJobId = searchParams.get('jobId')


    //job status called by reducer
    const [jobState, dispatch] = useReducer(jobReducer,initalJobState)

    //ui state management
    const [uiState, setUiState]= useState<UIState>({
        topic : '',
        activeTab : 'report',
        sidebarOpen : true
    })

    const [researchMode, setResearchMode] = useState<'fast' | 'deep'>('fast');

    //diagonostic state management
    const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
        agentOnline : null,
        cacheStats : null
    })

  // Active job ID drives TanStack Query polling — no manual setInterval needed
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [quota, setQuota] = useState<ResearchQuota | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // TanStack Query: history — cached, deduped, refetched on window focus
  const { data: historyQueryData, refetch: refetchHistory, isLoading: isHistoryLoading } = useResearchHistory(user?.userId, 100, isAuthenticated);
  const history = historyQueryData?.data?.records ?? [];
  const historyCount = historyQueryData?.data?.count ?? 0;

  // TanStack Query: job polling — refetchInterval stops on done/failed automatically
  const { data: jobQueryData } = useJobStatus(activeJobId);

    // ── Helpers ───────────────────────────────────────────────────────────────
  const setTab = (tab: ActiveTab) =>
    setUiState((prev) => ({ ...prev, activeTab: tab }));
 
  const toggleSidebar = () =>
    setUiState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
 
  const setTopic = (topic: string) =>
    setUiState((prev) => ({ ...prev, topic }));

  const quotaResetLabel = (resetAt?: string | null) => {
    if (!resetAt) return 'about 24 hours';

    const resetDate = new Date(resetAt);
    if (Number.isNaN(resetDate.getTime())) return 'about 24 hours';

    return resetDate.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const parseCreatedAt = (val: any): Date => {
    if (!val) return new Date();
    const num = Number(val);
    if (!isNaN(num)) {
      return new Date(num < 9999999999 ? num * 1000 : num);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const getQuotaFromError = (err: unknown): ResearchQuota | null => {
    const data = (err as Partial<ApiError> | undefined)?.data;
    if (!data || typeof data !== 'object' || !('quota' in data)) return null;

    return (data as { quota?: ResearchQuota }).quota ?? null;
  };

  const showQuotaToast = (quotaInfo?: ResearchQuota | null) => {
    showAppToast({
      type: 'error',
      title: 'Daily research limit reached',
      message: `You have used all ${quotaInfo?.limit ?? 3} daily research runs. You can use it again after ${quotaResetLabel(quotaInfo?.resetAt)}.`,
    });
  };
 
  // ── Mount effect: fetch diagnostics + quota in parallel (no waterfall) ─────
  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const [healthRes, cacheRes, quotaRes] = await Promise.all([
          api.get<{ status: string }>('/research/health').catch(() => null),
          api.get<{ total_keys?: number; hit_rate?: string }>('/research/cache-stats').catch(() => null),
          isAuthenticated ? ResearchService.getQuota().catch(() => null) : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        setDiagnostics({
          agentOnline: healthRes?.success ?? false,
          cacheStats: cacheRes?.success && cacheRes.data ? cacheRes.data : null,
        });

        if (quotaRes?.success && quotaRes.data) setQuota(quotaRes.data);
      } catch {
        if (isMounted) setDiagnostics((prev) => ({ ...prev, agentOnline: false }));
      }
    })();

    return () => { isMounted = false; };
  }, [isAuthenticated]);

  // ── React to TanStack Query job updates (replaces manual setInterval) ──────
  useEffect(() => {
    const job = jobQueryData?.data;
    if (!job) return;

    if (job.status === 'done') {
      dispatch({ type: 'DONE', result: job.result });
      setTab('report');
      setActiveJobId(null);
      refetchHistory();
    } else if (job.status === 'failed') {
      dispatch({ type: 'FAILED', error: job.error || 'Pipeline crashed' });
      setActiveJobId(null);
    } else if (job.status === 'running' || job.status === 'queued') {
      dispatch({
        type: 'POLL_UPDATE',
        payload: {
          progress: job.progress || 0,
          stage: job.stage || 'running',
          status: job.status,
          rewrittenQueries: job.result?.rewritten_queries || [],
        },
      });
    }
  }, [jobQueryData, refetchHistory]);

  // ── Start Research ────────────────────────────────────────────────────────
  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uiState.topic.trim()) return;

    if (isBlocked) {
      openTopUpModal(10, 'Daily free research limit reached. Please top up ৳10 BDT to continue research.');
      return;
    }
 
    dispatch({ type: 'START_RESEARCH' }); 
 
    try {
      const startRes = await ResearchService.startResearch({
        topic: uiState.topic,
        mode: researchMode,
      });
      if (startRes.success && startRes.data) {
        if (startRes.data.quota) setQuota(startRes.data.quota);
        dispatch({ type: 'SET_JOB_ID', jobId: startRes.data.job_id });
        setActiveJobId(startRes.data.job_id); // activates TanStack Query polling
        fetchWalletBalance();
      } else {
        throw new Error(startRes.message || 'Could not start research pipeline');
      }
    } catch (err: unknown) {
      const apiErr = err as Partial<ApiError>;
      if (apiErr.statusCode === 402) {
        openTopUpModal(10, apiErr.message || 'Daily free research limit reached. Top up ৳10 BDT to continue.');
      } else if (apiErr.statusCode === 429) {
        showQuotaToast(quota);
      }

      const message = err instanceof Error ? err.message : 'Failed to trigger the multi-agent orchestrator';
      dispatch({ type: 'FAILED', error: message });
    }
  };

  const handleReportSelection = () => {
    const browserSelection = window.getSelection();
    const text = browserSelection?.toString().trim() ?? '';
    const range = browserSelection?.rangeCount ? browserSelection.getRangeAt(0) : null;

    if (!text || !range || !reportRef.current?.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    setSelection({
      text,
      x: Math.min(Math.max(rect.left + rect.width / 2, 88), window.innerWidth - 88),
      y: Math.max(rect.top - 12, 54),
    });
  };

  const saveSelectedNote = async () => {
    if (!selection || isSavingNote) return;

    setIsSavingNote(true);
    try {
      await noteService.createNote({
        title: `Research excerpt — ${result?.topic || 'Untitled research'}`,
        content: selection.text,
        tags: ['research', 'saved-excerpt'],
      });
      window.getSelection()?.removeAllRanges();
      setSelection(null);
      showAppToast({ type: 'success', title: 'Note saved', message: 'The selected research excerpt is now in your Notes vault.' });
    } catch {
      showAppToast({ type: 'error', title: 'Could not save note', message: 'Please try again in a moment.' });
    } finally {
      setIsSavingNote(false);
    }
  };

  // ── Load History Job ──────────────────────────────────────────────────────
  // Completed history records already include their result. Do not refetch an
  // arbitrary job ID when opening one: the current account's history is the
  // source of truth for what the user may view.
  const handleLoadHistoryJob = (job: Job) => {
    dispatch({ type: 'RESET' });
    if (job.result) {
      dispatch({ type: 'DONE', result: job.result });
    } else {
      dispatch({ type: 'LOAD_HISTORY', job });
    }
    setTab('report');
  };

  useEffect(() => {
    if (!isAuthenticated || !queryJobId || isHistoryLoading) return;

    const historyJob = history.find((job) => job.job_id === queryJobId);
    if (historyJob) {
      handleLoadHistoryJob(historyJob);
    } else {
      dispatch({ type: 'FAILED', error: 'This research session is unavailable in your account history.' });
    }
  }, [isAuthenticated, isHistoryLoading, queryJobId, history]);
 
  // ── Destructure for cleaner JSX ───────────────────────────────────────────
  const { status, progress, stage, error, result, rewrittenQueries, plan } = jobState;
  const { topic, activeTab, sidebarOpen } = uiState;
  const { agentOnline, cacheStats } = diagnostics;

  const { balanceBDT, openTopUpModal, fetchWalletBalance } = useWalletStore();
  const isFreeQuotaExhausted = quota?.remaining === 0;
  const hasPaidBalance = balanceBDT >= 10;
  const isBlocked = isFreeQuotaExhausted && !hasPaidBalance;

  // Pre-inject verified URLs as clickable markdown links for [1], [^1], [Source 1], etc.
  const reportContent = useMemo(() => {
    if (!result?.report) return '';
    let text = result.report;
    const urls = result.verified_urls ?? [];
    urls.forEach((url, idx) => {
      if (!url) return;
      const num = idx + 1;
      // Match [Source 1], [Source: 1], [1], [^1] not already wrapped in markdown link
      text = text.replace(new RegExp(`\\[Source\\s*:?\\s*${num}\\](?!\\()`, 'gi'), `[Source ${num}](${url})`);
      text = text.replace(new RegExp(`\\[\\^?${num}\\](?!\\()`, 'g'), `[[${num}]](${url})`);
    });
    return text;
  }, [result]);

  const critiqueContent = useMemo(() => {
    if (!result?.critique) return '';
    let text = result.critique;
    const urls = result.verified_urls ?? [];
    urls.forEach((url, idx) => {
      if (!url) return;
      const num = idx + 1;
      text = text.replace(new RegExp(`\\[Source\\s*:?\\s*${num}\\](?!\\()`, 'gi'), `[Source ${num}](${url})`);
      text = text.replace(new RegExp(`\\[\\^?${num}\\](?!\\()`, 'g'), `[[${num}]](${url})`);
    });
    return text;
  }, [result]);
 
 if (!isAuthenticated) {
    return (
      <main className="min-h-screen relative flex items-center justify-center p-6" style={{
        backgroundColor: '#0a0a0c',
        backgroundImage: 'radial-gradient(at 50% 50%, #1c1830 0px, transparent 60%)',
        color: '#ffffff',
      }}>
        <Navbar />
        {/* Glow overlay */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center mb-6 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="font-metamorphous text-2xl text-white tracking-wider mb-4">ACCESS KEY REQUIRED</h2>
          <p className="font-roboto text-sm text-slate-400 leading-relaxed mb-6">
            Multi-Agent research pipeline accesses deep web parsing indexes and LLM consensus pools. Please authenticate your session to run orchestrations.
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
                document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
                useAuthStore.getState().clearAuth();
                window.location.href = '/login';
              }
            }}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold tracking-widest text-xs uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_12px_30px_rgba(16,185,129,0.25)] cursor-pointer"
          >
            Authenticate Session
          </button>
        </div>
      </main>
    );
  }
 
  return (
    <main
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundColor: '#070709',
        backgroundImage: 'radial-gradient(at 0% 0%, #111115 0px, transparent 50%), radial-gradient(at 50% 0%, #0c0d12 0px, transparent 50%), radial-gradient(at 100% 0%, #161224 0px, transparent 50%)',
        color: '#f8fafc',
      }}
    >
      <Navbar />

      {selection && (
        <button
          type="button"
          onClick={saveSelectedNote}
          disabled={isSavingNote}
          className="fixed z-[1100] -translate-x-1/2 -translate-y-full rounded-full border border-emerald-300/35 bg-slate-950/95 px-4 py-2 text-xs font-semibold text-emerald-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:scale-105 hover:bg-emerald-500 hover:text-slate-950 disabled:opacity-70"
          style={{ left: selection.x, top: selection.y }}
        >
          {isSavingNote ? 'Saving…' : 'Save note'}
        </button>
      )}
 
      {/* CSS Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
 
      {/* Top HUD diagnostics bar */}
      <div className="relative z-10 w-full bg-black/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4 mt-16 sm:mt-20">
        <div className="w-full mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4 font-mono text-[10px] tracking-[0.2em] font-bold text-slate-400">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${agentOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse' : agentOnline === false ? 'bg-rose-500' : 'bg-amber-500 animate-ping'}`} />
              <span className="text-slate-200 text-[9px] sm:text-[10px]">AI AGENT: {agentOnline ? 'ONLINE' : agentOnline === false ? 'OFFLINE' : 'CONNECTING...'}</span>
            </div>
            {cacheStats && (
              <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-6 text-slate-400">
                <span>KEYS CACHED: <span className="text-emerald-400 font-extrabold">{cacheStats.total_keys || 0}</span></span>
                <span className="text-white/10">|</span>
                <span>HIT RATIO: <span className="text-cyan-400 font-extrabold">{cacheStats.hit_rate || '100%'}</span></span>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all uppercase cursor-pointer text-[9px]"
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="hidden sm:inline">{sidebarOpen ? 'Collapse' : 'Browse'}</span> History
          </button>
        </div>
      </div>
 
      <div className="relative z-10 flex-grow w-full px-3 sm:px-6 md:px-8 py-5 sm:py-8 flex flex-col lg:flex-row gap-4 sm:gap-6">
 
        {/* SIDEBAR: History Records — shows 3 most recent */}
        {sidebarOpen && (
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3 bg-black/50 border border-white/5 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-audiowide text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">
                RECENT SESSIONS
              </h3>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[9px] text-slate-400">
                {historyCount} total
              </span>
            </div>

            {/* Records — only last 3 */}
            <div className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/10">
              {history.length === 0 ? (
                <div className="text-center py-8 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  No Saved Research
                </div>
              ) : (
                history.map((h, idx) => (
                  <button
                    key={h.job_id}
                    onClick={() => handleLoadHistoryJob(h)}
                    className="w-full text-left p-3.5 rounded-2xl border border-white/5 hover:border-emerald-500/40 bg-white/[0.02] hover:bg-emerald-500/[0.04] transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-5 h-5 rounded-full border border-white/10 text-[9px] font-bold font-mono flex items-center justify-center text-slate-500 group-hover:border-emerald-500/40 group-hover:text-emerald-400 shrink-0 transition-colors">
                        {idx + 1}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-roboto text-sm font-medium text-slate-200 group-hover:text-emerald-300 line-clamp-2 leading-snug transition-colors">
                          {h.result?.topic || h.job_id}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-mono text-[9px] text-slate-500">
                            {parseCreatedAt(h.created_at).toLocaleDateString()}
                          </span>
                          {h.result?.critique_score !== undefined && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[8px] border border-emerald-500/20">
                              {h.result.critique_score}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* View All link */}
            {historyCount > 3 && (
              <div className="border-t border-white/5 pt-3 mt-1">
                <a
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-slate-400 hover:text-white font-mono text-[9px] uppercase tracking-widest transition-all duration-200"
                >
                  View All {historyCount} Sessions
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            )}
          </aside>
        )}

 
        {/* MAIN PANEL */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0">
 
          {/* SEARCH BAR CARD */}
          <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/5 p-6 shadow-2xl">
            <form onSubmit={handleStartResearch} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  PROCEED MULTI-AGENT INQUIRY
                </span>

                {/* Fast Mode vs Deep Mode Selector */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500">Mode:</span>
                  <button
                    type="button"
                    onClick={() => setResearchMode('fast')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      researchMode === 'fast'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                        : 'bg-white/5 text-slate-400 border border-white/5 hover:text-slate-200'
                    }`}
                  >
                    <span>⚡</span>
                    <span>Fast Mode (~15s)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResearchMode('deep')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      researchMode === 'deep'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-500/20'
                        : 'bg-white/5 text-slate-400 border border-white/5 hover:text-slate-200'
                    }`}
                  >
                    <span>🔬</span>
                    <span>Deep Academic (Full)</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter research topic (e.g. quantum computing 2024)..."
                    disabled={status === 'running' || status === 'queued'}
                    className="w-full pl-6 pr-12 py-4 rounded-full border border-white/10 bg-white/5 text-white placeholder-slate-400 text-sm font-roboto focus:outline-none focus:border-emerald-500 focus:bg-black/30 transition-all shadow-inner"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={status === 'running' || status === 'queued' || !topic.trim() || isBlocked}
                  className={`px-8 py-4 rounded-full font-bold tracking-widest text-xs uppercase transition-all duration-300 cursor-pointer ${
                    isBlocked
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] active:scale-[0.98] text-white shadow-[0_12px_24px_rgba(16,185,129,0.2)] disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none'
                  }`}
                >
                  {status === 'running' || status === 'queued'
                    ? 'Processing...'
                    : isBlocked
                    ? 'Top Up ৳10'
                    : isFreeQuotaExhausted && hasPaidBalance
                    ? `Run ${researchMode === 'fast' ? '⚡ Fast' : '🔬 Deep'} (৳10)`
                    : `Run ${researchMode === 'fast' ? '⚡ Fast' : '🔬 Deep'} Research`}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                <span>
                  Free research quota: {quota ? `${quota.used}/${quota.limit} used` : 'Loading…'}
                </span>
                <span className="text-white/15">|</span>
                {isFreeQuotaExhausted ? (
                  hasPaidBalance ? (
                    <span className="text-emerald-400 font-semibold">
                      ৳{balanceBDT.toFixed(2)} BDT Balance Active (৳10/search)
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      Wallet low (৳{balanceBDT.toFixed(2)}) — Top up ৳10 to continue
                    </span>
                  )
                ) : (
                  <span className="text-emerald-300">
                    {quota?.remaining ?? 1} free run remaining
                  </span>
                )}
              </div>
            </form>
          </div>
 
          {/* ERROR ALERT */}
          {error && (
            <div className="p-4 bg-rose-950/30 border border-rose-500/20 rounded-2xl text-rose-300 text-sm font-roboto flex items-center gap-3 shadow-lg">
              <svg className="w-5 h-5 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
 
          {/* QUEUED LOADER */}
          {status === 'queued' && (
            <div className="flex flex-col items-center justify-center p-12 bg-black/45 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
              <div className="font-audiowide text-xs text-white uppercase tracking-widest animate-pulse">
                INITIALIZING MULTI-AGENT THREADS...
              </div>
            </div>
          )}
 
          {/* PIPELINE VIEWPORT */}
          {(status === 'running' || status === 'done' || result) && (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 sm:gap-6 flex-grow">
 
              {/* LEFT: Visualizer */}
              <div className="flex flex-col gap-6">
                <AgentVisualizer
                  currentStage={stage}
                  progress={progress}
                  status={status}
                  rewrittenQueries={rewrittenQueries}
                  outlinePlan={plan}
                />
 
                {status === 'running' && (
                  <div className="p-5 bg-black/45 border border-white/5 rounded-2xl flex flex-col gap-3 font-mono text-[9px] uppercase tracking-wider font-bold text-slate-300 shadow-inner">
                    <span>STAGE PROGRESS: {progress}%</span>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
 
              {/* RIGHT: Results Panel */}
              <div className="min-w-0 bg-black/30 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col shadow-2xl">
 
                {/* TABS */}
                <div className="flex border-b border-white/5 bg-black/20 px-6 py-2 overflow-x-auto gap-2">
                  {(
                    [
                      { id: 'report', label: 'Research Report' },
                      { id: 'critique', label: 'Quality Critique' },
                      { id: 'sources', label: 'Verified Sources' },
                      { id: 'queries', label: 'Expanded Queries' },
                    ] as { id: ActiveTab; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTab(tab.id)}
                      className={`px-4 py-3.5 font-mono text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all duration-300 shrink-0 cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-emerald-400 text-emerald-400 font-extrabold shadow-[0_4px_12px_rgba(16,185,129,0.05)]'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
 
                {/* TAB CONTENT */}
                <div className="min-w-0 p-6 md:p-8 overflow-visible flex-1 text-slate-200 scrollbar-thin">
                  {status === 'running' && !result ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-4" />
                      <span className="font-mono text-xs text-slate-400 uppercase tracking-widest animate-pulse">
                        Agent is writing grounded report. Standby...
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* REPORT */}
                      {activeTab === 'report' && result && (
                        <div className="animate-fadeIn space-y-8">
                          <div ref={reportRef} onMouseUp={handleReportSelection} className="prose prose-invert max-w-none text-slate-100 leading-relaxed text-base font-normal break-words">
                            <CustomMarkdown content={reportContent} />
                          </div>

                          {/* Referenced Sources Footnote Box */}
                          {result.verified_urls && result.verified_urls.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                                <span>📚</span>
                                <span>Referenced Literature & Citations ({result.verified_urls.length})</span>
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {result.verified_urls.map((url, idx) => (
                                  <a
                                    key={url || idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-xl border border-white/5 hover:border-emerald-500/40 bg-white/[0.02] hover:bg-emerald-500/[0.04] transition-all flex items-center justify-between gap-2 group text-xs"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="font-mono font-bold text-emerald-400 shrink-0">
                                        Source {idx + 1}
                                      </span>
                                      <span className="text-slate-300 group-hover:text-emerald-300 truncate font-medium">
                                        {url.replace(/https?:\/\/(www\.)?/, '')}
                                      </span>
                                    </div>
                                    <span className="text-slate-500 group-hover:text-emerald-400 shrink-0">↗</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
 
                      {/* CRITIQUE */}
                      {activeTab === 'critique' && result && (
                        <div className="grid md:grid-cols-[1fr_200px] gap-8 items-start animate-fadeIn">
                          <div className="flex flex-col gap-4 font-roboto text-base leading-relaxed text-slate-200 prose prose-invert max-w-none">
                            <h3 className="font-audiowide text-base font-extrabold text-white uppercase tracking-wider mb-2">
                              System Review Feedback:
                            </h3>
                            <CustomMarkdown content={critiqueContent} />
                          </div>
                          <div className="flex flex-col gap-4 shrink-0">
                            <ScoreMeter score={result.critique_score} type="critique" />
                            <ScoreMeter score={result.fact_check_score || 0.95} type="fact_check" />
                          </div>
                        </div>
                      )}
 
                      {/* SOURCES */}
                      {activeTab === 'sources' && result && (
                        <div className="flex flex-col gap-4 animate-fadeIn">
                          <h3 className="font-audiowide text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                            VERIFIED INDEX DOMAINS
                          </h3>
                          {result.verified_urls && result.verified_urls.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                              {result.verified_urls.map((url, idx) => (
                                <a
                                  key={url || `source-${idx}`}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-4 rounded-xl border border-white/5 hover:border-emerald-500/50 bg-white/[0.02] hover:bg-emerald-500/[0.03] transition-all duration-300 flex items-start justify-between gap-3 group"
                                >
                                  <div className="flex flex-col gap-1 overflow-hidden">
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-extrabold">Source {idx + 1}</span>
                                    <span className="font-roboto text-sm text-slate-200 font-medium truncate group-hover:text-white">
                                      {url.replace(/https?:\/\/(www\.)?/, '')}
                                    </span>
                                  </div>
                                  <span className="text-slate-500 shrink-0 group-hover:text-emerald-400 transition-colors pt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-10 font-mono text-xs text-slate-500 uppercase tracking-wider">
                              No primary sources indexed
                            </div>
                          )}
                        </div>
                      )}
 
                      {/* QUERIES */}
                      {activeTab === 'queries' && (
                        <div className="flex flex-col gap-4 animate-fadeIn">
                          <h3 className="font-audiowide text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                            QUERY MULTIPLEX DECOMPOSITION
                          </h3>
                          {rewrittenQueries.length > 0 ? (
                            <div className="flex flex-col gap-3 font-mono text-sm leading-relaxed text-slate-300">
                              {rewrittenQueries.map((q, idx) => (
                                <div key={`query-${idx}-${q.slice(0, 20)}`} className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20">
                                    {idx + 1}
                                  </span>
                                  <span>&quot;{q}&quot;</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-10 font-mono text-xs text-slate-500 uppercase tracking-wider">
                              Query expansion not executed yet
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
 
        </div>
      </div>
    </main>
  );
}
