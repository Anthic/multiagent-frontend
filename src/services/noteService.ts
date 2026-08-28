import { api } from '../lib/api';

export interface INote {
  id?: string;
  _id?: string;
  userId: string;
  title: string;
  content: string;
  tags?: string[];
  sourceUrl?: string;
  isVectorSynced?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const noteService = {
  createNote: async (payload: { title: string; content: string; tags?: string[]; sourceUrl?: string }): Promise<INote> => {
    const response = await api.post<INote>('/notes', payload);
    return (response?.data || {}) as INote;
  },

  getAllNotes: async (tag?: string): Promise<INote[]> => {
    const params = tag ? { tag } : {};
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

  updateNote: async (id: string, payload: Partial<INote>): Promise<INote> => {
    const response = await api.patch<INote>(`/notes/${id}`, payload);
    return (response?.data || {}) as INote;
  },

  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};
