'use client';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export async function bootstrapCsrfToken() {
  if (!apiBaseUrl) return;

  const backendOrigin = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

  try {
    await fetch(backendOrigin || apiBaseUrl, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    // CSRF bootstrap should never block the auth UI.
  }
}
