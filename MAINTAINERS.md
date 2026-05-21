# Maintaining the ESPG website

This guide is for **committee members** — the people who need to add events,
update committee bios, or post abstracts before the conference. You don't need
to know any code, and you won't need to touch GitHub directly.

If you're a developer looking for the technical side, see [README.md](./README.md)
and [docs/decap-cms-setup.md](./docs/decap-cms-setup.md).

---

## TL;DR

- **Editor URL:** https://james-lagreca.github.io/espg-website/admin/
- Log in with your **GitHub account**. (If you don't have one, see [§ Adding a new editor](#adding-a-new-editor) — someone with access has to invite you first.)
- Click a collection on the left → **New** → fill the form → **Publish**.
- The website rebuilds itself within about a minute. No further action needed.

---

## What this is, briefly

The ESPG website is a *static site*: every page is plain HTML, regenerated
each time content changes, and served by GitHub for free. You don't talk to a
database — you edit files, and the site rebuilds.

You'll be using a tool called **Decap CMS**, which is a friendly web editor
sitting on top of those files. From your point of view it just looks like a
content management system. Behind the scenes it commits to GitHub, GitHub
rebuilds the site, and the new content appears.

The whole thing costs roughly **A$15/year** (domain only), runs without you
having to remember to renew anything except the domain, and is fully open —
the entire site, including this page, is at
[github.com/james-lagreca/espg-website](https://github.com/james-lagreca/espg-website).

---

## Logging in

1. Go to https://james-lagreca.github.io/espg-website/admin/
2. Click **"Log in with GitHub"**.
3. A popup will ask you to authorise the **ESPG Content Admin** GitHub app.
   Approve it. (You only do this once.)
4. You'll land in the editor. On the left you'll see five collections:
   - **Events**
   - **Committee**
   - **Conference abstracts**
   - **Conference presenters**

If you see "Log in" but clicking does nothing, see [§ When things break](#when-things-break).

---

## Adding an event

1. Click **Events** on the left.
2. Click **New Event** (top right).
3. Fill in the fields:
   - **Title:** e.g. "Welcome BBQ 2026"
   - **Start date & time:** click the field; pick a date and time
   - **End date & time:** only if it's multi-day (otherwise leave blank)
   - **Location:** e.g. "South Lawn, Parkville campus"
   - **Short description:** 1–2 sentences. This is what shows up in the events
     listing on the homepage.
   - **Image** (optional): drag a JPG/PNG in, or click the field to pick one.
     See [§ Uploading images](#uploading-images).
   - **External link** (optional): if there's a separate page (UMSU, GSA,
     etc.) with full details, paste the URL here.
   - **Draft:** tick this if you're not ready to publish yet. Untick when you
     want it live.
   - **Body:** the long description that appears on the event's own page.
     This supports formatting (bold, links, lists) using the toolbar.
4. Click **Publish → Publish now** (top right).
5. Wait ~1 minute. The event will appear at
   https://james-lagreca.github.io/espg-website/events.

If you make a mistake, click the event in the Events list, edit, **Publish
now** again — it overwrites the previous version.

To **delete** an event: open it, click **Delete entry** (bottom of the form).

## Adding a committee member

1. Click **Committee** → **New Committee member**.
2. Fill in:
   - **Name:** their full name
   - **Role:** e.g. "Chair", "Treasurer". Use the same casing as existing entries.
   - **Display order:** 1 = first on the page, 2 = second, etc. The Chair is
     usually 1, Secretary 2, Treasurer 3, etc. Leave at 99 if you don't care.
   - **Photo** (optional): see [§ Uploading images](#uploading-images).
   - **Email** (optional): a contact address
   - **Bio:** 2–3 sentences. What they research, year of study.
3. **Publish now**.

When the committee turns over at the AGM in March:

- Update the **Role** (or **Display order**) on each entry to match the new committee.
- Add new members with **New Committee member**.
- Remove people who've left with **Delete entry**.

## Adding a conference abstract

1. Click **Conference abstracts** → **New Abstract**.
2. Fill in:
   - **Title** of the talk/poster
   - **Presenter** — the person who'll be presenting (one name)
   - **Affiliation** — usually "University of Melbourne", but could be another
     institution for invited speakers
   - **Co-authors** — click **Add Co-author** for each one (just their names)
   - **Session** — e.g. "Active tectonics and seismic hazard". Use the same
     phrasing across abstracts in the same session so they group together.
   - **Slot** — e.g. "Day 1, 11:00" (optional)
   - **PDF URL** (optional) — if you've uploaded the full paper somewhere
   - **Abstract text** — the actual abstract body, formatted with the toolbar
3. **Publish now**.

The abstract appears at
https://james-lagreca.github.io/espg-website/conference/abstracts/.
Abstracts are sorted by presenter name and grouped by session.

## Adding a conference presenter

This is for keynote and invited speakers, not regular presenters (those go
under Abstracts). The presenters page is a bios listing.

1. Click **Conference presenters** → **New Presenter**.
2. Fill in:
   - **Name, Affiliation, Photo, Bio** — as you'd expect
   - **Role:** pick one:
     - **Keynote speaker** — top of the presenters page
     - **Invited speaker** — middle section
     - **Speaker** — generic speakers section
   - **Display order:** lower = higher up within their section. Use 1 for the
     "main" keynote, 2 for the second, etc.
3. **Publish now**.

---

## Uploading images

When you click an image field, a modal opens. Either:

- **Drag** a file from your computer into the modal
- Or click to pick from already-uploaded files

A few notes:

- **Keep file sizes reasonable.** A 5MB phone photo is way larger than needed.
  Resize to ~1600px wide before uploading if you can. Tools:
  [TinyPNG](https://tinypng.com/), [Squoosh](https://squoosh.app/), Preview.app
  on Mac (Tools → Adjust Size).
- **JPG for photos, PNG for graphics.** SVG works too if you have it.
- **Don't rename uploaded files** unless you need to — Decap may not know
  where the old reference went.

Uploaded images are stored permanently with the site. If you want to clean
up unused images, ask a developer.

---

## Drafts and previews

- **Save** (left of Publish) saves your work without publishing — useful for
  long abstracts you want to come back to.
- **Draft** checkbox on Events hides the entry from the live site until you
  untick it. Use this for events you're planning but not announcing yet.
- There's no "preview" button. To see what something looks like, publish it
  with the **Draft** checkbox ticked (or just publish — you can always edit
  again).

---

## Adding a new editor

Anyone with **write access** to the GitHub repo can log in and edit. To add
someone:

1. Go to
   https://github.com/james-lagreca/espg-website/settings/access
   (you need to be an admin on the repo to see this).
2. Click **Add people** → enter their GitHub username or email → choose
   **Write** role → **Add**.
3. They'll get an email invitation. Once accepted, they can visit
   https://james-lagreca.github.io/espg-website/admin/ and log in.

To remove an editor (e.g. when the committee turns over), remove them from
the repo's access list. They won't be able to log in to the admin anymore.

> **At the AGM each March:** the outgoing committee should add the incoming
> committee to repo access *before* losing their own access, so there's
> always someone who can edit.

---

## When things break

### "I logged in but I see a permission error"

You're logged in but don't have write access. Ask the previous secretary or
chair to add you (see [§ Adding a new editor](#adding-a-new-editor)).

### "I published but the site hasn't updated"

The site rebuilds within about a minute. If it's been longer:

1. Check the build status at
   https://github.com/james-lagreca/espg-website/actions —
   look at the most recent run.
2. If it shows a red ✗, something failed during the rebuild. Click into the
   run to see the error. Most failures are caused by malformed input
   (e.g. an event without a date). Re-open the entry, fix the issue,
   **Publish now** again.
3. If it shows a green ✓ but the site still hasn't updated, hard-refresh
   your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows). GitHub Pages
   sometimes caches pages briefly.

### "The login popup closes and nothing happens"

Usually means the OAuth proxy isn't responding. Ask a developer to check
the Cloudflare Worker status.

### "I uploaded an image but it's not showing up"

- Did you click **Publish now** after attaching it? Decap won't save the
  image until the entry is published.
- Hard-refresh your browser.
- Check the live site (https://james-lagreca.github.io/espg-website/events
  for events), not just the admin preview.

### "I deleted something by mistake"

Everything is in version control. Ask a developer — they can restore any
previous state of any file with one Git command. You haven't broken anything
permanently.

### "Something is really broken"

Email the previous webmaster / developer. If you don't know who that is, the
person who set this up was **James Lagreca**. The site is also self-recovering:
even if the admin breaks, the live site keeps working until someone pushes a
new commit.

---

## What you can't do from the admin

A few things still need a developer's hand:

- **Site design / typography / colours** — these live in code.
- **Adding a new collection** (e.g. "Newsletters") — schemas live in code.
- **Changing the navigation menu** at the top of the site — also in code.
- **Editing the conference programme timetable** — it lives as a YAML file
  the developer edits directly. (Talk to whoever's setting up the conference;
  the chair usually does this once at the start of the conference cycle.)
- **The conference subsection's visual design** — currently a placeholder
  layout while we work out the conference identity separately.

When you need any of these, talk to the developer.
