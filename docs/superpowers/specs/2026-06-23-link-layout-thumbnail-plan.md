# Canvas Links Link Layout + Thumbnail V1 Plan

Date: 2026-06-23
Status: approved and implemented in V1

Approved V1 decisions:

- Use a separate public `link-thumbnails` bucket.
- Use canonical object paths in the form `${userId}/${linkId}/thumbnail.${ext}`.
- Accept only JPG, PNG, and WebP thumbnails up to 2 MB.
- Handle upload, replace, and remove through secure server actions.
- Use one safe Featured visual variant in V1.
- Clean up thumbnails best-effort when a link is deleted; Storage cleanup failure must not block link deletion.

## Scope

This plan turns the existing visual-only dashboard link card Layout and Thumbnail panels into functional V1 controls.

V1 goals:

- Each link can use `classic` or `featured` layout.
- Each link can optionally have one thumbnail image.
- Dashboard preview updates immediately from local/draft link state.
- Public profile renders only saved link layout and thumbnail data.
- Existing link CRUD, toggle, DnD, URL validation, Share panel, Appearance Editor draft/saved behavior, and `PublicProfileSurface` ownership stay intact.

Non-goals for this pass:

- No crop editor, automatic metadata scraping, video thumbnail, per-link advanced featured variants, or drag-and-drop upload.
- No reuse of avatar Storage paths for link thumbnails.
- No public profile design fork; render through the existing shared `PublicProfileSurface`.

## 1. Link Table Data Model

Add two persisted columns to `public.links`:

- `layout text not null default 'classic'`
- `thumbnail_path text null`

Constraints:

- `links_layout_check`: `layout in ('classic', 'featured')`
- `links_thumbnail_path_check`: `thumbnail_path is null or thumbnail_path ~ ('^' || user_id::text || '/' || id::text || '/thumbnail\\.(jpg|jpeg|png|webp)$')`

Why `thumbnail_path` stores a path rather than a public URL:

- Keeps DB portable across project URL changes.
- Allows server-side URL generation through the configured Supabase client.
- Keeps path validation deterministic and owner-scoped.

Backwards compatibility:

- Existing links become `classic` automatically.
- Existing public profile queries continue to work after the migration because new fields have safe defaults.
- TypeScript `LinkItem` and `PublicProfileLink` should be expanded to include:
  - `layout: 'classic' | 'featured'`
  - `thumbnail_path: string | null` for server/query layers
  - `thumbnailUrl?: string | null` for render-ready UI data

Recommended app-level helper:

- `lib/links/appearance.ts` or `lib/links/layout.ts`
  - `LINK_LAYOUTS = ['classic', 'featured'] as const`
  - `DEFAULT_LINK_LAYOUT = 'classic'`
  - `normalizeLinkLayout(value): LinkLayout`
  - `isValidThumbnailPath(userId, linkId, path)`

## 2. Storage Approach

Use a new public Files bucket, not the existing `avatars` bucket.

Recommended bucket:

- id/name: `link-thumbnails`
- public: `true`
- `file_size_limit`: `2097152` bytes, 2 MB
- `allowed_mime_types`: `image/jpeg`, `image/png`, `image/webp`

Rationale:

- Thumbnails have different lifecycle, path structure, and UI semantics than avatars.
- Separate bucket policies are easier to audit and less likely to weaken avatar rules.
- Public bucket is appropriate because thumbnails render on public profiles. Private bucket + signed URLs would add churn and cache complexity without V1 benefit.
- Public object URLs should not require a broad `select` policy on `storage.objects`; avoid enabling bucket-wide listing.

Path format:

- `${userId}/${linkId}/thumbnail.${ext}`
- `userId` must be the authenticated owner id from `getClaims()`, never browser-provided.
- `linkId` must belong to that owner before upload/update/delete.
- `ext` is derived from the server-validated MIME type, not trusted from the original filename.

Allowed MIME and extension mapping:

- `image/jpeg` -> `jpg`
- `image/png` -> `png`
- `image/webp` -> `webp`

File name control:

- Ignore original filename except for optional client display.
- Generate exactly one canonical object name per link.
- When replacing with a different extension, delete any old sibling thumbnail paths after successful upload and DB update.

