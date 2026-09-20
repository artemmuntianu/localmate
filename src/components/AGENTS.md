# UI Components Layer (`src/components`)

This layer contains React client islands and Astro UI components for LocalMate.

## Components Map

- **AI & Smart Chat**:
  - `SmartChatWidget.tsx` / `AIChatWidget.tsx` — Gemini AI assistant floating widget interacting with `/api/chat`.
- **Bonus & Loyalty Flow**:
  - `BonusClaimFlow.tsx` — Interactive bonus code claim modal & flow calling `/api/bonus/*`.
- **Organization & Partner Views**:
  - `OrgTabShell.tsx` — Main tab navigation shell for partner organization views (`/[org_slug]`).
  - `HomeTab.tsx`, `MenusTab.tsx`, `OffersTab.tsx`, `CafeDetailView.tsx` — Content views rendered within organization tabs.
  - `PartnerCard.astro` — Astro card component for partner organization summaries.
  - `ImageGallery.tsx` — Photo gallery for organization locations & menus.
- **Maps & Utilities**:
  - `MapTab.tsx` — Leaflet interactive map tab showing location pins.
  - `BottomNav.tsx` — Mobile bottom navigation bar.
  - `GdprModal.tsx` — Consent & privacy modal.

## Rules

1. Client islands MUST be marked explicitly in Astro pages (e.g. `client:load` / `client:idle` / `client:only="react"`).
2. UI components do not query Supabase directly; call backend API endpoints (`/api/bonus/*`, `/api/chat`) via fetch helpers.
3. Keep styling inline using Tailwind CSS utility classes.
