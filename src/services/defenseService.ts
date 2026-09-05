import { api } from '../lib/api';

export interface IDefenseQuestion {
  examiner_id: string;
  examiner_name: string;
  examiner_title: string;
  avatar_badge: string;
  targeted_section: string;
  question: string;
  what_examiner_looks_for: string;
}

export interface IDefenseVerdict {
  score: number;
  verdict: string;
  examiner_reaction: string;
  strengths: string[];
  weaknesses: string[];
  closing_advice: string;
}

export const defenseService = {
  getQuestions: async (paperId: string): Promise<{ title: string; questions: IDefenseQuestion[] }> => {
    const response = await api.post<{ title: string; questions: IDefenseQuestion[] }>(
      `/papers/${paperId}/defense/questions`,
    );
    return (response?.data || { title: '', questions: [] }) as { title: string; questions: IDefenseQuestion[] };
  },
  evaluateRebuttal: async (
    paperId: string,
    payload: {
      examiner_name: string;
      examiner_title: string;
      question: string;
      student_answer: string;
    },
  ): Promise<IDefenseVerdict> => {
    const response = await api.post<IDefenseVerdict>(
      `/papers/${paperId}/defense/evaluate`,
      payload,
    );
    return (response?.data || {}) as IDefenseVerdict;
  },
};
