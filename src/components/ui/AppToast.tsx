'use client';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastPayload = {
  type: ToastType;
  title: string;
  message: string;
};

const TOAST_EVENT = 'app-toast';
const QUEUED_TOAST_KEY = 'app-queued-toast';

const typeStyles: Record<ToastType, string> = {
  success: 'border-[#AAFFC7]/40 bg-[#AAFFC7]/12 text-[#AAFFC7]',
  error: 'border-red-400/40 bg-red-500/12 text-red-200',
  info: 'border-sky-300/40 bg-sky-500/12 text-sky-100',
};

export function showAppToast(payload: ToastPayload) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

export function queueAppToast(payload: ToastPayload) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(QUEUED_TOAST_KEY, JSON.stringify(payload));
}

export function AppToast() {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  useEffect(() => {
    const showToast = (payload: ToastPayload) => {
      setToast(payload);

      window.setTimeout(() => {
        setToast(null);
      }, 4200);
    };

    const queuedToast = sessionStorage.getItem(QUEUED_TOAST_KEY);

    if (queuedToast) {
      sessionStorage.removeItem(QUEUED_TOAST_KEY);

      try {
        showToast(JSON.parse(queuedToast) as ToastPayload);
      } catch {
        sessionStorage.removeItem(QUEUED_TOAST_KEY);
      }
    }

    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastPayload>;
      showToast(customEvent.detail);
    };

    window.addEventListener(TOAST_EVENT, handleToast);

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed right-5 top-5 z-[2000] w-[min(calc(100vw-2.5rem),380px)]">
      <div
        className={`overflow-hidden rounded-xl border shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl ${typeStyles[toast.type]}`}
      >
        <div className="border-b border-white/10 bg-[#0f0f1a]/92 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-current shadow-[0_0_18px_currentColor]" />
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">
                {toast.title}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-300">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-white/10">
          <div className="h-full w-full animate-[toastProgress_4.2s_linear_forwards] bg-current" />
        </div>
      </div>
      <style jsx>{`
        @keyframes toastProgress {
          from {
            transform: scaleX(1);
            transform-origin: left;
          }
          to {
            transform: scaleX(0);
            transform-origin: left;
          }
        }
      `}</style>
    </div>
  );
}
