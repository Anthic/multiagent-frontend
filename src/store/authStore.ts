import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser } from '../types/auth';


interface AuthState {
  user: AuthUser | null;
  isInitialized: boolean;

  isAuthenticated: boolean;
  isLoading: boolean;


  setUser: (user: AuthUser) => void;
  setInitialized: (isInitialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({

      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

    
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: (isInitialized) => set({ isInitialized }),


      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useIsLoading = () => useAuthStore((s) => s.isLoading);
export const useIsInitialized = () => useAuthStore((s) => s.isInitialized);