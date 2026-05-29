'use client';

export type ToastType = 'success' | 'error' | 'info';

export type ToastPayload = {
  type: ToastType;
  title: string;
  message: string;
};

export const TOAST_EVENT = 'app-toast';
export const QUEUED_TOAST_KEY = 'app-queued-toast';

export function showAppToast(payload: ToastPayload) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail: payload }));
}

export function queueAppToast(payload: ToastPayload) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(QUEUED_TOAST_KEY, JSON.stringify(payload));
}
