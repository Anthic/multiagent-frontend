import { api } from '../lib/api';

export interface INote {
  id?: string;
  _id?: string;
  userId?: string;
  title: string;
  content: string;
  tags?: string[];
  sourceUrl?: string;
  audioUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface INoteFilterParams {
  tag?: string;
  search?: string;
}

export interface ICreateNotePayload {
  title: string;
  content: string;
  tags?: string[];
  sourceUrl?: string;
  audioUrl?: string;
}

export interface IUpdateNotePayload {
  title?: string;
  content?: string;
  tags?: string[];
  sourceUrl?: string;
  audioUrl?: string;
}

export const noteService = {
  createNote: async (payload: ICreateNotePayload): Promise<INote> => {
    const response = await api.post<INote>('/notes', payload);
    return (response?.data || {}) as INote;
  },

  getAllNotes: async (query?: INoteFilterParams | string): Promise<INote[]> => {
    const params: Record<string, string> = {};
    if (typeof query === 'string') {
      if (query.trim()) params.tag = query.trim();
    } else if (query) {
      if (query.tag?.trim()) params.tag = query.tag.trim();
      if (query.search?.trim()) params.search = query.search.trim();
    }
    const response = await api.get<INote[]>('/notes', params);
    return (response?.data || []) as INote[];
  },

  getAllTags: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/notes/tags');
    return (response?.data || []) as string[];
  },

  getSingleNote: async (id: string): Promise<INote> => {
    const response = await api.get<INote>(`/notes/${id}`);
    return (response?.data || {}) as INote;
  },

  updateNote: async (id: string, payload: IUpdateNotePayload): Promise<INote> => {
    const response = await api.patch<INote>(`/notes/${id}`, payload);
    return (response?.data || {}) as INote;
  },

  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};

