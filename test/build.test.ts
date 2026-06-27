import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { parseHTML } from 'linkedom';
import matter from 'gray-matter';

// End-to-end coverage: build the site once and assert on the real generated
// output. This exercises page templates, BaseHead, the RSS feed and the
// content collection together — things that can't be unit-tested in isolation
// because they depend on `Astro.site` and the full content layer.

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const distDir = join(repoRoot, 'dist');
const blogDir = join(repoRoot, 'src', 'data', 'blog');

// The post ids Astro derives from filenames (path minus extension).
const postIds = readdirSync(blogDir, { recursive: true })
  .map((entry) => String(entry))
  .filter((name) => /\.(md|mdx)$/.test(name))
  .filter((name) => !name.split(/[\\/]/).pop()!.startsWith('_'))
  .map((name) => name.replace(/\.(md|mdx)$/, ''));

function read(relativePath: string): string {
  return readFileSync(join(distDir, relativePath), 'utf-8');
}

beforeAll(() => {
  // `astro check` is run separately by `npm run build`; here we only need the
  // build artifacts, so run the (faster) build step directly.
  execFileSync('npx', ['astro', 'build'], {
    cwd: repoRoot,
    stdio: 'pipe',
  });
}, 180_000);

describe('build output', () => {
  it('produces the expected top-level pages', () => {
    expect(existsSync(join(distDir, 'index.html'))).toBe(true);
    expect(existsSync(join(distDir, 'about', 'index.html'))).toBe(true);
    expect(existsSync(join(distDir, 'blog', 'index.html'))).toBe(true);
    expect(existsSync(join(distDir, 'rss.xml'))).toBe(true);
  });

  it('generates a page for every post', () => {
    for (const id of postIds) {
      expect(
        existsSync(join(distDir, 'blog', id, 'index.html')),
        `missing built page for ${id}`,
      ).toBe(true);
    }
  });
});

describe('blog index links', () => {
  it('links to every post by its id', () => {
    const html = read('blog/index.html');
    for (const id of postIds) {
      expect(html).toContain(`/blog/${id}/`);
    }
  });

  it('never emits an "undefined" slug', () => {
    expect(read('blog/index.html')).not.toContain('/blog/undefined/');
  });
});

describe('RSS feed', () => {
  const xml = () => read('rss.xml');

  it('uses the configured site title', () => {
    expect(xml()).toContain('<title>Tim Leach</title>');
  });

  it('links to every post by its id', () => {
    for (const id of postIds) {
      expect(xml()).toContain(`https://tleach.uk/blog/${id}/`);
    }
  });

  it('never emits an "undefined" slug', () => {
    expect(xml()).not.toContain('/blog/undefined/');
  });

  it('has one <item> per post', () => {
    const items = xml().match(/<item>/g) ?? [];
    expect(items.length).toBe(postIds.length);
  });
});

describe('per-post <head> metadata', () => {
  it.each(postIds)('%s has a canonical URL and matching title', (id) => {
    const html = read(join('blog', id, 'index.html'));
    const { data } = matter(readFileSync(join(blogDir, findSource(id)), 'utf-8'));
    // Parse so HTML entities (e.g. apostrophes) are decoded before comparison.
    const { document } = parseHTML(html);

    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe(`https://tleach.uk/blog/${id}/`);
    // The post title should drive both the <title> and the og:title meta tag.
    expect(document.querySelector('title')?.textContent).toBe(data.title);
    expect(
      document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
    ).toBe(data.title);
    expect(
      document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe(data.description);
  });
});

// Resolve a post id back to its source filename (md or mdx).
function findSource(id: string): string {
  for (const ext of ['md', 'mdx']) {
    if (existsSync(join(blogDir, `${id}.${ext}`))) return `${id}.${ext}`;
  }
  throw new Error(`No source file found for post id "${id}"`);
}
