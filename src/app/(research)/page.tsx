"use client";
import { Navbar } from "@/src/components/Navbar"
import { AgentVisualizer } from "@/src/components/research/AgentVisualizer"
import { CustomMarkdown } from "@/src/components/research/CustomMarkdown"
import { ScoreMeter } from "@/src/components/research/ScoreMeter"
import { api } from "@/src/lib/api"
import { initalJobState, jobReducer } from "@/src/reducer/jobReducer"
import { ResearchService } from "@/src/services/researchService"
import { useIsAuthenticated } from "@/src/store/authStore"
import { ActiveTab, DiagnosticsState, HistoryState, JobState, UIState } from "@/src/types/researchState"
import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { useSearchParams } from 'next/navigation';


export default function ResearchPage() {

    const isAuthenticated = useIsAuthenticated()
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

    //diagonostic state management
    const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
        agentOnline : null,
        cacheStats : null
    })

    //history
      const [historyState, setHistoryState] = useState<HistoryState>({
    records: [],
    count: 0,
  });
 
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // ── Helpers ───────────────────────────────────────────────────────────────
  const setTab = (tab: ActiveTab) =>
    setUiState((prev) => ({ ...prev, activeTab: tab }));
 
  const toggleSidebar = () =>
    setUiState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
 
  const setTopic = (topic: string) =>
    setUiState((prev) => ({ ...prev, topic }));
 
  const fetchHistory = useCallback(async () => {
    try {
      const res = await ResearchService.getHistory(10);
      if (res.success && res.data) {
        setHistoryState({
          records: res.data.records || [],
          count: res.data.count || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load history', err);
    }
  }, []);
 
  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const healthRes = await api.get<{ status: string }>('/research/health');
        if (!isMounted) return;

        setDiagnostics((prev) => ({ ...prev, agentOnline: healthRes.success }));
      } catch {
        if (!isMounted) return;

        setDiagnostics((prev) => ({ ...prev, agentOnline: false }));
      }

      try {
        const cacheRes = await api.get<{
          total_keys?: number;
          hit_rate?: string;
        }>('/research/cache-stats');

        if (!isMounted) return;

        if (cacheRes.success && cacheRes.data) {
          setDiagnostics((prev) => ({ ...prev, cacheStats: cacheRes.data }));
        }
      } catch {
        if (!isMounted) return;
      }
    })();

    if (isAuthenticated) {
      void (async () => {
        try {
          const res = await ResearchService.getHistory(10);
          if (!isMounted) return;

          if (res.success && res.data) {
            setHistoryState({
              records: res.data.records || [],
              count: res.data.count || 0,
            });
          }
        } catch (err: unknown) {
          if (!isMounted) return;

          console.error('Failed to load history', err);
        }
      })();
    }

    return () => {
      isMounted = false;

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isAuthenticated]);
 
  // ── Polling ───────────────────────────────────────────────────────────────
  const startPolling = useCallback(
    (jobId: string) => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
 
      pollIntervalRef.current = setInterval(async () => {
        try {
          const pollRes = await ResearchService.getJobStatus(jobId);
          if (!pollRes.success || !pollRes.data) return;
 
          const job = pollRes.data;
 
          if (job.status === 'done') {
            clearInterval(pollIntervalRef.current!);
            dispatch({ type: 'DONE', result: job.result });
            setTab('report');
            fetchHistory();
          } else if (job.status === 'failed') {
            clearInterval(pollIntervalRef.current!);
            dispatch({ type: 'FAILED', error: job.error || 'Pipeline crashed' });
          } else {
            const payload: Pick<JobState, 'progress' | 'stage' | 'status' | 'rewrittenQueries'> = {
              progress: job.progress || 0,
              stage: job.stage || 'running',
              status: job.status,
              rewrittenQueries: job.result?.rewritten_queries || [],
            };
 
            dispatch({
              type: 'POLL_UPDATE',
              payload,
            });
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 5000);
    },
    [fetchHistory]
  );

 
  // ── Start Research ────────────────────────────────────────────────────────
  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uiState.topic.trim()) return;
 
    dispatch({ type: 'START_RESEARCH' }); 
 
    try {
      const startRes = await ResearchService.startResearch({ topic: uiState.topic });
      if (startRes.success && startRes.data) {
        dispatch({ type: 'SET_JOB_ID', jobId: startRes.data.job_id });
        startPolling(startRes.data.job_id);
      } else {
        throw new Error(startRes.message || 'Could not start research pipeline');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to trigger the multi-agent orchestrator';

      dispatch({ type: 'FAILED', error: message });
    }
  };
 
  // ── Load History Job ──────────────────────────────────────────────────────
  // NOTE: We use getJobStatus (GET /job/{jobId}) instead of getHistoryById
  // because the Python /history/{id} endpoint expects a numeric DB id,
  // but we only have the job_id (uuid string). The /job/{jobId} endpoint
  // is already working correctly and returns the full job with result.
  const handleLoadHistoryJob = async (jobId: string) => {
    dispatch({ type: 'RESET' });
 
    try {
      const res = await ResearchService.getJobStatus(jobId);
      if (res.success && res.data) {
        // Treat the job result as a loaded history session
        const job = res.data;
        if (job.result) {
          dispatch({ type: 'DONE', result: job.result });
        } else {
          dispatch({ type: 'LOAD_HISTORY', job });
        }
        setTab('report');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not load historical research session';

      dispatch({ type: 'FAILED', error: message });
    }
  };

  useEffect(() => {
    if (isAuthenticated && queryJobId) {
      let isMounted = true;

      void (async () => {
        dispatch({ type: 'RESET' });

        try {
          const res = await ResearchService.getJobStatus(queryJobId);
          if (!isMounted) return;

          if (res.success && res.data) {
            const job = res.data;

            if (job.result) {
              dispatch({ type: 'DONE', result: job.result });
            } else {
              dispatch({ type: 'LOAD_HISTORY', job });
            }

            setTab('report');
          }
        } catch (err: unknown) {
          if (!isMounted) return;

          const message = err instanceof Error ? err.message : 'Could not load historical research session';

          dispatch({ type: 'FAILED', error: message });
        }
      })();

      return () => {
        isMounted = false;
      };
    }
  }, [isAuthenticated, queryJobId]);
 
  // ── Destructure for cleaner JSX ───────────────────────────────────────────
  const { status, progress, stage, error, result, rewrittenQueries, plan } = jobState;
  const { topic, activeTab, sidebarOpen } = uiState;
  const { agentOnline, cacheStats } = diagnostics;
  const { records: history, count: historyCount } = historyState;
 
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
          <a
            href="/login"
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold tracking-widest text-xs uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_12px_30px_rgba(16,185,129,0.25)]"
          >
            Authenticate Session
          </a>
        </div>
      </main>
    );
  }
 
  return (
    <main
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        backgroundColor: '#070709',
        backgroundImage: 'radial-gradient(at 0% 0%, #111115 0px, transparent 50%), radial-gradient(at 50% 0%, #0c0d12 0px, transparent 50%), radial-gradient(at 100% 0%, #161224 0px, transparent 50%)',
        color: '#f8fafc',
      }}
    >
      <Navbar />
 
      {/* CSS Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
 
      {/* Top HUD diagnostics bar */}
      <div className="relative z-10 w-full bg-black/40 backdrop-blur-md border-b border-white/5 px-6 py-4 mt-20">
        <div className="w-full mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-[0.2em] font-bold text-slate-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${agentOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse' : agentOnline === false ? 'bg-rose-500' : 'bg-amber-500 animate-ping'}`} />
              <span className="text-slate-200">AI AGENT STATE: {agentOnline ? 'ONLINE (ACTIVE)' : agentOnline === false ? 'OFFLINE (STANDBY)' : 'CONNECTING...'}</span>
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
            {sidebarOpen ? 'Collapse History' : 'Browse History'}
          </button>
        </div>
      </div>
 
      <div className="relative z-10 flex-grow w-full px-6 md:px-8 py-8 flex flex-col lg:flex-row gap-6">
 
        {/* SIDEBAR: History Records — shows 3 most recent */}
        {sidebarOpen && (
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3 bg-black/50 border border-white/5 rounded-3xl p-5 backdrop-blur-xl shadow-2xl overflow-hidden">
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
            <div className="flex flex-col gap-2">
              {history.length === 0 ? (
                <div className="text-center py-8 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  No Saved Research
                </div>
              ) : (
                history.slice(0, 3).map((h, idx) => (
                  <button
                    key={h.job_id}
                    onClick={() => handleLoadHistoryJob(h.job_id)}
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
                            {new Date(h.created_at * 1000).toLocaleDateString()}
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
                  href="/dashboard/history"
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
        <div className="flex-1 flex flex-col gap-6 pr-1 h-full">
 
          {/* SEARCH BAR CARD */}
          <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/5 p-6 shadow-2xl">
            <form onSubmit={handleStartResearch} className="flex flex-col gap-4">
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                PROCEED MULTI-AGENT INQUIRY
              </span>
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
                  disabled={status === 'running' || status === 'queued' || !topic.trim()}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-[1.02] active:scale-[0.98] text-white font-bold tracking-widest text-xs uppercase shadow-[0_12px_24px_rgba(16,185,129,0.2)] transition-all duration-300 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none cursor-pointer"
                >
                  {status === 'running' || status === 'queued' ? 'Processing...' : 'Run Research'}
                </button>
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
            <div className="grid lg:grid-cols-[380px_1fr] gap-6 flex-grow">
 
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
              <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
 
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
 
                {/* TAB CONTENT (Super crisp white/slate text for perfect readability) */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 text-slate-200 scrollbar-thin">
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
                        <div className="animate-fadeIn prose prose-invert max-w-none text-slate-100 leading-relaxed text-base font-normal">
                          <CustomMarkdown 
                            content={(() => {
                              let reportText = result.report;
                              if (result.verified_urls && result.verified_urls.length > 0) {
                                result.verified_urls.forEach((url, index) => {
                                  if (url) {
                                    const sourceNum = index + 1;
                                    const regex = new RegExp(`\\[Source ${sourceNum}\\]`, 'g');
                                    reportText = reportText.replace(regex, `[Source ${sourceNum}](${url})`);
                                  }
                                });
                              }
                              return reportText;
                            })()} 
                          />
                        </div>
                      )}
 
                      {/* CRITIQUE */}
                      {activeTab === 'critique' && result && (
                        <div className="grid md:grid-cols-[1fr_200px] gap-8 items-start animate-fadeIn">
                          <div className="flex flex-col gap-4 font-roboto text-base leading-relaxed text-slate-200 prose prose-invert max-w-none">
                            <h3 className="font-audiowide text-base font-extrabold text-white uppercase tracking-wider mb-2">
                              System Review Feedback:
                            </h3>
                            <CustomMarkdown 
                              content={(() => {
                                let critiqueText = result.critique;
                                if (result.verified_urls && result.verified_urls.length > 0) {
                                  result.verified_urls.forEach((url, index) => {
                                    if (url) {
                                      const sourceNum = index + 1;
                                      const regex = new RegExp(`\\[Source ${sourceNum}\\]`, 'g');
                                      critiqueText = critiqueText.replace(regex, `[Source ${sourceNum}](${url})`);
                                    }
                                  });
                                }
                                return critiqueText;
                              })()} 
                            />
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
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-extrabold">SOURCE [{idx + 1}]</span>
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
