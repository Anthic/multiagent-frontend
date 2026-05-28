import { ResearchResult, Job } from '@/src/types/research'; 

// ─── Status ───────────────────────────────────────────────
export type ResearchStatus = 'idle' | 'queued' | 'running' | 'done' | 'failed';
export type ActiveTab = 'report' | 'critique' | 'sources' | 'queries';

// ─── Job State  ───────────────
export interface JobState {
  activeJobId: string | null;
  status: ResearchStatus;
  progress: number;
  stage: string;
  error: string | null;
  result: ResearchResult | null;
  rewrittenQueries: string[];
  plan: string;
}

// ─── Actions ──────────────────────────────────────────────
export type JobAction =
  | { type: 'START_RESEARCH' }
  | { type: 'SET_JOB_ID'; jobId: string }
  | { type: 'POLL_UPDATE'; payload: Pick<JobState, 'progress' | 'stage' | 'status' | 'rewrittenQueries'> }
  | { type: 'DONE'; result: ResearchResult | null}
  | { type: 'FAILED'; error: string }
  | { type: 'LOAD_HISTORY'; job: Job }
  | { type: 'RESET' };

// ─── UI State ────
export interface UIState {
  topic: string;
  activeTab: ActiveTab;
  sidebarOpen: boolean;
}

// ─── Diagnostics State ────────────────────────────────────
export interface DiagnosticsState {
  agentOnline: boolean | null;
  cacheStats: { total_keys?: number; hit_rate?: string } | null;
}

// ─── History State ────────────────────────────────────────
export interface HistoryState {
  records: Job[];
  count: number;
}