# API Endpoints Layer (`src/pages/api`)

This layer exposes server-rendered API endpoints for client components and external integration.

## Endpoints

- **AI Chat**:
  - `chat.ts` — Handles interactive prompt payloads, calling `@google/generative-ai` (Gemini API) and returning responses to the UI chat widget.
- **Bonus & Loyalty System**:
  - `bonus/generate.ts` — Generates a unique bonus claim code for a given organization & guest user.
  - `bonus/confirm.ts` — Confirms and redeems a pending bonus claim code.
  - `bonus/status/[code_id].ts` — Queries the current status of a specific bonus code.

## Rules

1. All API routes run server-side under Astro SSR.
2. Endpoints MUST validate incoming request body parameters and return standardized JSON error/success objects.
3. Keep database logic isolated within API handlers calling `src/lib/supabase.ts`.
