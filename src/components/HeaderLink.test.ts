import { describe, it, expect } from 'vitest';
import { renderToDocument } from '../../test/helpers';
import HeaderLink from './HeaderLink.astro';

// `HeaderLink` marks itself active by comparing its `href` against the current
// `Astro.url.pathname`. The Container API lets us drive that via a `request`.
function requestFor(pathname: string): Request {
  return new Request(`https://tleach.uk${pathname}`);
}

describe('HeaderLink', () => {
  it('renders an anchor with the given href and slot content', async () => {
    const doc = await renderToDocument(HeaderLink, {
      props: { href: '/about' },
      slots: { default: 'About' },
      request: requestFor('/'),
    });
    const a = doc.querySelector('a');
    expect(a?.getAttribute('href')).toBe('/about');
    expect(a?.textContent?.trim()).toBe('About');
  });

  it('marks the link active when the pathname matches exactly', async () => {
    const doc = await renderToDocument(HeaderLink, {
      props: { href: '/about' },
      slots: { default: 'About' },
      request: requestFor('/about'),
    });
    expect(doc.querySelector('a')?.classList.contains('active')).toBe(true);
  });

  it('marks the link active when the first path segment matches', async () => {
    // A link to "/blog" should be active on "/blog/some-post".
    const doc = await renderToDocument(HeaderLink, {
      props: { href: '/blog' },
      slots: { default: 'Blog' },
      request: requestFor('/blog/my-first-post'),
    });
    expect(doc.querySelector('a')?.classList.contains('active')).toBe(true);
  });

  it('is not active when the pathname does not match', async () => {
    const doc = await renderToDocument(HeaderLink, {
      props: { href: '/about' },
      slots: { default: 'About' },
      request: requestFor('/blog'),
    });
    expect(doc.querySelector('a')?.classList.contains('active')).toBe(false);
  });

  it('forwards arbitrary attributes onto the anchor', async () => {
    const doc = await renderToDocument(HeaderLink, {
      props: { href: '/about', 'data-test': 'x', class: 'nav-link' },
      slots: { default: 'About' },
      request: requestFor('/'),
    });
    const a = doc.querySelector('a');
    expect(a?.getAttribute('data-test')).toBe('x');
    expect(a?.classList.contains('nav-link')).toBe(true);
  });
});
