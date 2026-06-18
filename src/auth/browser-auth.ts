import * as http from 'http';
import * as crypto from 'crypto';
import { emailAuth } from '../api/auth';
import { getLoginPageHtml } from './login-page';

interface BrowserAuthResult {
  token: string;
  email: string;
  isNewUser: boolean;
}

export interface BrowserAuthSession {
  url: string;
  port: number;
  waitForToken: () => Promise<BrowserAuthResult>;
  close: () => void;
}

// Spins up a one-shot HTTP server on localhost that hosts the login page
// and proxies credentials to the backend. The browser → backend hop can't
// happen directly because:
//   1. The auth cookie is httpOnly — JS can't read the JWT from the response.
//   2. The dashboard is on a different domain — CORS would block fetch.
// Going browser → localhost → backend solves both: node parses Set-Cookie
// and keeps the JWT in-process.
export function createBrowserAuthSession(apiUrl: string): Promise<BrowserAuthSession> {
  return new Promise((resolveSession, rejectSession) => {
    let resolveToken: (result: BrowserAuthResult) => void;
    let rejectToken: (err: Error) => void;

    const tokenPromise = new Promise<BrowserAuthResult>((res, rej) => {
      resolveToken = res;
      rejectToken = rej;
    });

    let port = 0;
    // One-shot nonce binds the /submit POST to the /login GET we served.
    // Without it, any other local process could race a credential POST to
    // the random port while a login is in progress.
    const nonce = crypto.randomBytes(32).toString('base64url');

    const server = http.createServer((req, res) => {
      if (req.method === 'GET' && req.url === '/login') {
        const html = getLoginPageHtml(port, nonce);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
      }

      if (req.method === 'POST' && req.url === '/submit') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body);
            const submittedNonce = typeof parsed.nonce === 'string' ? parsed.nonce : '';
            // timingSafeEqual requires equal-length buffers; compare via a
            // constant-time wrapper that pre-checks length.
            if (!safeEqual(submittedNonce, nonce)) {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'INVALID_NONCE', message: 'Open the login URL printed by the AI tool — that page is the only one allowed to submit credentials.' }));
              return;
            }
            const { email, password } = parsed;
            if (!email || !password) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'MISSING_FIELDS', message: 'Email and password are required.' }));
              return;
            }

            const result = await emailAuth(apiUrl, email, password);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, new: result.data.new, email: result.data.user.email }));

            clearTimeout(timeout);
            resolveToken({
              token: result.token,
              email: result.data.user.email,
              isNewUser: result.data.new,
            });
          } catch (err: any) {
            const code = err?.code;
            const status = err?.status || 500;
            // Same generic message backend uses for invalid-credentials —
            // do not reveal whether the email exists.
            const message =
              code === 'INVALID_CREDENTIALS' ? "That password doesn't match the account for this email." :
              code === 'PASSWORD_TOO_SHORT' ? 'Password must be at least 8 characters long.' :
              code === 'DISPOSABLE_EMAIL' ? 'Please use a permanent email address. Disposable email providers are not allowed.' :
              err?.message || 'Something went wrong. Please try again.';
            res.writeHead(status >= 400 && status < 500 ? status : 400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: code || 'AUTH_FAILED', message }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    const timeout = setTimeout(() => {
      server.close();
      rejectToken(new Error('Login timed out after 5 minutes.'));
    }, 5 * 60 * 1000);

    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (typeof addr === 'object' && addr) {
        port = addr.port;
      }

      resolveSession({
        url: `http://localhost:${port}/login`,
        port,
        waitForToken: () => tokenPromise,
        close: () => {
          clearTimeout(timeout);
          server.close();
        },
      });
    });

    server.on('error', (err) => {
      rejectSession(err);
    });
  });
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
