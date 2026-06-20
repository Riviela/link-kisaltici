# Link in Bio Database Design

## Scope

This design covers only the initial Supabase migration for the link-in-bio MVP. Application code and pgTAP tests are excluded from this step.

## Tables

### profiles

- `id uuid` is the primary key and references `auth.users(id)` with `on delete cascade`.
- `username text` is required, unique, lowercase, 3-30 characters, and matches `^[a-z0-9][a-z0-9_]{2,29}$`.
- The reserved names `login`, `register`, `onboarding`, `dashboard`, `settings`, `api`, `auth`, `logout`, and `admin` are rejected by a database check constraint.
- `display_name text` is required and limited to 80 characters.
- `bio text` is optional and limited to 280 characters.
- `avatar_path text` is optional and limited to 512 characters.
- `is_published boolean not null default false` controls public visibility.
- `created_at` and `updated_at` use timezone-aware timestamps.

### links

- `id bigint generated always as identity` is the primary key.
- `user_id uuid` references `profiles(id)` with `on delete cascade`.
- `title text` is required and limited to 120 characters.
- `url text` is required and limited to 2048 characters.
- URLs must use `http`, `https`, `mailto`, or `tel`.
- `is_active boolean not null default true` controls public visibility.
- `position integer not null` must be zero or greater.
- `created_at` and `updated_at` use timezone-aware timestamps.
- An index supports owner-and-position reads.

## Timestamp Behavior

A shared trigger function sets `updated_at` to the current timestamp before every update on `profiles` and `links`.

## Row-Level Security

RLS is enabled on both tables.

### profiles policies

- Anonymous and authenticated visitors may select published profiles.
- An authenticated user may select their own profile regardless of publication state.
- A user may insert only a profile whose `id` equals `auth.uid()`.
- A user may update only their own profile, with both `using` and `with check` enforcing `auth.uid() = id`.
- A user may delete only their own profile.

### links policies

- Visitors may select a link only when it is active and its owner profile is published.
- An authenticated user may select all of their own links regardless of activity or publication state.
- A user may insert only links whose `user_id` equals `auth.uid()`.
- A user may update only their own links, with both `using` and `with check` enforcing `auth.uid() = user_id`.
- A user may delete only their own links.

## Atomic Reordering

`public.reorder_links(bigint[])` runs as `security invoker` and is executable only by `authenticated`.

The function:

1. Rejects calls without `auth.uid()`.
2. Rejects null input, null IDs, and duplicate IDs.
3. Takes a transaction-scoped advisory lock derived from the authenticated user ID, serializing concurrent reorder attempts for that user.
4. Locks all of the user's link rows with `for update`.
5. Requires the submitted ID list to contain every current link exactly once.
6. Rejects missing, nonexistent, or foreign-owned IDs before any update.
7. Updates all positions in one statement using array order, with zero-based positions.

Any exception rolls back the complete function call, preventing partial ordering.

## Avatar Storage

- A public `avatars` bucket is created for profile images.
- The bucket accepts image MIME types only and enforces a 5 MB file-size limit.
- Public reads are limited to objects in the `avatars` bucket.
- Authenticated insert, update, and delete policies apply only when the bucket is `avatars` and the first path segment equals `auth.uid()::text`.
- Update includes both `using` and `with check` path ownership checks.

## Privileges

- `anon` and `authenticated` receive only the table privileges needed for Data API access; RLS determines row access.
- `anon` cannot execute `reorder_links`.
- Function execution is revoked from `public` and granted only to `authenticated`.
- No service-role credential is required by this migration or exposed to browser code.

## Verification Plan

The migration will contain no test SQL. A later `supabase/tests` pgTAP suite will verify constraints, visitor/owner/other-user RLS behavior, Storage ownership, invalid reorder inputs, complete-list enforcement, rollback behavior, and concurrent reorder serialization.

## Migration Output

The migration will contain only schema objects, constraints, indexes, grants, RLS policies, Storage configuration and policies, timestamp triggers, and the reorder database function. A short SQL comment at the end will summarize the access model and note the separate pgTAP plan.
