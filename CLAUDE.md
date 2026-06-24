# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Keeping this file up to date

**Update this file whenever you discover something non-obvious about the codebase** — a gotcha, a pattern, a constraint, or anything that cost you time to figure out. Keep entries concise. This file is read by lower-powered models, so be explicit rather than assuming context.

## Collaboration mode

**Always ask clarifying questions before making assumptions.** If a task is ambiguous — which component to edit, whether a new post needs a particular field, what score breakdown a review should use — stop and ask rather than guessing. Keep the gap between receiving a task and asking any questions short. If multiple things are unclear, ask them all at once as a numbered list — this is preferred over asking one at a time, as it lets the human respond to everything in one go.

## Git workflow

- **All development must happen on feature branches**, never directly on `main`.
- Branch naming: use descriptive kebab-case names, e.g. `add-review-box-responsive` or `new-post/game-title`.
- When work is ready, raise a pull request. Do not push straight to `main`.
- `main` is deployed automatically to production (tleach.uk) via GitHub Actions on every push.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>

<optional body>

Co-Authored-By: <Model Name> <noreply@anthropic.com>
```

Common types: `feat`, `fix`, `style`, `refactor`, `content` (for new/edited blog posts), `chore`.

**Every commit must include a `Co-Authored-By` trailer** that names the AI model that wrote the code. Use the model's marketing name (e.g. `Claude Sonnet 4.6`), not a generic placeholder. Example:

```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Commands

```bash
npm run dev            # Dev server at localhost:4321 (hot reload)
npm run build          # Type-check (astro check) then build to ./dist/
npm run preview        # Serve the built ./dist/ locally
npm test               # Run the Vitest suite once
npm run test:watch     # Run Vitest in watch mode
npm run test:coverage  # Run the suite with a V8 coverage report
```

There is no separate lint step — `astro check` (bundled into `build`) is the type checker. Always run `npm run build` before raising a PR to confirm the type check passes.

### Tests

Tests use [Vitest](https://vitest.dev) and run in two layers:

- **Unit tests** live next to the code as `*.test.ts` (e.g. `src/components/ReviewBox.test.ts`) and in `test/`. Astro components are rendered with Astro's experimental Container API via the `test/helpers.ts` `renderComponent`/`renderToDocument` helpers, then queried with `linkedom`.
- **An end-to-end build test** (`test/build.test.ts`) runs `astro build` once in `beforeAll` and asserts on the generated `dist/` HTML and RSS — this is the only way to cover `BaseHead` and anything that reads `Astro.site` (see gotcha below).

Gotchas worth knowing:

- **`Astro.site` is unavailable in the Container API.** Astro's container derives `Astro.site` from the manifest, but `createManifest` drops the `site` field, so `Astro.site` is always `undefined` in unit tests. Components that read it (like `BaseHead`, which throws on `new URL(path, undefined)`) can only be tested through the build-output test.
- **Vitest version must match Astro's Vite.** Astro 6 ships Vite 7, so Vitest 4+ is required — older Vitest bundles Vite 5 and fails at startup with `Cannot read properties of undefined (reading 'ssr')`.
- **The content schema is exported.** `blogSchema` is exported from `src/content.config.ts` so it can be unit-tested and reused to validate the real post files on disk (`test/content.test.ts`).
- Post URLs come from `post.id` (the filename without extension), **not** `post.slug` — `slug` is `undefined` with the glob loader in Astro 5/6.

## Architecture

This is an [Astro](https://astro.build) static site. Strict TypeScript is enabled (`astro/tsconfigs/strict` + `strictNullChecks`).

### Content layer

Blog posts live in `src/data/blog/` as `.md` or `.mdx` files. They are surfaced via Astro's content collections API (configured in `src/content.config.ts`). The collection is named `blog` and uses a glob loader, so any file matching `**/[^_]*.{md,mdx}` in that directory is automatically a post.

**Required frontmatter fields:**
```yaml
title: string
description: string
pubDate: date  # e.g. "Jun 29 2024"
```

**Optional frontmatter fields:**
```yaml
updatedDate: date
heroImage: string        # path relative to public/, e.g. "/blog/image.png"
heroImageAltText: string # required if heroImage is set — accessibility matters
tags: string[]
```

### Pages and routing

- `src/pages/index.astro` — home page
- `src/pages/blog/index.astro` — blog index listing
- `src/pages/blog/[...slug].astro` — individual post pages (driven by content collection)
- `src/pages/about.astro` — about page
- `src/pages/rss.xml.js` — RSS feed

### Layout and components

`src/layouts/BlogPost.astro` is the single layout for all blog posts. It pulls in `BaseHead`, `Header`, `Footer`, and `FormattedDate`, and renders tags sorted alphabetically.

`src/components/ReviewBox.astro` is a purpose-built component for game reviews. It accepts `gameName`, `categoryScores` (array of `{ category: string, score: number }`), `totalScore`, `image`, and `imageAltText`. Its styles live in `src/styles/reviewBox.css`. To use it in an `.mdx` post:

```mdx
import ReviewBox from "../../components/ReviewBox.astro";

<ReviewBox
  gameName="Game Title"
  categoryScores={[
    { category: "Look and feel", score: 8 },
    { category: "Gameplay", score: 7 },
  ]}
  totalScore={8}
  image="/blog/image.png"
  imageAltText="Alt text"
/>
```

### Static assets

Images and other static files go in `public/`. Blog-specific images are conventionally placed in `public/blog/` and named with the post date prefix, e.g. `public/blog/2024-06-29-screenshot-1.png`.

### Global config

Site-wide constants (title, description, social links) are in `src/consts.ts`. The production URL (`https://tleach.uk`) is set in `astro.config.mjs`.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `main` using the official `withastro/action`. The custom domain is configured via `public/CNAME`.
