# ESPG Website

The Earth Sciences Postgraduate Group at the University of Melbourne, on the
public web.

**Live:** https://james-lagreca.github.io/espg-website
**Admin:** https://james-lagreca.github.io/espg-website/admin/
**Repo:** https://github.com/james-lagreca/espg-website

This README is for **developers**. Editors should read [MAINTAINERS.md](./MAINTAINERS.md).
The Decap CMS setup walkthrough is at [docs/decap-cms-setup.md](./docs/decap-cms-setup.md).

---

## Stack

| Layer        | Choice                | Why |
|--------------|-----------------------|-----|
| Generator    | **Astro 6** (static)  | Fast, content-collection-first, runs on Node 22+ |
| Hosting      | **GitHub Pages**      | Free, SSL included, no DNS gymnastics until Phase 7 |
| CI/CD        | **GitHub Actions**    | Builds + deploys on push to `main` |
| CMS          | **Decap CMS 3.x**     | Editor UI for non-technical committee members; commits to the repo invisibly |
| Auth         | **Cloudflare Worker** | Tiny OAuth proxy bridging Decap ↔ GitHub (free tier) |
| Domain       | Cloudflare Registrar  | Deferred to Phase 7; site lives on `*.github.io` until then |

The repo is a normal `git` repo with the Astro app in `site/`. Everything else
is documentation and the Decap admin shell (which Astro copies through unchanged).

## Quick start

Prereqs: Node ≥ 22, Git.

```bash
git clone https://github.com/james-lagreca/espg-website.git
cd espg-website/site
npm install
npm run dev    # open http://localhost:4321/espg-website/
```

To work on the admin locally (so you can preview Decap collection changes):

```bash
# in one terminal
npx decap-server

# in another
cd site && npm run dev
# then visit http://localhost:4321/espg-website/admin/
```

`local_backend: true` in `site/public/admin/config.yml` makes the editor talk
to `decap-server` instead of GitHub OAuth.

## Build & deploy

`.github/workflows/deploy.yml` runs on push to `main`:

```
checkout → setup-node 22 → npm ci (in site/) → npm run build → upload site/dist → deploy
```