Owner-only Storage policies:

- No broad public `select` policy; the public bucket serves object URLs without opening bucket listing.
- `link_thumbnails_owner_insert`: allow `insert` to authenticated users only when `name` matches `^auth.uid()/[0-9]+/thumbnail.(jpg|jpeg|png|webp)$` and the link id belongs to the same user.
- `link_thumbnails_owner_update`: allow update with the same ownership predicate.
- `link_thumbnails_owner_delete`: allow delete with the same ownership predicate.

Important policy nuance:

- Storage upsert/replacement needs `insert`, `select`, and `update` policies. V1 should either upload with `upsert: true` after policies cover all three operations, or use explicit delete-then-upload after ownership is confirmed. Prefer server action upload with explicit replace handling so UI behavior is predictable.

Public URL generation:

- Add `getPublicLinkThumbnailUrl(supabase, thumbnailPath)` helper, similar to `getPublicAvatarUrl`.
- Return `null` when `thumbnail_path` is null or fails path validation.
- Use `supabase.storage.from('link-thumbnails').getPublicUrl(path).data.publicUrl`.

Broken or missing file fallback:

- UI renders no thumbnail if `thumbnailUrl` is null.
- If an image fails to load, hide the thumbnail in that client render and preserve layout balance.
- Do not delete DB data from an image `onError`; cleanup belongs to a deliberate repair/remove action.

## 3. Classic And Featured Public Render Behavior

Rendering stays inside `PublicProfileSurface` and `PublicLinkButton`.

Classic layout:

- Without thumbnail: keep current balanced white horizontal link card.
- With thumbnail: show the existing small left thumbnail treatment.
- Thumbnail uses `object-fit: cover`, fixed square/squircle dimensions, and does not affect title centering.
- Appearance Editor button style/radius/shadow/color remains the base visual system.

Featured layout:

- Without thumbnail:
  - Render a larger card than classic, but not broken or empty.
  - Use the same button tokens and radius/shadow system.
  - Title stays centered with slightly stronger vertical rhythm.
  - Decorative menu remains right-aligned.
- With thumbnail:
  - Render a larger media-led card.
  - Thumbnail area appears above or to the side depending on available width:
    - Public/desktop mobile-surface: image area on top, title row below.
    - Dashboard preview narrow variant: same hierarchy scaled down.
  - Use `object-fit: cover`; no image distortion.

Appearance compatibility:

- `profileButtonssolid | outline | soft` still controls card base treatment.
- `profileButtonRadius*` applies to both classic and featured cards.
- `profileButtonShadow*` applies to both classic and featured cards.
- `profileButtonAlign*` controls title alignment in both layouts.
- Featured-specific media corners should inherit or visually harmonize with the active button radius.

Accessibility:

- Thumbnail images are decorative for link cards and should use empty `alt`.
- The link title remains the accessible text.
- Featured still renders one clickable `<a>` for the entire card in public mode and inert container in preview mode.

## 4. Dashboard User Flow

Layout panel:

- Existing Layout panel becomes stateful.
- Selecting `Classic` or `Featured` calls a server action, e.g. `updateLinkLayoutAction(linkId, layout)`.
- The card panel should show loading state on the selected option while saving.
- On success:
  - Update local `LinkManager` link state with returned link.
  - Dashboard preview updates immediately from returned/optimistic state.
  - Revalidate `/dashboard` and the owner public path.
- On failure:
  - Keep previous safe value.
  - Show inline panel error without closing the panel.

Recommended preview behavior:

- Apply optimistic local layout immediately on click.
- Keep a safe snapshot for rollback if the action fails.
- Do not wait for full router refresh for preview feedback.

Thumbnail panel:

- Existing `Set thumbnail` button opens native file picker.
- Accepted client file types: `.jpg,.jpeg,.png,.webp` and `image/jpeg,image/png,image/webp`.
- On file select:
  - Client shows pending state and optionally local object URL preview.
  - Submit file through `uploadLinkThumbnailAction(linkId, formData)`.
  - Server validates auth, ownership, MIME, size, and path.
- Replace:
  - If link already has a thumbnail, the same panel shows `Replace thumbnail`.
  - Replacement uploads a new canonical path and updates local link state.
