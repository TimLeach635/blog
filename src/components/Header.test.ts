import { describe, it, expect } from 'vitest';
import { renderToDocument } from '../../test/helpers';
import Header from './Header.astro';

// Expected values are hard-coded (rather than imported from consts) so that a
// future change to the title or social links forces a deliberate test update.
const EXPECTED_TITLE = 'Tim Leach';
const EXPECTED_SOCIAL_LINKS = [
  'https://mastodon.social/@timleach',
  'https://twitter.com/TimLeach635',
  'https://github.com/TimLeach635',
];

async function header() {
  return renderToDocument(Header, { request: new Request('https://tleach.uk/') });
}

describe('Header', () => {
  it('renders the site title linking home', async () => {
    const doc = await header();
    const titleLink = doc.querySelector('h2 a');
    expect(titleLink?.textContent).toBe(EXPECTED_TITLE);
    expect(titleLink?.getAttribute('href')).toBe('/');
  });

  it('renders the internal navigation links', async () => {
    const doc = await header();
    const hrefs = [...doc.querySelectorAll('.internal-links a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/', '/blog', '/about']);
  });

  it('renders social links pointing at the configured URLs', async () => {
    const doc = await header();
    const hrefs = [...doc.querySelectorAll('.social-links a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(EXPECTED_SOCIAL_LINKS);
  });

  it('opens social links in a new tab', async () => {
    const doc = await header();
    for (const a of doc.querySelectorAll('.social-links a')) {
      expect(a.getAttribute('target')).toBe('_blank');
    }
  });

  it('gives each social link accessible (screen-reader) text', async () => {
    const doc = await header();
    const labels = [...doc.querySelectorAll('.social-links a .sr-only')].map((s) =>
      s.textContent?.trim(),
    );
    expect(labels).toHaveLength(3);
    expect(labels.every((l) => !!l)).toBe(true);
  });

  it('hides decorative SVG icons from assistive tech', async () => {
    const doc = await header();
    for (const svg of doc.querySelectorAll('.social-links a svg')) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
