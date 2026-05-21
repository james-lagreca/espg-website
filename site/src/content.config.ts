import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      endDate: z.date().optional(),
      location: z.string(),
      description: z.string(),
      image: image().optional(),
      link: z.string().url().optional(),
      draft: z.boolean().default(false),
    }),
});

const committee = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/committee' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      photo: image().optional(),
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
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      affiliation: z.string(),
      role: z.enum(['keynote', 'invited', 'speaker']).default('speaker'),
      photo: image().optional(),
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
