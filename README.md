# JinoX AI — Full-Stack Prototype

A working Next.js + TypeScript build of the JinoX AI prototype system, for the Google.org
Impact Challenge: AI for Science proposal (Kenya, oral & craniofacial health).

This replaces the earlier single-file HTML demo with a real frontend/backend split:
React panels call live API routes, and a Supabase schema is included for moving from
seeded mock data to a persisted backend without changing the API contract.

## Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes (`app/api/**`)
- **Persistence (optional):** Supabase / Postgres, schema in `supabase/schema.sql`

## Panels

| Panel | Proposal layer | Backed by |
|---|---|---|
| Screening Tool | Layer 5, Low-Resource AI Diagnostics | `POST /api/risk/predict` |
| Fluorosis Intelligence | Layer 6, Climate-Health Intelligence | `GET /api/counties`, `GET /api/environment/fluoride` |
| Digital Twin | Layer 3, Digital Twin Simulation Engine | client-side simulation |
| Research API Explorer | Layers 1–2, Dataset & Foundational Model | all routes, called live |
| Program Dashboard | 18-month impact targets | `lib/data.ts` |

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Moving to a persisted backend

1. Create a Supabase project.
2. Run `supabase/schema.sql` against it (SQL editor or CLI).
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
4. Swap the mock reads in `app/api/**/route.ts` for calls through `lib/supabase.ts`.
   The response shapes are already designed to match the table columns, so this is a
   drop-in change per route, not a rewrite.

## Known dependency note

`npm audit` flags Next.js against a broad advisory range even at the latest 14.2.x
release (14.2.35, pinned here). Most of those advisories cover Server Actions, the
Image Optimization API, and Middleware, none of which this app uses. A clean fix
means moving to Next 16, which is a breaking upgrade to the App Router APIs this repo
is built on. Worth doing before any real deployment; not done here so the migration
gets its own review rather than happening silently in a scaffold commit.

## Notes

- All data is simulated. No real patient information is in this repo.
- `screenings` has no public read policy in the Supabase schema; patient-level data is
  never exposed through the anon key, matching the proposal's consent model.
- Not for clinical use.
