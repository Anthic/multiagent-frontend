import { api } from '../lib/api';

export interface ICitation {
  citationKey: string;
  title: string;
  url: string;
  doi?: string;
  authors?: string[];
  year?: string;
}

export interface IPeerReviewResult {
  overallScore: number;
  methodologyFeedback: string;
  domainFeedback: string;
  clarityFeedback: string;
}

export interface IPaper {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  contentMarkdown: string;
  abstract?: string;
  citations: ICitation[];
  peerReviewResults?: IPeerReviewResult;
  attachedNotes?: string[];
  status: 'draft' | 'in_review' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export const paperService = {
  createPaper: async (payload: {
    title: string;
    contentMarkdown?: string;
    abstract?: string;
    citations?: ICitation[];
    attachedNotes?: string[];
    status?: 'draft' | 'in_review' | 'published' | 'archived';
  }): Promise<IPaper> => {
    const response = await api.post<IPaper>('/papers', payload);
    return (response?.data || {}) as IPaper;
  },

  getAllPapers: async (): Promise<IPaper[]> => {
    const response = await api.get<IPaper[]>('/papers');
    return (response?.data || []) as IPaper[];
  },

  getSinglePaper: async (id: string): Promise<IPaper> => {
    const response = await api.get<IPaper>(`/papers/${id}`);
    return (response?.data || {}) as IPaper;
  },

  updatePaper: async (id: string, payload: Partial<IPaper>): Promise<IPaper> => {
    const response = await api.patch<IPaper>(`/papers/${id}`, payload);
    return (response?.data || {}) as IPaper;
  },

  deletePaper: async (id: string): Promise<void> => {
    await api.delete(`/papers/${id}`);
  },

  addCitation: async (paperId: string, citation: ICitation): Promise<IPaper> => {
    const response = await api.post<IPaper>(`/papers/${paperId}/citations`, citation);
    return (response?.data || {}) as IPaper;
  },
};
