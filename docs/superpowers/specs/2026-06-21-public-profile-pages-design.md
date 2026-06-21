# Public Profile Pages Design

## Goal

Add a public, mobile-first profile at `/{username}` and a compact dashboard control that lets an authenticated owner publish or unpublish that profile. New profiles remain private because the existing database default for `profiles.is_published` is unchanged.

## Scope

This feature includes:

- A dynamic public profile route.
- Published profile and active link reads through the existing RLS policies.
- A dashboard visibility control.
- A profile publish/unpublish Server Action.
- A shared public profile query helper and focused presentation components.
- A useful global 404 page.

It does not include settings, profile editing, avatar uploads, themes, analytics, QR codes, localization, API routes, schema changes, or migrations.

## Route Behavior

`app/[username]/page.tsx` is a Server Component. Static application routes such as `/login`, `/register`, `/dashboard`, `/onboarding`, and `/auth/*` are matched by Next.js before the dynamic `/{username}` route. Reserved usernames remain useful defense in depth, but route safety does not depend on that database constraint alone.

The route normalizes the segment to lowercase and validates it against the existing username shape before querying. Invalid values call `notFound()` immediately. A missing or private profile also calls `notFound()`.

Database failures are not treated as missing profiles. The server helper throws a controlled internal error without exposing Supabase or Postgres details to the visitor.

## Public Data Flow

`getPublicProfile(username)` creates the existing server Supabase client and performs two focused reads:

1. Read one profile with `username = normalizedUsername` and `is_published = true`, selecting only `id`, `username`, `display_name`, and `bio`.
2. If the profile exists, read links with that profile ID and `is_active = true`, selecting only `id`, `title`, `url`, and `position`, ordered by `position ASC, id ASC`.

The helper returns `null` only when no published profile exists. It returns the profile and ordered links on success and throws a controlled lookup error on query failure.

No authentication check or service-role key is used. For a signed-out request, the publishable key executes through the `anon` role. Existing `profiles_anon_read` and `links_anon_read` policies enforce public visibility. Explicit query filters mirror the RLS predicates for performance and ensure the same public behavior even when the visitor already has an authenticated cookie.

## Publishing Control

The dashboard loads `is_published` as part of `getCurrentProfile()`. A small `ProfileVisibilityControl` Client Component sits beside the profile identity in the dashboard header card.

It shows one status and one action:

- `Published` with `Unpublish profile`.
- `Private` with `Publish profile`.

The control uses `useActionState` and submits only the requested boolean state. It never submits or accepts a user ID or username as authority. While pending, the button is disabled and displays `Processing...`.

`updateProfileVisibilityAction` lives in `app/actions/profile.ts` and:

1. Creates the server Supabase client.
2. Calls `auth.getClaims()` and reads a valid `claims.sub`.
3. Validates the submitted visibility value.
4. Updates only `is_published` on the row where `profiles.id = claims.sub`.
5. Selects `username` and `is_published` from the updated row.
6. Revalidates `/dashboard` and `/${username}`.
7. Returns a typed, safe English result.

The existing authenticated owner SELECT and UPDATE RLS policies remain the database authorization boundary. A missing row or database error produces a generic safe failure message.

## Components And Visual Direction

The existing product palette remains the source of truth:

- Canvas cream: `#FBF7EE`
- Deep navy: `#101B35`
- Signal orange: `#FF6B2C`
- Paper white: `#FFFFFF`
- Muted slate: `#64748B`

The public page uses a narrow mobile canvas with generous vertical rhythm. The profile header has a simple monogram placeholder, display name, optional bio, and `@username`. Link buttons use paper-white surfaces, navy type, and one orange circular arrow marker. That marker is the page's single signature element; decoration elsewhere stays quiet.

Typography continues the current application stack to avoid adding packages. Visible focus rings, large touch targets, semantic headings, and reduced-motion-safe transitions are required.

Independent components:

- `PublicProfile`: page composition and empty state.
- `ProfileHeader`: monogram placeholder, name, username, and optional bio.
- `PublicLinkButton`: one normal external anchor without forced new-tab behavior.
- `ProfileVisibilityControl`: dashboard-only client state and publish action.

## English Copy

Dashboard visibility:

- `Published`
- `Private`
- `Publish profile`
- `Unpublish profile`
- `Processing...`
- `Your profile is now public.`
- `Your profile is now private.`
- `We could not update profile visibility. Please try again.`

Public profile and 404:

- `No links have been published yet.`
- `Profile not found`
- `This profile is unavailable or has not been published.`
- `Return home`

All fixed user-facing strings remain centralized in `lib/copy.ts`.

## File Plan

New files:

- `app/[username]/page.tsx`
- `app/not-found.tsx`
- `components/profile/profile-header.tsx`
- `components/profile/public-link-button.tsx`
- `components/profile/public-profile.tsx`
- `components/dashboard/profile-visibility-control.tsx`
- `lib/profile/get-public-profile.ts`
- `lib/profile/public-username.ts`

Updated files:

- `app/actions/profile.ts`
- `app/dashboard/page.tsx`
- `lib/profile/get-current-profile.ts`
- `lib/profile/validation.ts`
- `lib/copy.ts`

No package or lockfile change is expected.

## Failure Behavior

- Invalid username: 404 without a database query.
- Missing or private profile: 404.
- Public profile query failure: controlled server error, not a false 404.
- Publish action without valid claims: safe session-expired message.
- Unauthorized or missing owner row: generic visibility failure.
- Public links query returns no rows: published profile with an English empty state.
- No raw Supabase or Postgres message reaches the browser.

## Manual Verification

1. A new profile remains `Private` and its public URL returns 404.
2. Publishing changes the dashboard status to `Published` and makes `/{username}` available without signing in.
3. Unpublishing changes the status to `Private` and the public URL returns 404 again.
4. A signed-in owner cannot use the public route to view a private profile.
5. Only active links appear, ordered by `position ASC, id ASC`.
6. A null bio renders no empty bio element.
7. A published profile with no active links shows the empty-state copy.
8. `http`, `https`, `mailto`, and `tel` links use normal anchor behavior.
9. Invalid and unknown usernames return the custom 404 page.
10. Static application routes continue to resolve before `[username]`.
11. The public layout remains usable at narrow mobile widths and with keyboard navigation.

## Verification And Commit

Run only:

- `npm run lint`
- `npm run build`

Stage only the public profile, publish control, design note, and any directly required package or lockfile changes. Commit with:

`feat: add public profile pages`
