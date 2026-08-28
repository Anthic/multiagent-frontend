import axios from 'axios';

const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || 'https://api-atlash.duckdns.org';

export interface IParaphraseResult {
  paraphrased_text: string;
  mode: string;
  provider_used: string;
  duration_sec: number;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface IGapFinderResult {
  topic: string;
  synthesis_matrix: Array<{
    theme: string;
    key_findings: string;
    limitations: string;
  }>;
  identified_gaps: string[];
  proposed_research_questions: string[];
  recommended_methodology: string;
}

export interface IPeerReviewResult {
  title: string;
  overall_score: number;
  decision: string;
  methodology_review: {
    reviewer: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    detailed_comments: string;
  };
  novelty_review: {
    reviewer: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    detailed_comments: string;
  };
  clarity_review: {
    reviewer: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    detailed_comments: string;
  };
  actionable_revisions: string[];
}

export interface ISlideDeckResult {
  title: string;
  marp_markdown: string;
  num_slides: number;
  duration_sec: number;
}

export const academicService = {
  // 4-Mode Paraphraser: academic, simplify, executive, humanize
  paraphrase: async (
    text: string,
    mode: 'academic' | 'simplify' | 'executive' | 'humanize' = 'academic',
    userId?: string,
  ): Promise<IParaphraseResult> => {
    const response = await axios.post<IParaphraseResult>(`${AGENT_API_URL}/api/v1/paraphrase`, {
      text,
      mode,
      user_id: userId,
    });
    return response.data;
  },

  // Literature Gap Finder & Synthesis Matrix
  findGaps: async (
    topic: string,
    literatureContext?: string,
    userId?: string,
  ): Promise<IGapFinderResult> => {
    const response = await axios.post<IGapFinderResult>(`${AGENT_API_URL}/api/v1/academic/gap-finder`, {
      topic,
      literature_context: literatureContext,
      user_id: userId,
    });
    return response.data;
  },

  // 3-Agent Simulated Peer Review Panel
  peerReview: async (
    title: string,
    content: string,
    userId?: string,
  ): Promise<IPeerReviewResult> => {
    const response = await axios.post<IPeerReviewResult>(`${AGENT_API_URL}/api/v1/academic/peer-review`, {
      title,
      content,
      user_id: userId,
    });
    return response.data;
  },

  // One-Click Marp Academic Slide Deck Generator
  generateSlides: async (
    title: string,
    content?: string,
    numSlides: number = 8,
    userId?: string,
  ): Promise<ISlideDeckResult> => {
    const response = await axios.post<ISlideDeckResult>(`${AGENT_API_URL}/api/v1/academic/generate-slides`, {
      title,
      content,
      num_slides: numSlides,
      user_id: userId,
    });
    return response.data;
  },

  // Draft section using personal notes vault RAG
  draftSectionFromVault: async (
    userId: string,
    sectionTopic: string,
    instructions?: string,
  ): Promise<{ section_topic: string; drafted_content: string; notes_used_count: number }> => {
    const response = await axios.post(`${AGENT_API_URL}/api/v1/vault/draft-section`, {
      user_id: userId,
      section_topic: sectionTopic,
      instructions: instructions || 'Draft a comprehensive academic section.',
    });
    return response.data;
  },
};
