import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import matter from 'gray-matter';
import { blogSchema } from '../src/content.config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const blogDir = join(repoRoot, 'src', 'data', 'blog');
const publicDir = join(repoRoot, 'public');

// The content collection's glob loader picks up any `.md`/`.mdx` file whose
// name does not start with an underscore. Mirror that here so the test set
// always matches what Astro actually publishes.
const postFiles = readdirSync(blogDir, { recursive: true })
  .map((entry) => String(entry))
  .filter((name) => /\.(md|mdx)$/.test(name))
  .filter((name) => !name.split(/[\\/]/).pop()!.startsWith('_'))
  .sort();

describe('blog content', () => {
  it('finds at least one published post', () => {
    expect(postFiles.length).toBeGreaterThan(0);
  });

  describe.each(postFiles)('%s', (file) => {
    const raw = readFileSync(join(blogDir, file), 'utf-8');
    const { data } = matter(raw);

    it('has frontmatter that satisfies the blog schema', () => {
      const result = blogSchema.safeParse(data);
      if (!result.success) {
        // Surface the validation issues directly in the failure message.
        throw new Error(JSON.stringify(result.error.format(), null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('provides alt text whenever a hero image is set', () => {
      if (data.heroImage) {
        expect(
          data.heroImageAltText,
          'heroImage requires heroImageAltText for accessibility',
        ).toBeTruthy();
      }
    });

    it('references a hero image that exists in public/', () => {
      if (data.heroImage) {
        const imagePath = join(publicDir, data.heroImage);
        expect(existsSync(imagePath), `${data.heroImage} not found in public/`).toBe(true);
      }
    });

    it('has no empty tags', () => {
      if (data.tags) {
        for (const tag of data.tags) {
          expect(typeof tag).toBe('string');
          expect(tag.trim().length).toBeGreaterThan(0);
        }
      }
    });
  });
});

describe('blog image references', () => {
  // Inline markdown images (![alt](/path)) should also resolve to real files,
  // and should carry non-empty alt text.
  const markdownImage = /!\[(?<alt>[^\]]*)\]\((?<src>\/[^)\s]+)\)/g;

  describe.each(postFiles)('%s', (file) => {
    const raw = readFileSync(join(blogDir, file), 'utf-8');
    const { content } = matter(raw);
    const matches = [...content.matchAll(markdownImage)];

    it('points every inline image at a file that exists', () => {
      for (const m of matches) {
        const src = m.groups!.src;
        expect(existsSync(join(publicDir, src)), `${src} not found in public/`).toBe(true);
      }
    });

    it('gives every inline image non-empty alt text', () => {
      for (const m of matches) {
        expect(m.groups!.alt.trim().length, `image ${m.groups!.src} is missing alt text`).toBeGreaterThan(0);
      }
    });
  });
});
