import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderToDocument } from '../../test/helpers';
import Footer from './Footer.astro';

// Expected values are hard-coded (rather than imported from consts) so that a
// future change to the social links forces a deliberate test update.
const EXPECTED_SOCIAL_LINKS = [
  'https://mastodon.social/@timleach',
  'https://twitter.com/TimLeach635',
  'https://github.com/TimLeach635',
];

describe('Footer', () => {
  afterEach(() => {
    // Undo any fake timers set within a test.
    vi.useRealTimers();
  });

  it('renders the current year in the copyright notice', async () => {
    // Pin "now" to a fixed date (Vitest's equivalent of freezegun) so the year
    // assertion is a hard-coded value rather than derived from `new Date()`.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2021-07-15T00:00:00Z'));

    const doc = await renderToDocument(Footer);
    expect(doc.querySelector('footer')?.textContent).toContain('2021');
    expect(doc.querySelector('footer')?.textContent).toContain('Tim Leach');
  });

  it('renders social links pointing at the configured URLs', async () => {
    const doc = await renderToDocument(Footer);
    const hrefs = [...doc.querySelectorAll('.social-links a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(EXPECTED_SOCIAL_LINKS);
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
