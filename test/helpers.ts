import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parseHTML } from 'linkedom';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

type ContainerOptions = NonNullable<Parameters<typeof AstroContainer.create>[0]>;
// The container derives `Astro.site` from the manifest. Only `site` matters for
// these tests; the rest of the manifest is filled in with sensible defaults.
const SITE_MANIFEST = { site: 'https://tleach.uk' } as ContainerOptions['manifest'];

/**
 * Render an Astro component to an HTML string using the Container API.
 *
 * `options` accepts the same shape as `container.renderToString` — most
 * commonly `{ props }` and `{ slots }`.
 */
export async function renderComponent(
  Component: AstroComponentFactory,
  options: Parameters<AstroContainer['renderToString']>[1] = {},
): Promise<string> {
  // Mirror the production `site` so components that build canonical/social URLs
  // from `Astro.site` (e.g. BaseHead) render the same way they do in a build.
  const container = await AstroContainer.create({ manifest: SITE_MANIFEST });
  return container.renderToString(Component, options);
}

/**
 * Render an Astro component and return a parsed DOM `document` so tests can use
 * familiar query selectors instead of brittle string matching.
 */
export async function renderToDocument(
  Component: AstroComponentFactory,
  options: Parameters<AstroContainer['renderToString']>[1] = {},
): Promise<Document> {
  const html = await renderComponent(Component, options);
  // linkedom needs a full document to expose `querySelector` etc. on the body.
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`);
  return document as unknown as Document;
}
