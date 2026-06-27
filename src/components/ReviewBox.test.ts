import { describe, it, expect } from 'vitest';
import { renderToDocument } from '../../test/helpers';
import ReviewBox from './ReviewBox.astro';

const baseProps = {
  gameName: 'Cultist Simulator',
  categoryScores: [
    { category: 'Look and feel', score: 8 },
    { category: 'Immersion', score: 9 },
    { category: 'Gameplay', score: 7 },
  ],
  totalScore: 8,
  image: '/blog/portrait.png',
  imageAltText: 'The game logo',
};

describe('ReviewBox', () => {
  it('renders the game name as a heading', async () => {
    const doc = await renderToDocument(ReviewBox, { props: baseProps });
    expect(doc.querySelector('h2')?.textContent).toBe('Cultist Simulator');
  });

  it('renders one list item per category score', async () => {
    const doc = await renderToDocument(ReviewBox, { props: baseProps });
    const items = doc.querySelectorAll('.review-box__category-score-item');
    expect(items.length).toBe(baseProps.categoryScores.length);
  });

  it('renders each category name alongside its score', async () => {
    const doc = await renderToDocument(ReviewBox, { props: baseProps });
    const items = [...doc.querySelectorAll('.review-box__category-score-item')];
    const rendered = items.map((li) => ({
      category: li.querySelector('.review-box__category-name')?.textContent,
      score: li.querySelector('.review-box__category-score')?.textContent,
    }));
    expect(rendered).toEqual([
      { category: 'Look and feel', score: '8' },
      { category: 'Immersion', score: '9' },
      { category: 'Gameplay', score: '7' },
    ]);
  });

  it('renders the total score', async () => {
    const doc = await renderToDocument(ReviewBox, { props: baseProps });
    expect(doc.querySelector('.review-box__total-words')?.textContent).toBe('Total');
    expect(doc.querySelector('.review-box__total-score')?.textContent).toBe('8');
  });

  it('renders the image with its src and alt text', async () => {
    const doc = await renderToDocument(ReviewBox, { props: baseProps });
    const img = doc.querySelector('img.review-box__image');
    expect(img?.getAttribute('src')).toBe('/blog/portrait.png');
    expect(img?.getAttribute('alt')).toBe('The game logo');
  });

  it('handles an empty category list without rendering any items', async () => {
    const doc = await renderToDocument(ReviewBox, {
      props: { ...baseProps, categoryScores: [] },
    });
    expect(doc.querySelectorAll('.review-box__category-score-item').length).toBe(0);
    // The total should still render even with no categories.
    expect(doc.querySelector('.review-box__total-score')?.textContent).toBe('8');
  });

  it('renders a score of 0 rather than omitting it', async () => {
    const doc = await renderToDocument(ReviewBox, {
      props: {
        ...baseProps,
        categoryScores: [{ category: 'Bugs', score: 0 }],
        totalScore: 0,
      },
    });
    expect(doc.querySelector('.review-box__category-score')?.textContent).toBe('0');
    expect(doc.querySelector('.review-box__total-score')?.textContent).toBe('0');
  });
});
