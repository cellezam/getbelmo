import axios from 'axios';
import { getClient } from './client';

interface EmailAuthResponse {
  user: { id: string; email: string };
  new: boolean;
  redirect?: string;
}

// Calls the unified signup/signin endpoint used by the frontend AuthPage.
// Returns both the parsed body and the JWT extracted from the Set-Cookie
// header — the backend doesn't include the token in the response body
// anymore (cookie-only auth), so the CLI has to read it from the header.
export async function emailAuth(
  apiUrl: string,
  email: string,
  password: string,
): Promise<{ data: EmailAuthResponse; token: string }> {
  const res = await axios.post<EmailAuthResponse>(
    `${apiUrl}/auth/email`,
    { email, password },
    {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    },
  );

  if (res.status >= 400) {
    const err = new Error((res.data as any)?.message || 'Authentication failed') as any;
    err.code = (res.data as any)?.error;
    err.status = res.status;
    throw err;
  }

  const token = extractTokenCookie(res.headers['set-cookie']);
  if (!token) {
    throw new Error('Backend did not return an auth cookie. Check API_URL.');
  }

  return { data: res.data, token };
}

export async function logout(): Promise<void> {
  try {
    await getClient().post('/users/logout');
  } catch {
    // Logout is best-effort; the local session is cleared regardless.
  }
}

// Pulls `token=<jwt>` out of a Set-Cookie header array. The cookie is
// httpOnly so JS can never read it from a browser — node-side parsing is
// the only path to the JWT for a CLI client.
//
// The backend issues several Set-Cookie headers per response: a few
// `token=; expires=<past>` entries that clear stale domain variants, then
// the real `token=<jwt>`. We must skip the empty clear-cookies and return
// the one carrying an actual JWT.
function extractTokenCookie(setCookie: string[] | string | undefined): string | null {
  if (!setCookie) return null;
  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const raw of cookies) {
    const first = raw.split(';')[0].trim();
    const eq = first.indexOf('=');
    if (eq < 0) continue;
    if (first.slice(0, eq) !== 'token') continue;
    const value = decodeURIComponent(first.slice(eq + 1));
    if (!value) continue;
    return value;
  }
  return null;
}
