# Decap CMS setup

ESPG uses [Decap CMS](https://decapcms.org/) so that committee members can edit
events, committee bios, abstracts, and presenters through a friendly web UI —
without touching Git directly. Edits commit straight to `main` and trigger a
GitHub Actions deploy.

The admin lives at:

- **Live:** https://james-lagreca.github.io/espg-website/admin/
- **Local dev:** http://localhost:4321/espg-website/admin/

This document is for **you (the developer)** to do a one-time setup so the live
admin works. Day-to-day editors don't need to read it.

## Why this is more than a copy-paste

Decap on GitHub Pages can't talk to GitHub's OAuth endpoint directly — GitHub
doesn't allow browser apps to exchange auth codes for tokens (CORS). The
standard fix is a tiny **OAuth proxy** running on Cloudflare Workers (free
tier, ~5 minutes to deploy).

So setup is two parts:

1. **GitHub OAuth app** — registers the credentials.
2. **Cloudflare Worker** — runs the proxy that uses those credentials.

Once both are live, you paste the worker URL into `site/public/admin/config.yml`
and you're done.

---

## 1. Register a GitHub OAuth app

1. Go to https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**.
2. Fill in:
   - **Application name:** `ESPG Content Admin`
   - **Homepage URL:** `https://james-lagreca.github.io/espg-website`
   - **Authorization callback URL:** `https://espg-oauth.<your-cloudflare-subdomain>.workers.dev/callback`
     (you'll know your real subdomain after step 2; come back and update.)
3. Click **Register application**.
4. On the next screen, **Generate a new client secret**. Copy the **Client ID**
   and **Client Secret** somewhere safe — you'll paste them into Cloudflare next.

## 2. Deploy the Cloudflare Worker OAuth proxy

The worker source is in [`docs/cf-worker-oauth.js`](./cf-worker-oauth.js).

**One-time Cloudflare account setup:**

1. Create a free Cloudflare account at https://dash.cloudflare.com/sign-up (if
   you don't have one). No credit card needed; the Workers free tier covers
   100,000 requests/day, which is well beyond what content editing will use.

**Deploy with Wrangler (Cloudflare's CLI):**

```bash
# Install wrangler globally (or use `npx wrangler` everywhere below)
npm install -g wrangler

# Log in (opens a browser)
wrangler login

# From the repo root, create a new worker project for the proxy
mkdir -p ../espg-oauth && cp docs/cf-worker-oauth.js ../espg-oauth/index.js
cd ../espg-oauth

# Initialise wrangler.toml — choose 'no' to all the example questions
wrangler init --yes
# Then overwrite the generated src/index.js with our file:
cp ../espg-website/docs/cf-worker-oauth.js src/index.js

# Add your GitHub OAuth secrets (paste when prompted)
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# Deploy
wrangler deploy
```

`wrangler deploy` prints something like:

```
Deployed espg-oauth triggers
  https://espg-oauth.your-subdomain.workers.dev
```

**Copy that URL.**

## 3. Wire the URL into the admin

1. Edit `site/public/admin/config.yml` in this repo.
2. Replace the `base_url` line with your worker URL (no trailing slash):

   ```yaml
   backend:
     name: github
     repo: james-lagreca/espg-website
     branch: main
     base_url: https://espg-oauth.your-subdomain.workers.dev
     auth_endpoint: auth
   ```

3. **Go back to GitHub** and update the OAuth app's *Authorization callback URL*
   to `https://espg-oauth.your-subdomain.workers.dev/callback`.
4. Commit + push. Wait for GH Actions to finish.

## 4. Try it

Open https://james-lagreca.github.io/espg-website/admin/. You should see a
**"Log in with GitHub"** button. Click it; you'll be sent to GitHub to
authorise the OAuth app, then bounced back to the admin logged in.

Once you're in, you'll see five collections (Events, Committee, Conference
abstracts, Conference presenters) — each backed by the corresponding folder
under `site/src/content/`. Add or edit an entry, click **Publish**, and Decap
commits to `main` on your behalf. GH Actions picks up the commit and rebuilds
the site within a minute or two.

## Local editing (no internet OAuth needed)

For local dev you can use Decap's bundled proxy server:

```bash
# In one terminal, run the Decap proxy
npx decap-server

# In another, run Astro dev
cd site && npm run dev
```

Then open http://localhost:4321/espg-website/admin/. Decap will use the proxy
instead of GitHub OAuth — edits write directly to your local files, no commits.

This is set up via `local_backend: true` in `config.yml`. When the site is
deployed, the live admin uses GitHub OAuth regardless.

## Adding editors

Anyone with **write access to the repo** can log into the Decap admin with
their GitHub account — there's no separate user list. To add a new editor:

1. Go to https://github.com/james-lagreca/espg-website/settings/access
2. **Add people** → enter their GitHub username → **Write** role → invite.
3. They visit https://james-lagreca.github.io/espg-website/admin/ and log in.

To remove an editor, remove them from repo access. Decap inherits permissions
from GitHub.

## Troubleshooting

- **"Failed to fetch config.yml":** check the file is at `site/public/admin/config.yml`
  and the build deployed.
- **OAuth window opens, closes, and nothing happens:** worker URL or callback
  URL mismatch. Re-check that the OAuth app's callback URL points to
  `<worker-url>/callback`, exact match including https://.
- **"Error: PR is required for this branch":** Decap is trying to commit to a
  protected branch. Remove branch protection on `main` (Settings → Branches),
  or change `publish_mode` in config.yml to `editorial_workflow`.
- **Worker hits an error in production:** `wrangler tail` from the worker
  directory streams logs in real-time.

---

When the custom domain is connected (Phase 7), update three things:

1. `site/public/admin/config.yml` → `public_folder: "/uploads"` (drop the
   `/espg-website/` prefix), and update `site_url` / `display_url` /
   `logo_url`.
2. The GitHub OAuth app's homepage URL.
3. The OAuth callback URL probably doesn't change (it's the worker URL, not
   the site URL), but double-check.
