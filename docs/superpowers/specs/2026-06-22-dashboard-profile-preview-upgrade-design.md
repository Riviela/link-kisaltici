# Dashboard Profile and Preview Upgrade Design

## Goal

Unify dashboard profile editing, live preview, and public profile presentation around `@username`. Remove `display_name` without changing authentication, ownership rules, public routing, link CRUD, publication behavior, or reorder persistence.

## Database Change

Create one new forward-only Supabase migration. It drops `public.profiles.display_name`; existing migrations remain unchanged. No RLS policy, Storage policy, function, trigger, grant, or other column changes.

All profile reads and writes stop selecting or inserting `display_name` before the migration is applied. Profile creation inserts only the authenticated user ID, validated username, and nullable bio. Existing username and bio constraints remain the database source of truth.

## Profile Identity and Avatar

Every product surface identifies the user as `@username`. Bio appears below it only when non-null and non-empty. No bio placeholder appears.

Profile reads select `avatar_path`. A shared server helper accepts only the database-approved path shape `<profile-id>/avatar.(jpg|jpeg|png|webp)` and asks the public `avatars` bucket for its public URL. Missing, invalid, or unresolvable paths return `null`.

A shared client avatar component renders the image when a URL exists. Image load failure switches to the same neutral anonymous SVG icon used by dashboard, preview, and public profile. No upload UI or new Storage write behavior is introduced.

## Dashboard Composition

The existing navigation rail and top product bar remain. The large Welcome panel is removed.

`LinkManager` becomes the client workspace owner because it already owns the authoritative local link list used by live preview. It additionally owns local profile bio state and renders:

1. Left column: compact clickable `@username` profile header, optional bio, publish/private control, add-link form, and sortable link list.
2. Right column: URL/share control and live phone preview.

Desktop grid uses approximately `3fr / 1fr`. The preview column has a thin full-height left border and a sticky inner preview positioned near the top. Mobile uses one column, removes the vertical border, places preview below content, and prevents horizontal overflow.

## Profile Details Modal

Clicking `@username` opens a focused client modal:

- Title: `Profile details`
- Readonly identity: `@username`
- Description: `Add a short line to introduce yourself.`
- Editable bio textarea, maximum 280 characters
- Actions: `Cancel`, `Save changes`

`updateProfileBioAction(previousState, formData)` calls `auth.getClaims()`, rejects missing `claims.sub`, validates and trims bio, converts an empty value to `null`, and updates only the authenticated owner's `bio`. It never accepts a user ID from the browser. RLS remains an additional ownership boundary.

Success returns typed safe data containing the saved bio. `LinkManager` updates local bio immediately, closes the modal, and calls `router.refresh()`. The action revalidates `/dashboard` and `/${username}`. Supabase/Postgres error details never reach the client.

## Onboarding and Public Profile

Onboarding retains registration username handoff and fallback username entry. It asks no display name. It shows the selected profile URL and optional bio only.

Public profile reads only `id`, `username`, `bio`, and `avatar_path`; its active-link query and RLS behavior remain unchanged. Public presentation shows avatar/fallback, `@username`, optional bio, and existing active links.

## Share Panel

The preview displays `PUBLIC_PROFILE_HOST/{username}` in a non-selectable toggle button above the phone frame. Activating it toggles an original share panel and exposes `aria-expanded`.

The panel contains:

- `Share`
- Full public URL
- Working `Copy` action using `navigator.clipboard.writeText` when available
- Hidden textarea plus `document.execCommand("copy")` fallback
- Disabled, non-navigating placeholders: Canvas Links, Cards, QR code, Instagram, TikTok

Escape and outside pointer interaction close the panel. Copy success/failure uses safe English status text. Placeholder actions cannot navigate or share.

## Link Toggle and Dragging

Active toggle track uses `#22C55E`. Track and knob colors transition over 200ms. No shadow, glow, scale, or new movement is added.

Sortable transform forces `x = 0`. The list clips horizontal escape while preserving vertical sorting, keyboard coordinates, drag handle behavior, optimistic ordering, stable DndContext ID, and the existing reorder Server Action.

## Files

Expected changes:

- New Supabase migration
- `app/actions/profile.ts`
- `app/dashboard/page.tsx`
- `components/dashboard/link-manager.tsx`
- New dashboard profile header and modal components
- `components/dashboard/profile-preview.tsx`
- `components/dashboard/link-card.tsx`
- `components/dashboard/sortable-link-list.tsx`
- `components/onboarding/profile-form.tsx`
- `components/profile/profile-header.tsx`
- `components/profile/public-profile.tsx`
- New shared avatar component and avatar URL helper
- Profile query, validation, type, and copy files directly affected by `display_name`

Landing and auth presentation files remain unchanged.

## Verification

Run only `npm run lint`. Do not start, stop, or restart the user's development server. Do not run a production build.

When the existing browser session permits, verify display-name removal, bio modal save, immediate preview update, image fallback, desktop/mobile layout, green switch, vertical-only drag, share toggle, and clipboard result. Report every blocked or unverified item accurately.

Stage only this feature's implementation files, design note, and migration. Commit once after all work succeeds with:

`feat: upgrade dashboard profile and preview`
