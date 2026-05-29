'use client';

import { useEffect, useState } from 'react';
import {
  QUEUED_TOAST_KEY,
  TOAST_EVENT,
  ToastPayload,
  ToastType,
} from './appToastEvents';

const typeStyles: Record<ToastType, string> = {
  success: 'border-[#AAFFC7]/40 bg-[#AAFFC7]/12 text-[#AAFFC7]',
  error: 'border-red-400/40 bg-red-500/12 text-red-200',
  info: 'border-sky-300/40 bg-sky-500/12 text-sky-100',
};

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
            <span className="mt-1 size-2.5 rounded-full bg-current shadow-[0_0_18px_currentColor]" />
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
    </div>
  );
}
