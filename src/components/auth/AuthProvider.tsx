'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ─── Step 1: wait for client-side hydration ───────────────────────────────
  // Zustand persist reads from localStorage which doesn't exist on the server.
  // Rendering children before `mounted` prevents hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { isLoading, isFetched } = useCurrentUser();
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // ─── Step 2: show a spinner only while an active session is being validated ─
  // `isFetched` becomes true on both success AND error, so the spinner always
  // clears once the /auth/me request settles (or is skipped when not logged in).
  const ready = isFetched || isInitialized;

  // Show nothing (no HTML) until the client has hydrated — avoids mismatch
  if (!mounted) return null;

  // Show spinner only if we're authenticated and still validating the session
  if (!ready && isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0f1a',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '3px solid #6366f1',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}