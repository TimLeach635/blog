/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

// `getViteConfig` wires up Astro's Vite plugins so that tests can resolve
// virtual modules such as `astro:content` and render `.astro` components via
// the Container API.
export default getViteConfig({
  test: {
    // jsdom-style DOM parsing is handled per-test with linkedom; we only need
    // a node environment here.
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,js}', 'test/**/*.{test,spec}.{ts,js}'],
    globals: true,
  },
});
