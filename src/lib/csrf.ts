'use client';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const apiPrefix = '/api/v1';

const normalizeApiBaseUrl = (baseUrl: string): string => {
  const trimmed = baseUrl.replace(/\/$/, '');
  return trimmed.endsWith(apiPrefix) ? trimmed : `${trimmed}${apiPrefix}`;
};

const csrfEndpoint = apiBaseUrl ? `${normalizeApiBaseUrl(apiBaseUrl)}/csrf-token` : '';

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string | null> | null = null;

type CsrfResponse = {
  data?: {
    csrfToken?: string;
  };
};

export function getCachedCsrfToken() {
  return csrfToken;
}

export async function bootstrapCsrfToken() {
  if (!apiBaseUrl) return;

  if (csrfTokenPromise) {
    await csrfTokenPromise;
    return;
  }

  csrfTokenPromise = fetch(csrfEndpoint, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })
    .then(async (response) => {
      if (!response.ok) return null;

      const payload = (await response.json()) as CsrfResponse;
      csrfToken = payload.data?.csrfToken ?? null;
      return csrfToken;
    })
    .catch(() => null)
    .finally(() => {
      csrfTokenPromise = null;
    });

  await csrfTokenPromise;
}

export async function ensureCsrfToken() {
  if (csrfToken) return csrfToken;

  await bootstrapCsrfToken();
  return csrfToken;
}
