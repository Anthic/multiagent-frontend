import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser } from '../types/auth';


interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;


  setUser: (user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

    
      setAccessToken: (accessToken) =>
        set({ accessToken }),

    
      setTokens: (accessToken: string, _refreshToken: string) =>
        set({ accessToken }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
       
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),

     
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ✅ Selector hooks — re-render minimize করতে
export const useUser = () => authStore((s) => s.user);
export const useIsAuthenticated = () => authStore((s) => s.isAuthenticated);
export const useAccessToken = () => authStore((s) => s.accessToken);