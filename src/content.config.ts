import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The schema used to type-check and validate every blog post's frontmatter.
// Exported separately so it can be unit-tested in isolation (see
// src/content.config.test.ts) without spinning up the full content layer.
export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  // Transform string to Date object
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  heroImageAltText: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/data/blog" }),
  // Type-check frontmatter using a schema
  schema: blogSchema,
});

export const collections = { blog };
