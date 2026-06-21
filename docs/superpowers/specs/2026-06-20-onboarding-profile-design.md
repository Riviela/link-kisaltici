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

`lib/profile/get-pending-username.ts` independently calls `getClaims()` and then `getUser()`. It accepts no browser-provided identity. It normalizes and validates `user_metadata.pending_username`, returning `null` only when the metadata is missing or fails the existing username syntax.

In the normal flow, the action does not read a username from the browser form. It validates the profile details and inserts only:

- `id`: verified `claims.sub`
- `username`: normalized, validated `pending_username` from the verified user's metadata
- `display_name`: trimmed
- `bio`: trimmed text, or `null` when blank

It does not send `avatar_path` or `is_published`, so database defaults and constraints remain authoritative.

## Validation

Browser and Server Action validation mirror the database limits:

- Metadata username: normalized and checked server-side against the existing 3-30 character username syntax.
- Fallback username: shown only when metadata is missing or invalid, or after a database username conflict; it uses the same browser and Server Action validation.
- Display name: required, trimmed, at most 80 characters, and not whitespace-only.
- Bio: optional, trimmed, and at most 280 characters.

The database remains the final source of truth, including reserved username and uniqueness constraints.

## Error and Race Handling

Duplicate username and reserved-username constraint failures map to `This profile URL is no longer available. Choose another one.` and enable the fallback username field. Raw Supabase and Postgres error text is never rendered.

When valid metadata exists, a submitted fallback value is ignored until the action first attempts the metadata username and receives a matching database constraint failure. This prevents browser input from replacing the registration username during the normal flow. A second insert may then use the validated fallback value.

If concurrent submissions race on the same authenticated user, a primary-key or unique failure triggers a fresh shared profile lookup. If the user's profile now exists, the action redirects to `/dashboard`. If no profile exists, the action returns the safe username-unavailable or generic profile-creation message as appropriate. Other database failures return a fixed safe English message.

## Client Form

`components/onboarding/profile-form.tsx` is a small Client Component using `useActionState`. In the normal flow it shows the selected `test.com/{username}` as read-only information and asks only for display name and optional bio. It shows the editable username field only for the defined fallback states. It provides safe English feedback, a disabled pending button, and `Processing...` while submitting. Success redirects on the server to `/dashboard`.

## Copy

All new user-facing text is added to `lib/copy.ts` in English. No localization system is introduced.

## Verification and Commit

Only `npm run lint` and `npm run build` run after implementation. After both pass, Git status is reviewed. Only onboarding-related paths are staged and committed with:

`feat: add onboarding profile creation flow`

Existing staged auth foundation, migration, skill, environment, secret, and generated local files are not intentionally added to this feature commit.
