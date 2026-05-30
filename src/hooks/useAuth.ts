'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { LoginPayload, RegisterPayload } from '../types/auth';
import { ApiError } from '../types/api';


export const authQueryKeys = {
  me: ['auth', 'me'] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// useCurrentUser
// Only fires GET /auth/me when the user is already authenticated (persisted in
// localStorage). On fresh visits (login / register pages) isAuthenticated is
// false, so the query is disabled and the page renders immediately.
// ─────────────────────────────────────────────────────────────────────────────
export function useCurrentUser() {
  const { setUser, setInitialized, clearAuth } = useAuthStore.getState();

  // Read the PERSISTED value — this is hydrated from localStorage synchronously
  // by Zustand before the first render, so it is safe to use as `enabled`.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Enable the query if either Zustand says authenticated OR we have an accessToken cookie
  const hasCookie = typeof window !== 'undefined' && document.cookie.split(';').some((c) => c.trim().startsWith('accessToken='));
  const shouldFetch = isAuthenticated || hasCookie;

  // When the user is NOT authenticated we skip the API call entirely and mark
  // the store as initialized right away so AuthProvider never shows a spinner.
  useEffect(() => {
    if (!shouldFetch) {
      setInitialized(true);
    }
  }, [shouldFetch, setInitialized]);

  return useQuery({
    queryKey: authQueryKeys.me,

    queryFn: async () => {
      try {
        const res = await AuthService.getMe();
        if (res.data?.user) {
          setUser(res.data.user);
        }
        return res.data?.user ?? null;
      } catch (err) {
        setInitialized(true);
        clearAuth();
        if (typeof window !== 'undefined') {
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
        }
        return null;
      }
    },

    enabled: shouldFetch,

    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// useLogin
// ─────────────────────────────────────────────────────────────────────────────
export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser, setLoading } = useAuthStore.getState();

  return useMutation({
    mutationFn: (payload: LoginPayload) => AuthService.login(payload),

    onMutate: () => setLoading(true),

    onSuccess: (res) => {
      const user = res.data?.user;
      const token = res.data?.accessToken;
      const refreshToken = res.data?.refreshToken;
      if (user) {
        setUser(user);
        queryClient.setQueryData(authQueryKeys.me, user);
      }

      if (token && typeof window !== 'undefined') {
        document.cookie = `accessToken=${token}; path=/; max-age=${15 * 60}; SameSite=Lax; Secure`;
      }

      if (refreshToken && typeof window !== 'undefined') {
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
      }

      // Read the callbackUrl that middleware injected (e.g. /research, /dashboard)
      // Use window.location.href for a hard redirect so that the middleware
      // re-evaluates the auth cookie on the destination page.
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get('callbackUrl');
      const destination = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/';
      window.location.href = destination;
    },

    onError: (error: ApiError) => {
      console.error('Login failed:', error.message);
    },

    onSettled: () => setLoading(false),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// useRegister
// ─────────────────────────────────────────────────────────────────────────────
export function useRegister() {
  const queryClient = useQueryClient();
  const { setUser, setLoading } = useAuthStore.getState();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => AuthService.register(payload),

    onMutate: () => setLoading(true),

    onSuccess: () => {
      // Clean redirect to login page after successful registration
      if (typeof window !== 'undefined') {
        window.location.href = '/login?registered=true';
      }
    },

    onError: (error: ApiError) => {
      console.error('Register failed:', error.message);
    },

    onSettled: () => setLoading(false),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// useLogout
// ─────────────────────────────────────────────────────────────────────────────
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore.getState();

  return useCallback(async () => {
    try {
      await AuthService.logout();
    } catch {
      // Swallow — we still clear local state
    } finally {
      clearAuth();
      queryClient.clear();
      if (typeof window !== 'undefined') {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
      }
      router.push('/login');
      router.refresh();
    }
  }, [router, queryClient, clearAuth]);
}
