# Backend & Utility Layer (`src/lib`)

This layer owns database clients, anonymous user tracking, analytics wrappers, and utility logic.

## Modules

- `supabase.ts` — Supabase client initialization (`createClient`) using runtime environment variables (`SUPABASE_URL`, `SUPABASE_KEY`).
- `posthog.ts` — PostHog analytics client setup and event tracking helpers.
- `anon.ts` — Anonymous device / user identifier management for guest users claiming bonus codes.

## Rules

1. Read environment credentials from runtime `process.env`.
2. Keep client-side utility functions pure and free of unnecessary dependencies.
3. Server-side database actions with service keys MUST remain confined to API endpoints (`src/pages/api/`).
