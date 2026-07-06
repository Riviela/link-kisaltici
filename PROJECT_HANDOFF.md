# Project Handoff

## Project Purpose

Canvas Links is a Linktree-style link-in-bio product. Users register, confirm email, create a public profile, manage links, customize profile appearance, and share a public profile URL.

## Tech Stack

- Next.js 16 App Router with React 19 and TypeScript
- Tailwind CSS 4 plus CSS Modules for feature-specific UI
- Supabase Auth, Postgres, RLS, SSR cookies, and Storage
- `@dnd-kit` for dashboard link drag-and-drop
- ESLint 9 with `eslint-config-next`

Important repo note: read `AGENTS.md` before editing Next.js code. This project uses a newer Next.js version with breaking changes; consult `node_modules/next/dist/docs/` for relevant APIs.

## How To Run Locally

Actual project repository path on this machine: `C:\Users\User\Desktop\canvaslinks`. Ignore the old `C:\Users\User\Desktop\link kısaltma` folder path.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example`.

3. Set environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase public/publishable client key.
   - `NEXT_PUBLIC_PROFILE_HOST`: optional host used to display profile URLs in dashboard/account UI. Recommended in production so display/share URLs use the real public domain instead of the local fallback.

4. Start development:

   ```bash
   npm run dev
   ```

5. Useful checks:

   ```bash
   npm run lint
   npm run build
   ```

Do not commit `.env.local` or real keys.

## Main Folders And Important Files

- `app/`: App Router pages, server actions, auth callback, dashboard, account, pricing, onboarding, and public profile route.
- `app/actions/auth.ts`: login, register, logout server actions.
- `app/actions/profile.ts`: profile creation, bio/social updates, appearance save action.
- `app/actions/links.ts`: link CRUD, active toggle, reorder, layout, thumbnail upload/remove actions.
- `components/dashboard/`: link manager, dashboard shell, Design editor, link cards, preview, account dropdown, modals.
- `components/profile/`: shared public profile presentation used by real public pages and dashboard preview.
- `components/account/`: account page shell, sidebar, deletion modal.
- `lib/profile/appearance.ts`: V1 appearance schema, defaults, theme presets, validation, color allowlist.
- `lib/links/`: link types, validation, layout, thumbnail helpers, current-link query.
- `lib/supabase/`: Supabase server/client/proxy clients.
- `supabase/migrations/`: forward-only database and Storage migrations.
- `docs/superpowers/specs/`: feature planning/spec documents.
- `next.config.ts`: includes `experimental.serverActions.bodySizeLimit = "3mb"` for thumbnail uploads up to the app's 2 MB limit.

## Implemented Features

- Landing page with username entry.
- Email/password registration with Supabase confirmation link.
- Auth callback and cookie-based session.
- Onboarding profile creation using pending username from auth metadata, with fallback username handling.
- Authenticated dashboard with fixed shell, announcement bar, 84px left rail, scrollable editor area, and fixed live preview.
- Link CRUD, activation switch, vertical drag-and-drop ordering, and URL validation.
- Link layout V1: `classic` and `featured`.
- Link thumbnail V1: JPG/PNG/WebP upload, replace, remove, canonical Storage path, preview cache-busting revision.
- Link card visual control panels for Layout, Thumbnail, Prioritize, Rules, Schedule, Lock, and Insights; only Layout/Thumbnail are functional.
- Public profile route at `/[username]`, including active-link filtering, avatar fallback, social links, share action, CTA/footer, appearance styles, and link thumbnails.
- Shared `PublicProfileSurface` used by public route and dashboard preview.
- Appearance Editor V1 inside `/dashboard` as client-side `content | design` state.
- Appearance themes, header layouts, wallpaper styles, text/font controls, button controls, colors, and saved-vs-draft preview behavior.
- Account page redesigned with announcement bar, sidebar, account info, privacy/security placeholders, owned profile card, and account deletion modal trigger.
- Dashboard hamburger account dropdown with account summary, `/account`, `/pricing`, inert support items, and real logout.
- Pricing page with static plan cards.

## Incomplete Features

- Payments/subscriptions are visual only; no Stripe or billing backend is wired.
- MFA, trusted devices, password creation, privacy settings, notifications, setup checklist persistence, and most account sidebar tools are inert.
- Appearance Editor Stickers/Footer are default-only or placeholder-level.
- Header image/logo upload, wallpaper image/video upload, custom CSS, advanced theme entitlements, and Enhance/AI tools are not implemented.
- Link card Prioritize/Rules/Schedule/Lock/Insights panels are mostly visual/inert.
- Thumbnail crop editor, drag-and-drop upload, automatic Open Graph image fetch, video thumbnails, and advanced featured variants are deferred.
- Public legal/report/about footer links are visual/simple links only unless routes are added later.

## Current Bugs Or Failing Areas

- Production failures have previously happened when remote Supabase migrations lagged behind code. In particular, missing `profiles.display_name` removal or missing `links.thumbnail_updated_at` caused onboarding or link queries to fail.
- The account page route exists at `/account`; if `/account` renders the public profile 404, check deployment freshness and route build output first.
- Some UI areas intentionally look clickable but are disabled/inert V1 placeholders; keep this distinction clear in future work.
- No automated end-to-end test suite is present. Most regressions have been found by manual dashboard/public-profile checks.

## Database, Auth, Payment, Deployment Status

- Database: Supabase Postgres with RLS enabled on `profiles` and `links`.
- Main tables: `profiles`, `links`.
- Storage buckets:
  - `avatars`: public avatar delivery with owner-scoped write/delete policies.
  - `link-thumbnails`: public delivery, owner-scoped insert/update/delete/select policies, 2 MB file limit, JPG/PNG/WebP only.
- Auth: Supabase email/password with confirmation link. No `SUPABASE_SERVICE_ROLE_KEY` or other server-only secret key is currently required by the app.
- Public reads: published profiles and active links are readable through RLS policies.
- Payments: pricing UI only; no payment provider integration.
- Deployment: repository remote is `https://github.com/Riviela/link-kisaltici.git`; Vercel deployment is expected from GitHub pushes. Ensure all migrations are applied to the connected Supabase project before deploying code that selects new columns.

