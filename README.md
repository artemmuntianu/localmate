# LocalMate

**A mobile-first digital loyalty and dining companion for coworking spaces.**
Members browse today's lunch menus and partner offers, claim a bonus code and
find cafes on a map; staff confirm that code from a QR scan or by typing it in.

![Astro 6](https://img.shields.io/badge/Astro-6-FF5D01?logo=astro&logoColor=white)
![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind 3](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)

## Contents

- [What it does](#what-it-does)
- [Routes](#routes)
- [Architecture](#architecture)
- [How a bonus is claimed and redeemed](#how-a-bonus-is-claimed-and-redeemed)
- [Key engineering decisions](#key-engineering-decisions)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Project layout](#project-layout)
- [Good to know](#good-to-know)
- [Documentation map](#documentation-map)

## What it does

Two audiences share one small app:

- **Members** open the coworking space's portal at `/<org-slug>`: a welcome
  screen, today's offers from each partner cafe, a cafe detail view with its menu,
  bonus, opening hours, phone number and photo gallery, an interactive map of
  nearby partners, and a floating AI concierge that can answer questions about
  the space and recommend a place to eat.
- **Staff** open the redemption screen for their cafe at `/<partner-slug>/qr`.
  The member shows a 6-digit code and an on-screen QR code; staff either scan it
  or type the number in by hand, then the bonus is confirmed once.

No account and no login: a member is identified by an anonymous id stored in the
browser.

## Routes

| Route | Audience | Purpose |
|---|---|---|
| `/<org-slug>` | members | the portal shell (Home / Offers / Map tabs, plus the cafe detail sub-view) |
| `/<partner-slug>/qr` | staff | confirm a bonus code, by QR scan (`?code=<code-id>`) or manual entry |
| `POST /api/chat` | portal | one AI concierge reply |
| `POST /api/bonus/generate` | members | return the member's unused code, or create one |
| `POST /api/bonus/confirm` | staff | confirm a code (idempotent) |
| `GET /api/bonus/status/{code_id}` | members | poll whether a code has been confirmed |

## Architecture

```
Browser (installable PWA)
  |
  |  Astro SSR pages (output: server)      React islands (client:load)
  v
Astro server on Node (@astrojs/node, standalone)
  |- /<org-slug> ........ Supabase: organizations, partners, daily_menus, faqs
  |- /<partner-slug>/qr . Supabase: partners, bonus_codes
  |- /api/bonus/* ....... Supabase: bonus_codes (generate / confirm / status)
  |- /api/chat .......... Google Gemini (system prompt built from live data)
  |- map tiles .......... OpenStreetMap via Leaflet
  `- analytics ......... PostHog, only after the member opts in
```

Two rules keep this simple: pages are server-rendered, and the browser never
talks to Supabase itself. Every database read and write happens on the server,
in the SSR page or in an API route.

## How a bonus is claimed and redeemed

1. On the **Offers** tab the member taps a cafe, which opens its detail view and
   the claim button.
2. The client calls `POST /api/bonus/generate` with the partner id and any code id
   already saved on this device for that partner.
3. The server reuses that code when it is still unconfirmed; otherwise it creates a
   new 6-digit code for the partner.
4. The code is shown in a modal together with a QR code that encodes
   `/<partner-slug>/qr?code=<code-id>` on the same origin, and the client starts
   polling `GET /api/bonus/status/<code-id>`.
5. Staff scan the QR or type the 6-digit number at `/<partner-slug>/qr`, which
   calls `POST /api/bonus/confirm`.
6. Confirmation updates the row only when it is still unconfirmed, so a code can
   never be redeemed twice and a double tap cannot double count.
7. When the poll sees the confirmation, the modal switches to the success state. A
   reusable bonus clears itself for the next visit; a one-time bonus is marked as
   used on that device.

Each partner decides this behaviour with the `partners.bonus_reusable` flag.

## Key engineering decisions

### Data access stays on the server

The publishable Supabase key and all queries live in server code, behind
`src/lib/supabase.ts`; the UI talks to the app's own routes. That keeps the data
rules in one place and means a client island can never invent a write path.

### Reuse the member's code instead of creating duplicates

`/api/bonus/generate` first looks for the code stored on the device. If that code
is still unconfirmed, the server returns it unchanged. Repeated taps and page
reloads therefore cannot flood the table with codes the member never used.

### Confirming a code can only work once

The confirm query carries the condition `confirmed_at IS NULL`, so the second
request is a no-op instead of a second redemption. The member client can poll the
status endpoint to close the loop without a websocket.

### The concierge answers from live data

`/api/chat` rebuilds its system prompt for every request from the current menus,
the space's FAQs and its partner list, so answers follow today's data instead of a
prompt baked at deploy time. Replies use a small contract - cafe names are wrapped
in `[[double brackets]]` - which the widget turns into tappable links that open
that cafe's detail view.

### No accounts, but still trackable

A member is a random id kept in `localStorage`, created on first use. It is enough
to remember their own bonus codes without collecting an email, a name or a
password.

### Analytics is opt-in

The privacy notice decides whether PostHog is loaded at all
(`lm_analytics_enabled`), and the choice is remembered for the next visit. With no
key configured, the analytics script simply never loads.

### Numbered, append-only migrations

Schema changes are new numbered files in `supabase/migrations`, never edits to an
existing one, so any environment can be rebuilt by replaying them in order.

### One-way layer boundaries

`components/` render and fetch, `pages/api/` hold the rules and the database
access, `lib/` holds the shared clients and utilities. Styles stay as Tailwind
utility classes. Each layer documents its own rules in a local `AGENTS.md`.

## Tech stack

| Concern | Technology |
|---|---|
| Framework | Astro 6 with the Node adapter, `output: server` (SSR) |
| Interactivity | React 18 islands, marked explicitly with `client:load` |
| Language | TypeScript, `astro/tsconfigs/strict` |
| Styling | Tailwind CSS 3 |
| Data | Supabase (Postgres) via `@supabase/supabase-js` |
| AI | Google Gemini via `@google/generative-ai` |
| Map | Leaflet with OpenStreetMap tiles |
| Analytics | PostHog, opt-in |
| App shell | Web app manifest, theme colour, installable icons |

## Getting started

### 1. Prerequisites

- Node.js 20 or newer
- A Supabase project (the free tier is enough)
- A Gemini API key for the chat widget

### 2. Install

```bash
npm install
```

### 3. Create the database

Run the files in `supabase/migrations/` **in numeric order** against your project
(the Supabase SQL editor or the Supabase CLI). Migration `0005` makes
`partners.slug` mandatory, so fix any partner row without a slug before running it.

### 4. Configure

```bash
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Fill in at least the two Supabase values; see the table below.

### 5. Run

```bash
npm run dev                 # http://localhost:4321
```

Then open `/<org-slug>`, using the `slug` of a row in `organizations`.

### 6. Build for production

```bash
npm run build               # astro build -> dist/
npm run preview             # preview the build locally
npm start                   # run the built Node server (dist/server/entry.mjs)
```

## Environment variables

| Variable | Needed | Purpose |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | yes | publishable key used by the single server-side client |
| `GEMINI_API_KEY` | for chat | Gemini key for `/api/chat` |
| `PUBLIC_POSTHOG_KEY` | no | analytics project key; analytics stays off when it is empty |
| `PUBLIC_POSTHOG_HOST` | no | PostHog host, for example `https://app.posthog.com` |

`.env` is git-ignored. Never commit real keys.

## Database

The migrations build up this schema:

| Tables | Added by | Holds |
|---|---|---|
| `organizations`, `partners`, `daily_menus`, `redemptions` | 0001 | the space, its partner cafes, one menu row per cafe per day, and the original redemption log plus a `claim_bonus()` RPC |
| map and branding columns + `faqs` | 0002 | coordinates for the map, logo and welcome text, and the FAQ knowledge base the chat reads |
| cafe detail columns | 0003 | phone, opening hours, cover photo and gallery |
| `bonus_reusable` + `bonus_codes` | 0004 | the reusable/one-time flag and the codes themselves, with a `confirmed_at` timestamp and no expiry |
| `partners.slug` | 0005 | the slug used in the staff QR url |

## Project layout

```
supabase/migrations/  numbered SQL migrations (append-only)
src/lib/              supabase client, anonymous id, analytics helper
src/layouts/          BaseLayout.astro (manifest, privacy notice, analytics gate)
src/components/       React islands: tabs, offers, cafe detail, claim flow, map, chat
src/pages/api/        chat and bonus endpoints (the only server surface)
src/pages/            Astro SSR routes: /[org_slug] and /[org_slug]/qr
public/               icons and the web app manifest
```

## Good to know

- **Content is managed in Supabase.** There is no admin UI yet: organizations,
  partner cafes, daily menus, FAQs and bonus settings are edited in the Supabase
  table editor or with SQL.
- **QR images come from a third-party service** (`api.qrserver.com`), so the claim
  modal needs outbound internet.
- **No automated test suite is configured.** The gates are the strict TypeScript
  compile and a clean `npm run build`.
- Commands must be run as `npm run <script>`; `npm dev` and `npm build` shorthand do
  not exist.

## Documentation map

| File | Owns |
|---|---|
| `AGENTS.md` | the project map for contributors and coding agents: commands, layers, traps |
| `CONSTITUTION.md` | canonical architecture, tech stack and invariants |
| `docs/AGENTS.md` | which document owns what |
| `src/components/AGENTS.md`, `src/layouts/AGENTS.md`, `src/lib/AGENTS.md`, `src/pages/api/AGENTS.md`, `supabase/AGENTS.md` | the rules for one layer each |