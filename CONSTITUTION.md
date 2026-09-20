# Project Constitution — LocalMate

> **Canonical source of truth for LocalMate's architecture, layers, and intent.**
> Every agent must read this before modifying code.

## 1. What this app is

**LocalMate** is an Astro 6 SSR application providing interactive digital loyalty, bonus claim flows, AI-powered assistant chat, maps, and partner organization portals.

Main capabilities:
- **Partner Organization Portal** (`/[org_slug]`): View menus, offers, cafe details, partner cards, and claim loyalty bonus codes.
- **QR Code View** (`/[org_slug]/qr`): Display organization QR codes for customer scanning.
- **Smart AI Chat Widget** (`SmartChatWidget` / `AIChatWidget`): Gemini-powered AI assistant interacting via `/api/chat`.
- **Bonus & Loyalty API System** (`/api/bonus/*`): Code generation, confirmation, and status tracking backed by Supabase.

## 2. Tech stack (source of truth: `package.json`)

- Astro **6.2.1**, **Node adapter** (`@astrojs/node`), `output: 'server'`.
- React **18.3** (client islands), Tailwind **3.4** (`tailwindcss`, `autoprefixer`).
- TypeScript **strict**, `moduleResolution: bundler`.
- `@supabase/supabase-js` (database metadata & loyalty backend) + `@google/generative-ai` (Gemini API for chat).
- Leaflet **1.9** (`leaflet`, `@types/leaflet`) for map rendering.
- PostHog **1.201** (`posthog-js`) for user analytics.

## 3. Layered architecture (bottom ↑ top)

```
supabase/           ← database schema and migrations
src/lib/            ← shared backend clients & analytics (supabase.ts, posthog.ts, anon.ts)
src/layouts/        ← HTML layout shells (BaseLayout.astro)
src/components/     ← React islands & Astro UI components (chat, bonus, map, tabs)
src/pages/api/      ← API endpoints (chat, bonus workflow)
src/pages/          ← Astro SSR routes ([org_slug])
```

## 4. Invariants & Security Rules

1. **API Endpoints handle database operations.** Client components use fetch helpers to interact with `/api/bonus/*` and `/api/chat`.
2. **Environment credentials** (`SUPABASE_URL`, `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) are read at runtime via environment variables (`process.env`). `.env` is git-ignored and MUST NEVER be committed.
3. **No strict React hooks violations.** Maintain clean client island boundaries for interactive components (`BonusClaimFlow`, `SmartChatWidget`, `MapTab`).
4. **TypeScript Strictness.** Pass type checks cleanly without introducing unhandled `any` types.

## 5. Keeping this doc in sync

- Update `CONSTITUTION.md` whenever architectural boundaries, new third-party integrations, or core invariants change.
- Each layer directory (`src/components`, `src/layouts`, `src/lib`, `src/pages/api`, `supabase`, `docs`) owns its own `AGENTS.md`.