You can trigger a manual run from
[Actions → Deploy to GitHub Pages → Run workflow](https://github.com/james-lagreca/espg-website/actions/workflows/deploy.yml).
The job typically takes 30–60 seconds.

There is **no staging environment.** `main` is what's live. Decap commits go
straight to `main`. Keep an eye on
[the Actions tab](https://github.com/james-lagreca/espg-website/actions) for
red builds after pushes.

## Repository layout

```
.
├── .github/workflows/deploy.yml      # CI: build + deploy to GH Pages
├── README.md                          # this file
├── MAINTAINERS.md                     # editor-facing guide
├── docs/
│   └── decap-cms-setup.md             # one-time OAuth setup walkthrough
├── oauth-worker/                      # Cloudflare Worker (Decap OAuth proxy)
│   ├── wrangler.toml
│   ├── package.json
│   └── src/index.js
└── site/                              # the Astro project
    ├── astro.config.mjs               # site URL, base path
    ├── package.json                   # deps + scripts
    ├── tsconfig.json
    ├── public/
    │   ├── espg-logo.svg              # site logo (favicon + UI use)
    │   ├── favicon.ico, favicon.svg
    │   ├── uploads/                   # Decap-uploaded media lives here
    │   └── admin/
    │       ├── index.html             # Decap CMS entry point
    │       └── config.yml             # Decap collections + backend config
    └── src/
        ├── content.config.ts          # Zod schemas for all content collections
        ├── content/
        │   ├── events/*.md
        │   ├── committee/*.md
        │   ├── abstracts/*.md
        │   ├── presenters/*.md
        │   └── agenda.yml             # conference programme (single file)
        ├── components/society/        # design components (see § Design system)
        ├── layouts/
        │   ├── SocietyLayout.astro    # ⇐ wraps all society pages
        │   └── ConferenceLayout.astro # ⇐ wraps all conference pages (placeholder theme)
        ├── lib/url.ts                 # base-path-aware URL helper
        ├── pages/
        │   ├── index.astro                # /
        │   ├── about.astro                # /about
        │   ├── membership.astro           # /membership
        │   ├── events/index.astro         # /events
        │   ├── events/[...slug].astro     # /events/<slug>
        │   └── conference/                # /conference/* (placeholder layout)
        └── styles/tokens.css          # design tokens for the society theme
```

## Content collections

Defined in `site/src/content.config.ts`, all using Astro's Content Layer
(`glob` and `file` loaders from `astro/loaders`).

| Collection   | Loader              | Editor                     | Notes |
|--------------|---------------------|----------------------------|-------|
| `events`     | folder + glob       | Decap                      | Sorted by date; `draft: true` hides |
| `committee`  | folder + glob       | Decap                      | Sorted by `order` then `name` |
| `abstracts`  | folder + glob       | Decap                      | Linked from `agenda` items via `abstract:` field |
| `presenters` | folder + glob       | Decap                      | Grouped by `role` enum |
| `agenda`     | single YAML (`file`)| **Direct repo edit only**  | Small, ~once-per-year edit cadence |

Image fields use `z.string()` (not Astro's `image()`) so Decap can write
site-root-absolute paths like `/espg-website/uploads/photo.jpg`. Trade-off:
no automatic image optimization. Acceptable for our traffic; revisit if pages
start carrying many photos.

### Adding a new content type

1. **Schema** — add a new `defineCollection({...})` block in
   `site/src/content.config.ts`, export it from `collections`.
2. **Seed content** — drop at least one entry under
   `site/src/content/<your-collection>/sample.md` so the type system has
   something to look at.
3. **Pages** — typically an index page (`/your-collection/index.astro`) and a
   detail page (`/your-collection/[...slug].astro`). Copy from
   `events/index.astro` and `events/[...slug].astro` as a template.
4. **Decap** — append a new entry under `collections:` in
   `site/public/admin/config.yml`. Mirror an existing collection's structure;
   keep field names identical to your Zod schema.
5. **Nav** — add a link in `site/src/components/society/SocietyHeader.astro`
   if it's a top-level concept.

`npm run build` will fail loudly if anything's inconsistent.

## Design system

The society site uses a "Stratigraphic Modern" theme: dark charcoal background,
copper accent, a vertical ICS 2023 geological time scale running down the left
edge that scrolls with the page.

Type stack:

- **Bricolage Grotesque** (variable, full `opsz` + `wdth` + `wght` axes) — display
- **Hanken Grotesk** — body
- **JetBrains Mono** — tabular data, metadata, eyebrows

All design tokens (colors, fonts, type scale, spacing, layout vars) live in
`site/src/styles/tokens.css`. There's no Tailwind, no preprocessor — just CSS
variables and per-component scoped `<style>` blocks.

Society components in `site/src/components/society/`:

| Component             | Used in                | Purpose |
|-----------------------|------------------------|---------|
| `GeoTimeScale.astro`  | every society page     | Fixed left column: ICS 2023 proportional time scale with scroll-tracked "Viewing X" indicator |
| `SocietyHeader.astro` | every society page     | Small logo + ESPG wordmark + nav |
| `SocietyFooter.astro` | every society page     | Logo + colophon text |
| `SocietyMasthead.astro`| home page only        | Big specimen logo + headline + lede + Join CTA + "Next up" event strip |
| `PageHeader.astro`    | inside pages           | Eyebrow + H1 + lede block |

`SocietyLayout.astro` composes these around a `<slot />`. Use it as the layout
for any society page; pass `title` and `description` props.

### Conference theme

The conference subsection (`/conference/*`) uses **ConferenceLayout.astro**,
which is a deliberately neutral placeholder — cream paper background,
Newsreader serif, no time scale. Banner across the top reads "visual identity
TBD". It's a holding pattern until the conference gets its own design pass.

## URL helper

`site/src/lib/url.ts` exports `url(path)` which prepends the configured
`base` (`/espg-website` for the github.io build). Always use `url('/about')`
for internal links, never raw `/about` — the latter breaks when the site
isn't at the domain root.

When the custom domain lands (Phase 7), drop `base` in `astro.config.mjs` and
every link still works because the helper recomputes.

## Decap CMS

The admin is a static page at `site/public/admin/index.html` that loads
`decap-cms@^3.6.0` from unpkg. Configuration in
`site/public/admin/config.yml`. Auth flow:

1. User clicks "Log in with GitHub" in the admin
2. Decap opens a popup to `<worker-url>/auth`
3. Cloudflare Worker (source in `docs/cf-worker-oauth.js`) redirects to
   GitHub OAuth
4. GitHub redirects back to `<worker-url>/callback`
5. Worker exchanges the code for a token, posts it back to the Decap popup
   via `postMessage`
6. Decap stores the token, uses GitHub's REST API to commit content

Setup is documented at [docs/decap-cms-setup.md](./docs/decap-cms-setup.md).
The worker itself is *not* in this repo's deployment — it runs separately on
Cloudflare Workers, deployed via Wrangler.

To upgrade Decap: edit the version in `site/public/admin/index.html`. Test
locally with `npx decap-server` before pushing.

## Conventions

- **No external CSS framework.** Tokens in `tokens.css`, scoped per-component.
  Don't reach for Tailwind without a serious reason — the design system is
  small enough to maintain by hand and avoids a build dependency.
- **`url('/path')` for all internal links.** See `src/lib/url.ts`.
- **TypeScript strict** (set during `npm create astro`). Don't loosen.
- **Content schemas in `src/content.config.ts` are the source of truth.**
  Decap config must mirror them.
- **Commit messages:** present tense, descriptive (`Add committee photo
  rendering`, not `committee.md update`).
- **Co-Authored-By footers** are not required.
- **No `--force` push to `main`.** Decap commits are real history.

## Phase 7 — custom domain swap

When the committee picks a domain (candidates: `unimelb-espg.org`,
`espg.org.au`, `melbespg.org`):

1. Buy through Cloudflare Registrar (~A$15/year).
2. Add 4 A records pointing to GitHub's IPs:
   `185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153`
   plus a `CNAME` for `www → james-lagreca.github.io`.
3. In **repo Settings → Pages**, set the custom domain. GitHub creates a
   `CNAME` file in the repo.
4. Wait for DNS to verify (minutes, occasionally hours).
5. Enable **Enforce HTTPS** in Pages settings.
6. Edit `site/astro.config.mjs`:
   - Set `site` to the new domain
   - **Remove** the `base: '/espg-website'` line
7. Edit `site/public/admin/config.yml`:
   - `public_folder: "/uploads"` (drop `/espg-website/`)
   - `site_url`, `display_url`, `logo_url` → new domain
8. Update existing committed image paths: find-replace
   `/espg-website/uploads/` → `/uploads/` across `site/src/content/`.
9. Test every internal link resolves on the new domain.

## Reference

- [Astro docs](https://docs.astro.build)
- [Astro Content Layer API](https://docs.astro.build/en/guides/content-collections/)
- [Decap CMS docs](https://decapcms.org/docs/)
- [GitHub Pages docs](https://docs.github.com/en/pages)
- [Cloudflare Workers — quickstart](https://developers.cloudflare.com/workers/get-started/guide/)
