

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface ResearchResult {
  topic: string;
  report: string;
  critique: string;
  critique_score: number;
  fact_check_score: number;
  rewritten_queries: string[];
  verified_urls: string[];
  time_sec: number;
}

export interface Job {
  job_id: string;
  status: JobStatus;
  progress: number;
  stage: string;
  result: ResearchResult | null;
  error: string | null;
  created_at: number;
}

export interface StartResearchPayload {
  topic: string;
}

export interface StartResearchResponse {
  job_id: string; 
  message?: string;
}

export interface PaginatedJobs {
  records: Job[];
  count: number;
}
