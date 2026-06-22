# Social Profiles and Link Picker Design

## Goal

Add three optional social profile handles and replace the large dashboard link form with a compact link picker. Preserve current authentication, RLS ownership, link editing, toggle, deletion, vertical sorting, avatar, bio modal, Share panel, and public route behavior.

Reference screenshots inform interaction hierarchy and spacing only. Canvas Links keeps its own colors, English copy, icons, and component language.

## Migration

Create one forward-only migration without editing earlier migrations.

- Publish all existing profiles with `is_published = true`.
- Change `profiles.is_published` default to `true` for future rows.
- Add nullable `instagram_handle`, `tiktok_handle`, and `youtube_handle` text columns.
- Add named check constraints for platform-specific ASCII handles and length limits.
- Reject whitespace, control characters, slashes, URL syntax, and unsupported punctuation through the allowed-character constraints.
- Keep all existing RLS policies, grants, triggers, functions, ownership predicates, and public-read behavior unchanged.

Application validation trims input, removes one leading `@`, and converts an empty result to `null`. The database stores no leading `@`.

Supported formats:

- Instagram: letters, numbers, periods, underscores; 1-30 characters.
- TikTok: letters, numbers, periods, underscores; 2-24 characters.
- YouTube: letters, numbers, periods, underscores, hyphens; 3-30 characters.

## Social Profile Flow

A server-side platform union accepts only `instagram`, `tiktok`, or `youtube`; arbitrary browser values cannot choose a database column. `updateSocialHandleAction` verifies `auth.getClaims()`, validates and normalizes the handle, updates only the authenticated profile, selects safe typed fields, and returns no raw Supabase/Postgres error.

The action revalidates `/dashboard` and `/${username}`. Clearing a handle stores `null` and removes the corresponding public link.

`LinkManager` owns local bio and social-handle state. Successful social saves update dashboard header and live preview immediately, then refresh authoritative server data. Current and public profile queries select only the required new handle columns.

Dashboard header shows Instagram, TikTok, and YouTube icon buttons below the optional bio. Each opens a platform-specific modal with a single handle input, safe error state, Cancel, and Save. Existing values remain editable. Modal animation uses the existing 220ms overlay lifecycle.

Live preview and public profile show only connected social icons. Public anchors use:

- `https://instagram.com/{handle}`
- `https://tiktok.com/@{handle}`
- `https://youtube.com/@{handle}`

They open with `target="_blank"` and `rel="noopener noreferrer"`.

## Publication Cleanup

Remove dashboard Publish/Private control, its Client Component, unused Server Action, validation type, and copy entries. Keep the database column and public-profile `is_published = true` query because publication remains a database visibility boundary. New and migrated profiles are published by default.

## Link Picker Flow

Remove the large create form and the redundant `Your links` heading. Keep existing link cards and edit forms unchanged.

A compact `Add +` button opens a 220ms modal containing one rounded URL/search input.

- Empty input shows one `Link` option; selecting it focuses the input.
- A non-empty value is normalized with the current URL rules.
- Invalid input shows safe English guidance and no result action.
- Valid input shows `1 result`, `Link`, and the normalized URL.
- Selecting the result submits a dedicated typed Server Action.

The Server Action independently authenticates with `getClaims()`, normalizes and validates the URL, derives a default title, and inserts without accepting `user_id` or `position` from the browser. HTTP/HTTPS titles use the hostname; mailto/tel titles use the target value. Existing database position assignment, RLS, and URL constraints remain authoritative.

Success returns the inserted `LinkItem`. `LinkManager` applies it to local state, closes the modal, and refreshes dashboard data. Existing edit, toggle, delete, optimistic reorder, stable DnD ID, keyboard sorting, and vertical-only transforms remain unchanged.

Escape, backdrop interaction, and close button use one closing function. Closing keeps the modal mounted until animation end with a timeout fallback.

## Files and Verification

Expected scope:

- One new Supabase migration.
- Profile/link Server Actions, validation, typed query results, and centralized copy.
- Dashboard manager/header/preview plus new social and link-picker components.
- Public profile header/social links.
- Removal of the unused publication component and references.

Do not change landing, auth, onboarding, avatar behavior, Share panel, bio modal, global button system, or dependencies.

Run only `npm run lint`. Use the existing development server for manual checks when available. Report any blocked database, authenticated-flow, clipboard, DnD, or visual checks accurately. Stage only this feature, migration, and this design note. Commit once with:

`feat: add social profiles and link picker`
