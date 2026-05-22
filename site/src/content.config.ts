import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Note on image fields: we use z.string() rather than Astro's image() schema
// so that Decap CMS can write site-root-absolute paths (e.g.
// "/espg-website/uploads/photo.jpg") without breaking the build. Trade-off:
// we lose Astro's automatic image optimization. Acceptable for a low-traffic
// society site; revisit if pages start carrying many photos.

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    endDate: z.date().optional(),
    location: z.string(),
    description: z.string(),
    image: z.string().optional(),
    link: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

const committee = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/committee' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    /** Calendar year of this committee term, e.g. 2026. The About page shows
     *  current-year members as the active committee, and groups everyone else
     *  by year as past committees. */
    year: z.number(),
    photo: z.string().optional(),
    email: z.string().email().optional(),
    order: z.number().default(99),
  }),
});

const abstracts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/abstracts' }),
  schema: z.object({
    title: z.string(),
    presenter: z.string(),
    affiliation: z.string(),
    coauthors: z.array(z.string()).default([]),
    session: z.string().optional(),
    slot: z.string().optional(),
    pdfUrl: z.string().url().optional(),
  }),
});

const presenters = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/presenters' }),
  schema: z.object({
    name: z.string(),
    affiliation: z.string(),
    role: z.enum(['keynote', 'invited', 'speaker']).default('speaker'),
    photo: z.string().optional(),
    order: z.number().default(99),
  }),
});

const agenda = defineCollection({
  loader: file('./src/content/agenda.yml'),
  schema: z.object({
    day: z.string(),
    time: z.string(),
    title: z.string(),
    presenter: z.string().optional(),
    room: z.string().optional(),
    type: z.enum(['session-header', 'keynote', 'talk', 'break', 'lunch', 'social']),
    abstract: z.string().optional(),
  }),
});

export const collections = { events, committee, abstracts, presenters, agenda };
