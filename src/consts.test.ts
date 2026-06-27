import { describe, it, expect } from 'vitest';
import {
  SITE_TITLE,
  SITE_DESCRIPTION,
  MASTODON_LINK,
  TWITTER_LINK,
  GITHUB_LINK,
} from './consts';

// This is the one place where importing the constants is the point: each test
// pins a constant to its exact expected value, so any change to consts.ts must
// be reflected here deliberately.
describe('site constants', () => {
  it('SITE_TITLE is "Tim Leach"', () => {
    expect(SITE_TITLE).toBe('Tim Leach');
  });

  it('SITE_DESCRIPTION is "Tim Leach\'s website"', () => {
    expect(SITE_DESCRIPTION).toBe("Tim Leach's website");
  });

  it('MASTODON_LINK points at Tim\'s Mastodon profile', () => {
    expect(MASTODON_LINK).toBe('https://mastodon.social/@timleach');
  });

  it('TWITTER_LINK points at Tim\'s Twitter profile', () => {
    expect(TWITTER_LINK).toBe('https://twitter.com/TimLeach635');
  });

  it('GITHUB_LINK points at Tim\'s GitHub profile', () => {
    expect(GITHUB_LINK).toBe('https://github.com/TimLeach635');
  });

  it.each([
    ['MASTODON_LINK', MASTODON_LINK],
    ['TWITTER_LINK', TWITTER_LINK],
    ['GITHUB_LINK', GITHUB_LINK],
  ])('%s is a valid https URL', (_name, link) => {
    expect(() => new URL(link)).not.toThrow();
    expect(new URL(link).protocol).toBe('https:');
  });
});
