'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // ─── Step 1: wait for client-side hydration ───────────────────────────────
  // Zustand persist reads from localStorage which doesn't exist on the server.
  // Rendering children before `mounted` prevents hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { isLoading, isFetched } = useCurrentUser();
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // ─── Route Guarding ────────────────────────────────────────────────────────
  useEffect(() => {
    if (mounted) {
      const protectedRoutes = ['/dashboard', '/research'];
      const isProtected = protectedRoutes.some(route => pathname?.startsWith(route));

      if (isProtected && !isAuthenticated) {
        router.push('/login');
      }
    }
  }, [pathname, isAuthenticated, router, mounted]);

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
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, #f5f0e8 0%, #ede8d8 100%)',
        }}
      >
        <div className="relative flex flex-col items-center gap-6 p-10 rounded-[32px] border border-black/5 bg-white/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          {/* Stunning glowing double rings */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-emerald-800/10 border-t-emerald-800"
              style={{
                animation: 'spinClockwise 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
              }}
            />
            {/* Inner ring */}
            <div
              className="absolute w-10 h-10 rounded-full border-2 border-purple-800/10 border-t-purple-800"
              style={{
                animation: 'spinCounterClockwise 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
              }}
            />
            {/* Center glow dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-800 animate-ping" />
          </div>

          {/* Typography details */}
          <div className="text-center space-y-1">
            <h3
              className="font-metamorphous text-lg font-bold tracking-widest text-[#11100d] uppercase"
              style={{ letterSpacing: '0.25em' }}
            >
              atlash.ai
            </h3>
            <p
              className="font-mono text-[9px] uppercase tracking-wider text-black/45 animate-pulse"
              style={{ letterSpacing: '0.15em' }}
            >
              Securing Session...
            </p>
          </div>

          {/* Injected premium CSS animation rules */}
          <style>{`
            @keyframes spinClockwise {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes spinCounterClockwise {
              0% { transform: rotate(360deg); }
              100% { transform: rotate(0deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}