import { describe, it, expect } from 'vitest';
import { blogSchema, collections } from './content.config';

// A minimal valid frontmatter object used as the basis for each test.
const valid = {
  title: 'A Post',
  description: 'A description',
  pubDate: 'Jun 29 2024',
};

describe('blogSchema', () => {
  describe('required fields', () => {
    it('accepts the minimal valid frontmatter', () => {
      const result = blogSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects frontmatter missing a title', () => {
      const { title, ...rest } = valid;
      expect(blogSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects frontmatter missing a description', () => {
      const { description, ...rest } = valid;
      expect(blogSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects frontmatter missing a pubDate', () => {
      const { pubDate, ...rest } = valid;
      expect(blogSchema.safeParse(rest).success).toBe(false);
    });

    it('rejects a non-string title', () => {
      expect(blogSchema.safeParse({ ...valid, title: 42 }).success).toBe(false);
    });
  });

  describe('pubDate coercion', () => {
    it('coerces a date string into a Date object', () => {
      const result = blogSchema.parse(valid);
      expect(result.pubDate).toBeInstanceOf(Date);
      expect(result.pubDate.getUTCFullYear()).toBe(2024);
    });

    it('rejects an unparseable date string', () => {
      const result = blogSchema.safeParse({ ...valid, pubDate: 'not a date' });
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields', () => {
    it('omits optional fields when not provided', () => {
      const result = blogSchema.parse(valid);
      expect(result.updatedDate).toBeUndefined();
      expect(result.heroImage).toBeUndefined();
      expect(result.tags).toBeUndefined();
    });

    it('coerces updatedDate when provided', () => {
      const result = blogSchema.parse({ ...valid, updatedDate: 'Feb 22 2024' });
      expect(result.updatedDate).toBeInstanceOf(Date);
    });

    it('accepts a string array of tags', () => {
      const result = blogSchema.parse({ ...valid, tags: ['meta', 'devlog'] });
      expect(result.tags).toEqual(['meta', 'devlog']);
    });

    it('rejects tags that are not an array of strings', () => {
      expect(blogSchema.safeParse({ ...valid, tags: 'meta' }).success).toBe(false);
      expect(blogSchema.safeParse({ ...valid, tags: [1, 2] }).success).toBe(false);
    });

    it('accepts heroImage and heroImageAltText as strings', () => {
      const result = blogSchema.parse({
        ...valid,
        heroImage: '/blog/image.png',
        heroImageAltText: 'Alt text',
      });
      expect(result.heroImage).toBe('/blog/image.png');
      expect(result.heroImageAltText).toBe('Alt text');
    });
  });
});

describe('collections', () => {
  it('exports a "blog" collection', () => {
    expect(collections).toHaveProperty('blog');
  });
});