- Remove:
  - If a thumbnail exists, show `Remove thumbnail`.
  - `removeLinkThumbnailAction(linkId)` clears `thumbnail_path` and deletes object best-effort.

Progress and loading:

- V1 can use simple pending state instead of byte-level upload progress because server actions do not naturally expose streaming progress.
- Button states:
  - `Set thumbnail`
  - `Uploading...`
  - `Replace thumbnail`
  - `Removing...`
- If true progress is required later, move upload to Supabase client direct upload with a signed upload flow or resumable upload in V2.

Error states:

- Invalid file type: `Use a JPG, PNG, or WebP image.`
- Too large: `Choose an image under 2 MB.`
- Unauthorized/not found: generic `We could not update this thumbnail.`
- Upload failed: generic retry message.
- Errors stay inside the Thumbnail panel.

Preview update:

- Local `LinkManager` state gains thumbnail URL/path fields.
- During upload, dashboard preview can show local object URL immediately.
- After server success, replace local object URL with Supabase public URL from returned link.
- On failure, revoke local object URL and roll back.

## 5. Security

Server actions:

- Use `supabase.auth.getClaims()`.
- Never accept `userId` from the browser.
- Always verify the link belongs to the authenticated user before layout, upload, replace, or remove.
- Return generic user-facing errors; log detailed errors only if a safe server logging pattern exists.

Suggested actions:

- `updateLinkLayoutAction(linkId: number, layout: unknown)`
- `uploadLinkThumbnailAction(linkId: number, formData: FormData)`
- `removeLinkThumbnailAction(linkId: number)`

Validation:

- `linkId` must be a positive safe integer.
- `layout` must be in `LINK_LAYOUTS`.
- File must be an actual `File`, size > 0 and <= 2 MB.
- MIME must be exactly one of the allowlist.
- Extension is server-derived from MIME.
- Storage path is built server-side only.

RLS:

- Existing `links_owner_update` policy already protects `public.links` updates when `.eq('user_id', authUserId)` is used.
- Public read policy continues to expose only active links from published profiles.
- Thumbnail path is not sensitive because the bucket is public and only active/published links are shown to visitors.

Storage policy approach:

- Public read for the bucket.
- Owner-only insert/update/delete based on path prefix matching `auth.uid()`.
- Avoid `SECURITY DEFINER` functions for Storage unless there is a specific unsolved need.
- Run security/performance advisors after implementation.

Public URL fallback:

- Public profile query should generate URLs only for valid `thumbnail_path`.
- Invalid DB path should be treated as no thumbnail.
- Broken image load should degrade visually without blocking navigation.

Deletion lifecycle:

- When deleting a link, V1 should either:
  - Best-effort delete `thumbnail_path` from Storage in `deleteLinkAction`, then delete row.
  - Or delete row first and run best-effort cleanup if the old path was known.
- If Storage delete fails but DB delete succeeds, do not block the user; note cleanup can be retried later.

## 6. File And Component Plan

Data/model helpers:

- `lib/links/types.ts`
  - Add `LinkLayout`, `thumbnail_path`, `thumbnailUrl`.
- `lib/links/get-current-links.ts`
  - Expand `LINK_SELECT`.
  - Map rows to render-ready `LinkItem` with thumbnail URL for dashboard/preview.
- `lib/profile/get-public-profile.ts`
  - Select `layout, thumbnail_path`.
  - Return public links with generated `thumbnailUrl`.
- `lib/links/thumbnail-url.ts`
  - Generate public thumbnail URLs and validate paths.
- `lib/links/layout.ts`
  - Allowlist and normalize layout values.
- `lib/links/thumbnail-validation.ts`
  - File/MIME/size/path helpers.

Server actions:

- `app/actions/links.ts`
  - Add layout update action.
  - Add thumbnail upload/remove actions.
  - Expand returned `LINK_SELECT`.
  - Best-effort thumbnail cleanup in delete action.

Dashboard:

- `components/dashboard/link-card-panel.tsx`
  - Convert Layout and Thumbnail panels from visual-only to controlled panels.
  - Accept link state, pending state, error state, and handlers.
