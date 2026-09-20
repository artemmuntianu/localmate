# Layout Shells Layer (`src/layouts`)

This layer provides HTML document shells wrapping Astro SSR pages.

## Layouts

- `BaseLayout.astro` — Main HTML document structure, viewport meta, fonts, Tailwind styles, and base HTML head tags.

## Rules

1. `BaseLayout.astro` is the root layout wrapper for all routes (`src/pages`).
2. Page titles, meta descriptions, and analytics initialization scripts (PostHog) must be passed or configured cleanly through props.
