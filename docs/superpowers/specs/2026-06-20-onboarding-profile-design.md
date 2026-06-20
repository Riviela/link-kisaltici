# Onboarding Profile Creation Design

## Scope

Add only authenticated onboarding and initial profile creation. Links, avatars, public profiles, analytics, settings, localization, API routes, and database migrations remain out of scope.

## Shared Profile Lookup

`lib/profile/get-current-profile.ts` imports `server-only`, creates its own Supabase server client, and calls `auth.getClaims()`. It accepts no user ID or client-provided identity. The authenticated user ID comes only from a nonempty string `claims.sub`.

The helper selects only `id`, `username`, and `display_name` from `public.profiles` for the verified user. It returns an object containing the verified user ID and `profile`, where `profile` is `null` only when an authenticated user has no row. Missing claims produce a controlled authentication error. Supabase query failures produce a separate controlled server error and are never treated as a missing profile or exposed raw to the user.

## Route Flow

`/onboarding` calls the shared helper. Missing authentication redirects to `/login`; an existing profile redirects to `/dashboard`; an authenticated user without a profile sees the form.

`/dashboard` calls the same helper. Missing authentication redirects to `/login`; a missing profile redirects to `/onboarding`; an existing profile renders the dashboard. The dashboard shows `Welcome, {display name}`, `@username`, a fixed message that link management is coming next, and the existing logout action.

The root `proxy.ts` matcher adds `/onboarding`. The proxy remains a fast cookie-refresh and redirect layer only; page-level checks remain authoritative.

## Profile Creation Action

`app/actions/profile.ts` exports `createProfileAction(previousState, formData)`. It calls the shared profile helper before validation and insert. Existing profiles redirect to `/dashboard`. Unauthenticated calls return a safe English authentication message.

The action validates and normalizes form values, then inserts only:

- `id`: verified `claims.sub`
- `username`: trimmed and lowercased
- `display_name`: trimmed
- `bio`: trimmed text, or `null` when blank

It does not send `avatar_path` or `is_published`, so database defaults and constraints remain authoritative.

## Validation

Browser and Server Action validation mirror the database limits:

- Username: 3-30 characters, lowercased before save, first character alphanumeric, remaining characters lowercase letters, numbers, or underscores.
- Display name: required, trimmed, at most 80 characters, and not whitespace-only.
- Bio: optional, trimmed, and at most 280 characters.

The database remains the final source of truth, including reserved username and uniqueness constraints.

## Error and Race Handling

Duplicate username and reserved-username constraint failures map to `This username is not available. Please choose another one.` Raw Supabase and Postgres error text is never rendered.

If concurrent submissions race on the same authenticated user, a primary-key or unique failure triggers a fresh shared profile lookup. If the user's profile now exists, the action redirects to `/dashboard`. If no profile exists, the action returns the safe username-unavailable or generic profile-creation message as appropriate. Other database failures return a fixed safe English message.

## Client Form

`components/onboarding/profile-form.tsx` is a small Client Component using `useActionState`. It provides browser constraints, safe English feedback, a disabled pending button, and `Processing...` while submitting. Success redirects on the server to `/dashboard`.

## Copy

All new user-facing text is added to `lib/copy.ts` in English. No localization system is introduced.

## Verification and Commit

Only `npm run lint` and `npm run build` run after implementation. After both pass, Git status is reviewed. Only onboarding-related paths are staged and committed with:

`feat: add onboarding profile creation flow`

Existing staged auth foundation, migration, skill, environment, secret, and generated local files are not intentionally added to this feature commit.
