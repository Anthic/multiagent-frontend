import { api } from '../lib/api';

export type ParaphraseMode = 'academic' | 'simplify' | 'executive' | 'humanize';

export interface IParaphraseResult {
  paraphrased_text: string;
  mode: ParaphraseMode;
  provider_used: string;
  duration_sec: number;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  costBDT?: number;
  wallet?: {
    previousBalance: number;
    deducted: number;
    newBalance: number;
  };
  auditLogId?: string;
}

export interface ICostEstimate {
  charCount: number;
  estimatedTokens: number;
  estimatedCostBDT: number;
  model: string;
}

export const paraphraseService = {
  paraphrase: async (payload: { text: string; mode: ParaphraseMode }): Promise<IParaphraseResult> => {
    const response = await api.post<IParaphraseResult>('/paraphrase', payload);
    return (response?.data || {}) as IParaphraseResult;
  },

  estimateCost: async (text: string): Promise<ICostEstimate> => {
    const response = await api.post<ICostEstimate>('/paraphrase/estimate', { text });
    return (response?.data || {}) as ICostEstimate;
  },
};
