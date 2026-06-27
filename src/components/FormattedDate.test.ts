import { describe, it, expect } from 'vitest';
import { renderToDocument } from '../../test/helpers';
import FormattedDate from './FormattedDate.astro';

describe('FormattedDate', () => {
  it('renders a <time> element', async () => {
    const doc = await renderToDocument(FormattedDate, {
      props: { date: new Date('2024-06-29T00:00:00Z') },
    });
    expect(doc.querySelector('time')).not.toBeNull();
  });

  it('sets the datetime attribute to the ISO string', async () => {
    const date = new Date('2024-06-29T12:34:56Z');
    const doc = await renderToDocument(FormattedDate, { props: { date } });
    expect(doc.querySelector('time')?.getAttribute('datetime')).toBe(date.toISOString());
  });

  it('formats the visible date in en-GB (day month year)', async () => {
    const doc = await renderToDocument(FormattedDate, {
      props: { date: new Date('2024-06-29T00:00:00Z') },
    });
    // en-GB short format: "29 Jun 2024"
    expect(doc.querySelector('time')?.textContent?.trim()).toBe('29 Jun 2024');
  });
});