## UI And Design System Notes

- Brand name: Canvas Links.
- Keep visible UI copy in English.
- Main app font is Schibsted Grotesk; appearance font allowlist is `schibsted-grotesk`, `system-sans`, `serif-soft`, `mono-quiet`.
- Dashboard shell conventions:
  - black announcement bar at top
  - fixed 84px left rail
  - desktop editor/preview split: editor 60%, preview 40%
  - only the middle editor area scrolls on desktop
  - right preview uses the shared public profile surface in dashboard-preview scale
- Public profile styling is driven by safe appearance tokens and enum-to-class mappings, not arbitrary CSS.
- Color inputs only allow `#RRGGBB`.
- Avoid hover scale, heavy shadows, or motion unless a new mockup explicitly calls for it.
- Feature mockups in `docs/superpowers/specs/` are important visual references.

## Important Architectural Decisions

- Server actions derive user identity from Supabase claims; browser-provided user IDs are not trusted.
- Public profile and dashboard preview share `PublicProfileSurface`; avoid forking separate profile UI.
- Dashboard preview uses local draft state for immediate feedback; public profile uses saved database state.
- Appearance is stored as versioned JSONB in `profiles.appearance` and normalized by `lib/profile/appearance.ts`.
- Link thumbnails store canonical Storage paths in DB, never public URLs.
- Thumbnail public URLs are generated at render time and include `thumbnail_updated_at` as a cache-busting version parameter.
- Link layout updates use a latest-update-wins client flow to avoid stale refreshes overwriting the user's newest choice.
- Migrations are forward-only; do not edit old migration files.

## Recommended Next Development Steps

1. Add a small regression checklist or Playwright tests for onboarding, dashboard link CRUD, appearance save, thumbnail replace/remove, and public profile render.
2. Add a deployment preflight that verifies remote Supabase migrations are applied before Vercel deploys.
3. Finish inert dashboard link panels one at a time, starting with real Schedule or Lock behavior only after data model and RLS planning.
4. Add real account settings only when backed by Supabase/Auth behavior; keep disabled placeholders inert until then.
5. Implement payment/subscription state before adding Pro locks or upgrade gating.
6. Improve observability for server-action failures with safe server logs that never expose secrets.
7. Keep `PROJECT_HANDOFF.md` updated after major schema, auth, deployment, or UI architecture changes.
