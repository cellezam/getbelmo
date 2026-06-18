// Visual language mirrors apps/frontend/src/pages/auth/AuthPage.tsx so the
// CLI login feels like the same product. We can't run Tailwind here, so the
// (now light) brand palette, fonts, and the auth-shell backdrop are inlined
// as plain CSS. Palette source: apps/frontend/src/index.css `:root`.
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #F4F7FC;            /* page bg */
      --ink: #10182B;          /* foreground / headings */
      --muted: #5E6B82;        /* secondary text */
      --dim: #8A97AC;          /* tertiary text */
      --card: #FFFFFF;         /* raised surface */
      --border: #E3EAF5;
      --border-strong: #D4DEEC;
      --blue: #2563EB;         /* primary */
      --blue-deep: #1D4FD7;
      --blue-light: #3B82F6;
      --success: #16A34A;
      --error: #DC2626;
      --radius: 0.75rem;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Geist', system-ui, -apple-system, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem 1rem;
      position: relative;
      isolation: isolate;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    /* Aurora radial bleed at the top — mirrors .auth-shell::before */
    body::before {
      content: "";
      position: fixed;
      inset: -10% -20% auto -20%;
      height: 760px;
      background: radial-gradient(120% 100% at 50% 0%,
        rgba(37,99,235,0.10) 0%, rgba(37,99,235,0.04) 35%, transparent 70%);
      pointer-events: none;
      z-index: -1;
    }
    /* Faint masked grid mesh — mirrors .auth-shell::after */
    body::after {
      content: "";
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(to right, rgba(16,24,43,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(16,24,43,0.04) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: radial-gradient(60% 60% at 50% 30%, black 0%, transparent 80%);
      -webkit-mask-image: radial-gradient(60% 60% at 50% 30%, black 0%, transparent 80%);
      pointer-events: none;
      z-index: -1;
    }
    .container { width: 100%; max-width: 420px; }
    .logo { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .hero { text-align: center; margin-bottom: 1.5rem; }
    .hero h1 {
      font-family: 'Bricolage Grotesque', 'Geist', system-ui, sans-serif;
      font-size: 26px;
      font-weight: 600;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: var(--ink);
    }
    .hero h1 .aurora {
      background: linear-gradient(90deg, var(--blue), var(--blue-light));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .hero p { font-size: 14px; color: var(--muted); margin-top: 0.5rem; line-height: 1.55; }
    .card {
      border: 1px solid var(--border);
      background: var(--card);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: 0 1px 2px rgba(16,24,43,0.04), 0 8px 24px -12px rgba(16,24,43,0.08);
    }
    .oauth-note {
      font-size: 12.5px;
      color: var(--muted);
      text-align: center;
      padding: 0.75rem;
      border: 1px dashed var(--border-strong);
      border-radius: 0.5rem;
      margin-bottom: 0.875rem;
      line-height: 1.55;
    }
    .oauth-note code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      background: rgba(37,99,235,0.08);
      color: var(--blue-deep);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }
    .oauth-note a { color: var(--blue); text-decoration: none; font-weight: 500; }
    .oauth-note a:hover { color: var(--blue-deep); }
    .field { margin-bottom: 0.875rem; }
    .field-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.375rem;
    }
    label { font-size: 12.5px; color: var(--muted); }
    .forgot-link {
      font-size: 12px;
      color: var(--dim);
      text-decoration: none;
      transition: color 0.15s;
    }
    .forgot-link:hover { color: var(--blue); }
    input {
      display: block;
      height: 2.75rem;
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid var(--border-strong);
      background: #fff;
      padding: 0.5rem 0.75rem;
      font-size: 14px;
      font-family: inherit;
      color: var(--ink);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input::placeholder { color: var(--dim); }
    input:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
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
      background: var(--blue);
      color: #fff;
      font-size: 14.5px;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
    }
    button.submit:hover { background: var(--blue-deep); }
    button.submit:disabled { opacity: 0.55; cursor: not-allowed; }
    .arrow { display: inline-block; width: 14px; height: 14px; }
    .error {
      border: 1px solid rgba(220,38,38,0.25);
      background: rgba(220,38,38,0.06);
      color: var(--error);
      border-radius: 0.5rem;
      padding: 0.75rem;
      font-size: 13px;
      margin-bottom: 0.875rem;
      line-height: 1.45;
      display: none;
    }
    .error a { color: var(--error); text-decoration: underline; text-underline-offset: 2px; }
    .terms {
      font-size: 12px;
      color: var(--muted);
      text-align: center;
      margin-top: 0.75rem;
      line-height: 1.55;
    }
    .terms a { color: var(--ink); text-decoration: underline; text-underline-offset: 2px; }
    .terms a:hover { color: var(--blue); }
    .trust {
      display: flex; flex-wrap: wrap; justify-content: center;
      gap: 0.5rem 1rem;
      font-size: 12px; color: var(--muted);
      margin-top: 1.25rem;
    }
    .trust span { display: inline-flex; align-items: center; gap: 0.4rem; }
    .dot {
      width: 6px; height: 6px; border-radius: 999px;
      background: var(--success); box-shadow: 0 0 0 2px rgba(22,163,74,0.18);
    }
    .footer {
      text-align: center;
      font-size: 12.5px;
      color: var(--muted);
      margin-top: 1.25rem;
      padding: 0.875rem 1rem;
      border: 1px dashed var(--border-strong);
      border-radius: 0.5rem;
      line-height: 1.55;
    }
    .footer a {
      color: var(--blue);
      font-weight: 500;
      text-decoration: none;
      transition: color 0.15s;
    }
    .footer a:hover { color: var(--blue-deep); }
    .success-wrap { text-align: center; padding: 2rem 1rem; }
    .success-wrap h2 {
      font-family: 'Bricolage Grotesque', 'Geist', system-ui, sans-serif;
      font-size: 18px; font-weight: 600; color: var(--ink);
      margin-bottom: 0.5rem;
    }
    .success-wrap p { font-size: 14px; color: var(--muted); line-height: 1.55; }
    .success-icon {
      width: 48px; height: 48px;
      border-radius: 999px;
      background: rgba(22,163,74,0.12);
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320.9 120.0" width="86" height="32" aria-label="Belmo"><path d="M37.800000000000004 94.4Q33.0 94.4 29.4 92.45Q25.8 90.5 23.5 86.65Q21.200000000000003 82.8 20.3 77.1H18.8L18.7 93.0H5.1000000000000005V70.1V21.89999999999999H21.3V38.5Q21.3 41.0 21.0 43.849999999999994Q20.700000000000003 46.699999999999996 20.200000000000003 49.8Q19.700000000000003 52.9 19.0 56.1H20.8Q21.900000000000002 50.3 24.200000000000003 46.5Q26.5 42.699999999999996 30.05 40.8Q33.6 38.9 38.2 38.9Q44.5 38.9 49.150000000000006 42.15Q53.800000000000004 45.4 56.35000000000001 51.55Q58.900000000000006 57.699999999999996 58.900000000000006 66.5Q58.900000000000006 75.5 56.25 81.7Q53.6 87.9 48.85 91.15Q44.1 94.4 37.800000000000004 94.4ZM31.900000000000002 81.4Q35.1 81.4 37.45 79.55000000000001Q39.800000000000004 77.7 41.050000000000004 74.35Q42.300000000000004 71.0 42.300000000000004 66.8Q42.300000000000004 62.5 41.10000000000001 59.2Q39.900000000000006 55.9 37.650000000000006 53.95Q35.4 52.0 32.2 52.0Q30.3 52.0 28.65 52.7Q27.0 53.4 25.65 54.65Q24.3 55.9 23.3 57.599999999999994Q22.3 59.3 21.75 61.4Q21.200000000000003 63.5 21.200000000000003 65.9V67.4Q21.200000000000003 70.2 21.900000000000002 72.7Q22.6 75.2 24.0 77.2Q25.400000000000002 79.2 27.400000000000002 80.30000000000001Q29.400000000000002 81.4 31.900000000000002 81.4Z" fill="#10182B"/><path d="M92.0 94.4Q85.10000000000001 94.4 79.95000000000002 92.5Q74.80000000000001 90.6 71.4 87.05Q68.0 83.5 66.30000000000001 78.55Q64.60000000000001 73.6 64.60000000000001 67.6Q64.60000000000001 61.599999999999994 66.25 56.349999999999994Q67.9 51.099999999999994 71.2 47.14999999999999Q74.5 43.199999999999996 79.5 41.0Q84.5 38.8 91.0 38.8Q97.5 38.8 102.35000000000001 41.0Q107.20000000000002 43.199999999999996 110.25000000000001 47.25Q113.30000000000001 51.3 114.55000000000001 56.949999999999996Q115.80000000000001 62.599999999999994 115.0 69.6L75.0 70.0V61.4L104.5 61.099999999999994L100.30000000000001 65.5Q101.0 60.6 99.9 57.45Q98.80000000000001 54.3 96.55000000000001 52.8Q94.30000000000001 51.3 91.10000000000001 51.3Q87.5 51.3 85.0 53.2Q82.5 55.1 81.30000000000001 58.599999999999994Q80.10000000000001 62.099999999999994 80.10000000000001 67.1Q80.10000000000001 75.3 83.30000000000001 79.0Q86.5 82.7 92.0 82.7Q94.60000000000001 82.7 96.30000000000001 82.0Q98.0 81.3 99.10000000000001 80.15Q100.20000000000002 79.0 100.75000000000001 77.5Q101.30000000000001 76.0 101.5 74.4L115.80000000000001 76.5Q115.5 80.0 114.05000000000001 83.2Q112.60000000000001 86.4 109.80000000000001 88.95Q107.0 91.5 102.65 92.95Q98.30000000000001 94.4 92.0 94.4Z" fill="#10182B"/><path d="M123.5 93.0V21.89999999999999H139.5V93.0Z" fill="#10182B"/><path d="M149.8 93.0V60.9V40.199999999999996H162.9L163.00000000000003 58.199999999999996H164.60000000000002Q165.70000000000002 51.4 167.90000000000003 47.099999999999994Q170.10000000000002 42.8 173.45000000000002 40.8Q176.8 38.8 181.40000000000003 38.8Q186.10000000000002 38.8 189.20000000000002 40.949999999999996Q192.3 43.099999999999994 193.95000000000002 47.39999999999999Q195.60000000000002 51.699999999999996 195.90000000000003 58.199999999999996H197.20000000000002Q198.40000000000003 51.3 200.90000000000003 47.05Q203.40000000000003 42.8 207.00000000000003 40.8Q210.60000000000002 38.8 215.10000000000002 38.8Q219.40000000000003 38.8 222.60000000000002 40.449999999999996Q225.8 42.099999999999994 227.95000000000002 45.349999999999994Q230.10000000000002 48.599999999999994 231.15000000000003 53.5Q232.20000000000002 58.4 232.20000000000002 64.9V93.0H216.0V66.7Q216.0 62.0 215.25 58.9Q214.5 55.8 212.9 54.25Q211.3 52.699999999999996 208.8 52.699999999999996Q205.90000000000003 52.699999999999996 203.65000000000003 54.9Q201.40000000000003 57.1 200.15000000000003 61.25Q198.90000000000003 65.4 198.90000000000003 71.2V93.0H183.10000000000002V66.7Q183.10000000000002 61.9 182.25000000000003 58.849999999999994Q181.40000000000003 55.8 179.8 54.25Q178.20000000000002 52.699999999999996 175.70000000000002 52.699999999999996Q172.8 52.699999999999996 170.65000000000003 54.8Q168.50000000000003 56.9 167.25000000000003 61.0Q166.00000000000003 65.1 166.00000000000003 71.2V93.0Z" fill="#10182B"/><path d="M266.3 94.4Q258.40000000000003 94.4 252.35000000000002 91.30000000000001Q246.3 88.2 242.90000000000003 82.05000000000001Q239.50000000000003 75.9 239.50000000000003 66.6Q239.50000000000003 57.1 242.95000000000002 50.95Q246.4 44.8 252.5 41.8Q258.6 38.8 266.40000000000003 38.8Q274.40000000000003 38.8 280.45000000000005 41.9Q286.5 45.0 289.9 51.15Q293.3 57.3 293.3 66.6Q293.3 76.2 289.75 82.35Q286.20000000000005 88.5 280.05000000000007 91.45Q273.90000000000003 94.4 266.3 94.4ZM266.70000000000005 82.6Q270.1 82.6 272.40000000000003 80.9Q274.70000000000005 79.2 275.85 75.80000000000001Q277.0 72.4 277.0 67.6Q277.0 62.3 275.75 58.7Q274.5 55.1 272.05 53.15Q269.6 51.199999999999996 266.0 51.199999999999996Q262.70000000000005 51.199999999999996 260.40000000000003 52.89999999999999Q258.1 54.599999999999994 256.95000000000005 58.0Q255.8 61.4 255.8 66.4Q255.8 74.3 258.65 78.44999999999999Q261.5 82.6 266.70000000000005 82.6Z" fill="#10182B"/><path d="M308.4 94.3Q303.2 94.3 300.65 92.1Q298.1 89.9 298.1 85.3Q298.1 80.6 300.65 78.4Q303.2 76.2 308.4 76.2Q313.6 76.2 316.20000000000005 78.4Q318.8 80.6 318.8 85.3Q318.8 94.3 308.4 94.3Z" fill="#2563EB"/></svg>
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
