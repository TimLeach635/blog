import { describe, it, expect } from 'vitest';
import { renderToDocument } from '../../test/helpers';
import Footer from './Footer.astro';
import { MASTODON_LINK, TWITTER_LINK, GITHUB_LINK } from '../consts';

describe('Footer', () => {
  it('renders the current year in the copyright notice', async () => {
    const doc = await renderToDocument(Footer);
    const year = String(new Date().getFullYear());
    expect(doc.querySelector('footer')?.textContent).toContain(year);
    expect(doc.querySelector('footer')?.textContent).toContain('Tim Leach');
  });

  it('renders social links pointing at the configured URLs', async () => {
    const doc = await renderToDocument(Footer);
    const hrefs = [...doc.querySelectorAll('.social-links a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual([MASTODON_LINK, TWITTER_LINK, GITHUB_LINK]);
  });

  it('gives each social link accessible (screen-reader) text', async () => {
    const doc = await renderToDocument(Footer);
    const labels = [...doc.querySelectorAll('.social-links a .sr-only')].map((s) =>
      s.textContent?.trim(),
    );
    expect(labels).toHaveLength(3);
    expect(labels.every((l) => !!l)).toBe(true);
  });
});