- `components/dashboard/link-card.tsx`
  - Pass current link layout/thumbnail data to panel.
  - Keep toolbar hierarchy and DnD behavior.
- `components/dashboard/link-manager.tsx`
  - Add optimistic update/rollback handlers for layout and thumbnail actions.
  - Preserve active panel close behavior and delete-panel cleanup.
- `components/dashboard/sortable-link-list.tsx`
  - Thread new handlers through without changing DnD.

Public/shared profile:

- `components/profile/public-profile-surface.tsx`
  - Pass layout and thumbnail fields through.
- `components/profile/public-link-button.tsx`
  - Render classic vs featured variants from link layout.
- `components/profile/public-profile.module.css`
  - Add scoped classic/featured link card styles.
  - Respect existing Appearance Editor button classes.

Copy:

- `lib/copy.ts`
  - Add panel success/error/loading strings.

## 7. Migration Plan

Forward-only migration:

1. Add `layout` to `public.links`:
   - `text not null default 'classic'`
   - check constraint for `classic | featured`
2. Add `thumbnail_path text null`.
3. Add thumbnail path check constraint tied to `user_id` and `id`.
4. Create `link-thumbnails` public bucket with MIME/size restrictions.
5. Add Storage policies:
   - owner insert
   - owner update
   - owner delete
   - no broad public object listing policy
6. Keep existing `links` RLS policies and grants.
7. No new public table is expected. If a helper table is introduced later, remember the 2026 Data API change: new public tables may need explicit grants plus RLS.

Migration verification:

- Confirm `links.layout` default and constraint.
- Confirm `links.thumbnail_path` constraint.
- Confirm bucket exists with MIME/size settings.
- Confirm Storage policies exist.
- Run Supabase security and performance advisors after applying.

## 8. Manual Verification Scenarios

Dashboard layout:

- Open a link card Layout panel.
- Switch Classic -> Featured.
- Confirm card panel selected state changes.
- Confirm dashboard preview updates immediately.
- Refresh dashboard; saved layout remains.
- Switch back Featured -> Classic.

Thumbnail upload:

- Upload JPG under 2 MB.
- Confirm panel shows thumbnail state.
- Confirm dashboard preview updates immediately.
- Save/reload behavior remains consistent because thumbnail action is explicit server persistence.
- Replace with PNG/WebP.
- Remove thumbnail.

Invalid thumbnail:

- Upload unsupported MIME, e.g. GIF.
- Upload file over 2 MB.
- Upload empty file.
- Confirm no DB path is saved and UI shows safe error.

Public profile:

- Public profile shows only active links.
- Classic with thumbnail remains balanced.
- Classic without thumbnail remains balanced.
- Featured with thumbnail appears larger/media-led.
- Featured without thumbnail still looks intentional.
- Appearance button radius/style/shadow/colors still apply.

Security:

- Attempt to update another user's link layout; should fail.
- Attempt thumbnail upload to another user's link; should fail.
- Attempt malformed Storage path from browser; server should ignore and generate its own.
- Confirm public visitors can read thumbnails but cannot write/delete.

Regression:

- Link CRUD still works.
- Toggle active/inactive still updates preview.
- DnD order still persists.
- Add modal still works.
- Share panel still works.
- Appearance draft/saved behavior remains separate from link settings.
- Mobile public profile and dashboard preview have no horizontal overflow.

## 9. V2 Deferred

- Thumbnail crop editor.
- Drag-and-drop upload.
- Automatic Open Graph/link metadata image fetch.
- Per-featured-link advanced layout variants.
- Video thumbnails.
- Multiple thumbnails per link.
- Signed/private thumbnail delivery.
- Upload progress with resumable/TUS flow.
- Automatic orphaned Storage cleanup job.

## Recommended Decisions For Approval

1. Use a separate public `link-thumbnails` bucket.
2. Use one canonical thumbnail object per link: `${userId}/${linkId}/thumbnail.${ext}`.
3. Limit V1 thumbnails to JPG, PNG, WebP and 2 MB.
4. Keep upload/replace/remove as explicit server actions, with simple pending states rather than true byte progress.
5. Keep Featured as one safe visual variant in V1, compatible with existing Appearance Editor button styling.
