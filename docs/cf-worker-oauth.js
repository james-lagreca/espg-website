/**
 * Cloudflare Worker — Decap CMS OAuth proxy for GitHub.
 *
 * Required secrets (set via `wrangler secret put`):
 *   - GITHUB_CLIENT_ID
 *   - GITHUB_CLIENT_SECRET
 *
 * Endpoints:
 *   GET /auth      → starts the OAuth dance (redirects to GitHub)
 *   GET /callback  → GitHub redirects here with a `code`; exchanges it for a token
 *                    and posts it back to the Decap CMS window via postMessage.
 *
 * Setup: see docs/decap-cms-setup.md
 */

const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const SCOPES = ['repo', 'user'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === '/auth') {
        return handleAuth(url, env);
      }
      if (url.pathname === '/callback') {
        return handleCallback(url, env);
      }
      if (url.pathname === '/' || url.pathname === '') {
        return new Response(
          'ESPG Decap CMS OAuth proxy. Use /auth to begin.',
          { headers: { 'content-type': 'text/plain' } },
        );
      }
      return new Response('Not found', { status: 404 });
    } catch (err) {
      return new Response(`OAuth error: ${err.message}`, { status: 500 });
    }
  },
};

function handleAuth(url, env) {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/callback`,
    scope: SCOPES.join(' '),
    // A short random state for CSRF protection (not strictly verified server-side
    // here — Decap re-posts the same value via the postMessage handshake).
    state: crypto.randomUUID(),
  });
  return Response.redirect(`${GITHUB_OAUTH_URL}?${params}`, 302);
}

async function handleCallback(url, env) {
  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing ?code from GitHub callback', { status: 400 });
  }

  const tokenResp = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'user-agent': 'espg-decap-oauth',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenResp.ok) {
    const t = await tokenResp.text();
    return new Response(`GitHub token exchange failed: ${t}`, { status: 502 });
  }

  const tokenData = await tokenResp.json();

  // Decap expects a postMessage handshake in this exact form.
  const payload = tokenData.access_token
    ? { token: tokenData.access_token, provider: 'github' }
    : { error: tokenData.error_description || tokenData.error || 'unknown' };
  const messageType = tokenData.access_token ? 'success' : 'error';
  const message = `authorization:github:${messageType}:${JSON.stringify(payload)}`;

  const html = `<!doctype html>
<html><body>
<script>
  (function() {
    function receive(e) {
      if (typeof e.data !== 'string' || !e.data.startsWith('authorizing:github')) return;
      window.opener.postMessage(${JSON.stringify(message)}, e.origin);
      window.removeEventListener('message', receive);
    }
    window.addEventListener('message', receive, false);
    window.opener && window.opener.postMessage('authorizing:github', '*');
  })();
</script>
<p style="font-family: system-ui; padding: 2rem; color: #555;">
  Authorised. You can close this window.
</p>
</body></html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
