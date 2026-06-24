import { describe, it, expect } from 'vitest';
import {
  SITE_TITLE,
  SITE_DESCRIPTION,
  MASTODON_LINK,
  TWITTER_LINK,
  GITHUB_LINK,
} from './consts';

describe('site constants', () => {
  it('has a non-empty title and description', () => {
    expect(SITE_TITLE).toBeTruthy();
    expect(SITE_DESCRIPTION).toBeTruthy();
  });

  it.each([
    ['MASTODON_LINK', MASTODON_LINK],
    ['TWITTER_LINK', TWITTER_LINK],
    ['GITHUB_LINK', GITHUB_LINK],
  ])('%s is a valid https URL', (_name, link) => {
    expect(() => new URL(link)).not.toThrow();
    expect(new URL(link).protocol).toBe('https:');
  });

  it('GitHub link points at the expected profile', () => {
    expect(GITHUB_LINK).toBe('https://github.com/TimLeach635');
  });
});
