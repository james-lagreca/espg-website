# Decap CMS setup

ESPG uses [Decap CMS](https://decapcms.org/) so committee members can edit
events, committee bios, abstracts, and presenters through a friendly web UI —
without touching Git directly. Edits commit straight to `main` and trigger a
GitHub Actions deploy.

The admin lives at:

- **Live:** https://james-lagreca.github.io/espg-website/admin/
- **Local dev:** http://localhost:4321/espg-website/admin/

This document is for **you (the developer)** to do a one-time setup so the
live admin works. Day-to-day editors don't need to read it.

## Why this is more than a copy-paste

Decap on GitHub Pages can't talk to GitHub's OAuth endpoint directly — GitHub
doesn't allow browser apps to exchange auth codes for tokens (CORS). The
standard fix is a tiny **OAuth proxy** running on Cloudflare Workers (free
tier, ~5 minutes to deploy).

So setup is three parts:

1. **GitHub OAuth app** — registers the credentials.
2. **Cloudflare Worker** — the proxy that uses those credentials.
3. **`config.yml`** — paste the worker URL in.

The worker source lives at [`/oauth-worker/`](../oauth-worker/) in this repo,
ready to deploy.

---

## 1. Register a GitHub OAuth app

1. Go to https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**.
2. Fill in:
   - **Application name:** `ESPG Content Admin`
   - **Homepage URL:** `https://james-lagreca.github.io/espg-website`
   - **Authorization callback URL:** any placeholder, e.g.
     `https://espg-oauth.placeholder.workers.dev/callback`
     (you'll fix it after step 2.)
3. Click **Register application**.
4. On the next screen, click **Generate a new client secret**.
5. Keep both the **Client ID** and the **Client Secret** visible for the next step.

## 2. Deploy the Cloudflare Worker OAuth proxy

You need a free Cloudflare account: sign up at
https://dash.cloudflare.com/sign-up if you don't have one. No credit card
required; the Workers free tier covers 100,000 requests/day, which is far
beyond what content editing will use.

From the repo root:

```bash
cd oauth-worker
npm install                              # installs wrangler (already done once)
npx wrangler login                       # opens a browser; click 'Allow'
npx wrangler secret put GITHUB_CLIENT_ID         # paste your Client ID, Enter
npx wrangler secret put GITHUB_CLIENT_SECRET     # paste your Client Secret, Enter
npx wrangler deploy
```

The last command prints something like:

```
Deployed espg-oauth triggers (0.45 sec)
  https://espg-oauth.your-subdomain.workers.dev
```

**Copy that URL.**

## 3. Fix the GitHub OAuth callback

Go back to https://github.com/settings/developers, click your ESPG Content
Admin app, and replace the **Authorization callback URL** with:

```
https://espg-oauth.your-subdomain.workers.dev/callback
```

(your real worker URL + `/callback`). Click **Update application**.

## 4. Wire the URL into the admin

1. Edit `site/public/admin/config.yml` in this repo.
2. Replace the `base_url` placeholder with your worker URL (no trailing slash):

   ```yaml
   backend:
     name: github
     repo: james-lagreca/espg-website
     branch: main
     base_url: https://espg-oauth.your-subdomain.workers.dev
     auth_endpoint: auth
   ```

3. Commit + push. Wait for GH Actions to finish.

## 5. Try it

Open https://james-lagreca.github.io/espg-website/admin/. You should see a
**"Log in with GitHub"** button. Click it; you'll be sent to GitHub to
authorise the OAuth app, then bounced back to the admin logged in.

Once you're in, you'll see four collections (Events, Committee, Conference
abstracts, Conference presenters) — each backed by the corresponding folder
under `site/src/content/`. Add or edit an entry, click **Publish**, and Decap
commits to `main` on your behalf. GH Actions picks up the commit and rebuilds
the site within a minute or two.

---

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

- **"Failed to fetch config.yml":** check the file is at
  `site/public/admin/config.yml` and the build deployed.
- **OAuth window opens, closes, and nothing happens:** worker URL or callback
  URL mismatch. Re-check that the OAuth app's callback URL matches
  `<worker-url>/callback` exactly, including `https://`.
- **"Error: PR is required for this branch":** Decap is trying to commit to a
  protected branch. Remove branch protection on `main` (Settings → Branches),
  or change `publish_mode` in config.yml to `editorial_workflow`.
- **Worker hits an error in production:** from `oauth-worker/` run
  `npx wrangler tail` to stream logs in real time.

## Updating the worker later

The worker source is at [`oauth-worker/src/index.js`](../oauth-worker/src/index.js).
Edit, then from `oauth-worker/`:

```bash
npx wrangler deploy
```

Secrets persist; you don't need to re-set them.

---

When the custom domain is connected (Phase 7):

1. `site/public/admin/config.yml` → `public_folder: "/uploads"` (drop the
   `/espg-website/` prefix). Update `site_url` / `display_url` / `logo_url`.
2. The GitHub OAuth app's homepage URL.
3. The OAuth callback URL probably doesn't change (it's the worker URL, not
   the site URL), but double-check.
