// Visual language mirrors apps/frontend/src/pages/auth/AuthPage.tsx so the
// CLI login feels like the same product. We can't run Tailwind here, so the
// aurora palette and spacing are inlined as plain CSS.
const DASHBOARD_URL = 'https://dashboard.belmo.io';
const DISCORD_URL = 'https://discord.gg/bPkuBrKMaG';
const TELEGRAM_URL = 'https://t.me/hgsupportadmin';

export function getLoginPageHtml(callbackPort: number, nonce: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Belmo</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: rgba(255,255,255,0.9);
      --muted: rgba(255,255,255,0.55);
      --dim: rgba(255,255,255,0.35);
      --border: rgba(255,255,255,0.08);
      --border-strong: rgba(255,255,255,0.12);
      --surface: rgba(255,255,255,0.025);
      --aurora-cyan: #7dd3fc;
      --aurora-violet: #c4b5fd;
      --aurora-pink: #f9a8d4;
      --aurora-pink-deep: #f472b6;
      --success: #34d399;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      background: #050505;
      color: var(--fg);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem 1rem;
    }
    .container { width: 100%; max-width: 420px; }
    .logo { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .logo img { height: 2rem; }
    .hero { text-align: center; margin-bottom: 1.5rem; }
    .hero h1 {
      font-size: 26px;
      font-weight: 500;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: #fff;
    }
    .hero h1 .aurora {
      background: linear-gradient(90deg, var(--aurora-cyan), var(--aurora-violet), var(--aurora-pink));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .hero p { font-size: 14px; color: var(--muted); margin-top: 0.5rem; line-height: 1.55; }
    .card {
      border: 1px solid var(--border);
      background: var(--surface);
      border-radius: 0.75rem;
      padding: 1.5rem;
    }
    .oauth-note {
      font-size: 12.5px;
      color: var(--dim);
      text-align: center;
      padding: 0.75rem;
      border: 1px dashed var(--border);
      border-radius: 0.5rem;
      margin-bottom: 0.875rem;
      line-height: 1.55;
    }
    .oauth-note a { color: var(--aurora-cyan); text-decoration: none; }
    .oauth-note a:hover { color: var(--aurora-violet); }
    .field { margin-bottom: 0.875rem; }
    .field-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.375rem;
    }
    label { font-size: 12.5px; color: rgba(255,255,255,0.6); }
    .forgot-link {
      font-size: 12px;
      color: var(--dim);
      text-decoration: none;
      transition: color 0.15s;
    }
    .forgot-link:hover { color: var(--aurora-cyan); }
    input {
      display: block;
      height: 2.75rem;
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid var(--border-strong);
      background: rgba(255,255,255,0.04);
      padding: 0.5rem 0.75rem;
      font-size: 14px;
      color: var(--fg);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input::placeholder { color: rgba(255,255,255,0.25); }
    input:focus {
      border-color: rgba(255,255,255,0.2);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.2);
    }
    .hint {
      font-size: 11.5px;
      color: var(--dim);
      margin-top: 0.375rem;
      line-height: 1.5;
    }
    button.submit {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      width: 100%;
      height: 2.75rem;
      border: none;
      border-radius: 0.5rem;
      background: #fff;
      color: #0a0a0a;
      font-size: 14.5px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
    }
    button.submit:hover { background: rgba(255,255,255,0.92); }
    button.submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .arrow { display: inline-block; width: 14px; height: 14px; }
    .error {
      border: 1px solid rgba(249,168,212,0.24);
      background: rgba(249,168,212,0.08);
      color: var(--aurora-pink);
      border-radius: 0.5rem;
      padding: 0.75rem;
      font-size: 13px;
      margin-bottom: 0.875rem;
      line-height: 1.45;
      display: none;
    }
    .error a { color: var(--aurora-pink-deep); text-decoration: underline; text-underline-offset: 2px; }
    .terms {
      font-size: 12px;
      color: rgba(255,255,255,0.45);
      text-align: center;
      margin-top: 0.75rem;
      line-height: 1.55;
    }
    .terms a { color: rgba(255,255,255,0.7); text-decoration: underline; text-underline-offset: 2px; }
    .terms a:hover { color: #fff; }
    .trust {
      display: flex; flex-wrap: wrap; justify-content: center;
      gap: 0.5rem 1rem;
      font-size: 12px; color: var(--dim);
      margin-top: 1.25rem;
    }
    .trust span { display: inline-flex; align-items: center; gap: 0.4rem; }
    .dot {
      width: 6px; height: 6px; border-radius: 999px;
      background: var(--success); box-shadow: 0 0 0 2px rgba(52,211,153,0.2);
    }
    .footer {
      text-align: center;
      font-size: 12.5px;
      color: rgba(255,255,255,0.45);
      margin-top: 1.25rem;
      padding: 0.875rem 1rem;
      border: 1px dashed var(--border);
      border-radius: 0.5rem;
      line-height: 1.55;
    }
    .footer a {
      color: var(--aurora-cyan);
      font-weight: 500;
      text-decoration: none;
      transition: color 0.15s;
    }
    .footer a:hover { color: var(--aurora-violet); }
    .success-wrap { text-align: center; padding: 2rem 1rem; }
    .success-wrap h2 {
      font-size: 18px; font-weight: 500; color: #fff;
      margin-bottom: 0.5rem;
    }
    .success-wrap p { font-size: 14px; color: var(--muted); line-height: 1.55; }
    .success-icon {
      width: 48px; height: 48px;
      border-radius: 999px;
      background: rgba(52,211,153,0.12);
      color: var(--success);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div id="login-view">
      <div class="logo">
        <svg width="160" height="32" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Belmo">
          <text x="0" y="22" font-family="-apple-system, 'Inter', sans-serif" font-size="19" font-weight="600" fill="white">Belmo</text>
        </svg>
      </div>

      <div class="hero">
        <h1>Ship your first app<br>in <span class="aurora">two minutes</span>.</h1>
        <p>Sign in or create your account · Free forever, no card.</p>
      </div>

      <form class="card" onsubmit="event.preventDefault(); handleLogin();">
        <div class="oauth-note">
          Using Google or GitHub?
          Sign in at <a href="${DASHBOARD_URL}/auth" target="_blank" rel="noopener">dashboard.belmo.io</a>,
          copy a session token, and run <code>auth_token</code> in your AI tool.
        </div>

        <div id="error" class="error"></div>

        <div class="field">
          <div class="field-header">
            <label for="email">Email</label>
          </div>
          <input id="email" type="email" placeholder="you@yourstartup.com" autocomplete="email" autofocus required />
        </div>

        <div class="field">
          <div class="field-header">
            <label for="password">Password</label>
            <a class="forgot-link" href="${DASHBOARD_URL}/forgot-password" target="_blank" rel="noopener">Forgot password?</a>
          </div>
          <input id="password" type="password" placeholder="At least 8 characters" autocomplete="current-password" minlength="8" required />
          <p class="hint">If your email is new, we'll create your account. Otherwise we'll sign you in.</p>
        </div>

        <button id="submit" type="submit" class="submit">
          <span id="submit-label">Continue</span>
          <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>

        <p class="terms">
          By continuing, you agree to our
          <a href="https://belmo.io/terms" target="_blank" rel="noopener">Terms</a>
          and
          <a href="https://belmo.io/privacy" target="_blank" rel="noopener">Privacy Policy</a>.
        </p>
      </form>

      <div class="trust">
        <span><span class="dot"></span>Free forever</span>
        <span><span class="dot"></span>No card required</span>
        <span><span class="dot"></span>EU &amp; US regions</span>
      </div>

      <p class="footer">
        Your credentials are sent to the Belmo API over HTTPS — they never pass through your AI tool.<br>
        Need a hand?
        <a href="${DISCORD_URL}" target="_blank" rel="noopener">Discord</a> ·
        <a href="${TELEGRAM_URL}" target="_blank" rel="noopener">Telegram</a>
      </p>
    </div>

    <div id="success-view" class="card success-wrap" style="display:none">
      <div class="success-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h2 id="success-title">You're signed in</h2>
      <p id="success-message">You can close this tab and return to your AI tool.</p>
    </div>
  </div>

  <script>
    const CALLBACK = 'http://localhost:${callbackPort}/submit';
    const NONCE = '${nonce}';

    async function handleLogin() {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error');
      const submitBtn = document.getElementById('submit');
      const submitLabel = document.getElementById('submit-label');
      errorEl.style.display = 'none';

      if (!email || !password) {
        showError('Email and password are required.');
        return;
      }

      submitBtn.disabled = true;
      submitLabel.textContent = 'Signing in…';

      try {
        const res = await fetch(CALLBACK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, nonce: NONCE }),
        });
        const data = await res.json();

        if (!res.ok) {
          showError(data.message || 'Sign-in failed.', data.error);
          submitBtn.disabled = false;
          submitLabel.textContent = 'Continue';
          return;
        }

        document.getElementById('login-view').style.display = 'none';
        document.getElementById('success-view').style.display = 'block';
        if (data.new) {
          document.getElementById('success-title').textContent = 'Account created';
          document.getElementById('success-message').textContent =
            'Check your inbox to verify your email, then return to your AI tool.';
        }
      } catch (err) {
        showError('Could not reach the local sign-in helper. Is the AI tool still running?');
        submitBtn.disabled = false;
        submitLabel.textContent = 'Continue';
      }
    }

    function showError(message, code) {
      const errorEl = document.getElementById('error');
      if (code === 'INVALID_CREDENTIALS') {
        errorEl.innerHTML = message + ' <a href="${DASHBOARD_URL}/forgot-password" target="_blank" rel="noopener">Reset it</a> or try again.';
      } else {
        errorEl.textContent = message;
      }
      errorEl.style.display = 'block';
    }
  </script>
</body>
</html>`;
}
