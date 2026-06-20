# Authentication Foundation Design

## Scope

Build only the Next.js authentication foundation: public landing page, registration, login, email confirmation callback, authenticated empty dashboard, and logout. Profiles, links, onboarding, avatars, localization infrastructure, and general API routes are excluded.

## Stack

- Next.js App Router with TypeScript and Tailwind CSS.
- `@supabase/ssr` and `@supabase/supabase-js` with pinned package versions and a committed lockfile.
- Cookie-based Supabase sessions using only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- No service-role or secret key, legacy auth helpers, or `middleware.ts`.

## File Boundaries

- `lib/supabase/client.ts`: browser Supabase client.
- `lib/supabase/server.ts`: request-scoped server client with a cookie adapter that uses only `getAll()` and `setAll()`.
- `lib/supabase/proxy.ts`: session refresh and fast redirects.
- Root `proxy.ts`: invokes the proxy helper only for `/dashboard`, `/login`, and `/register`.
- `app/actions/auth.ts`: register, login, and logout Server Actions.
- `components/auth/login-form.tsx`: login Client Component using `useActionState`.
- `components/auth/register-form.tsx`: registration Client Component using `useActionState`.
- `lib/auth/validation.ts`: shared email and password validation.
- `lib/copy.ts`: centralized English user-facing copy.
- `app/auth/callback/route.ts`: email verification callback only.
- `app/auth/error/page.tsx`: safe English callback error page.
- `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/dashboard/page.tsx`, and `app/page.tsx`: requested pages.

## Authentication Flow

### Registration

The registration form performs basic browser validation and submits to a Server Action with `previousState` as its first argument. The action first calls `auth.getClaims()` to detect an existing verified session, then validates and normalizes the email, validates the password, and calls Supabase `signUp`. `emailRedirectTo` points to the absolute `/auth/callback` URL derived from the request origin. Successful submission returns the generic message: “If an account can be created with this email address, check your inbox to continue.” Supabase error text is never displayed directly.

### Email Confirmation

`app/auth/callback/route.ts` reads the `code` query parameter and calls `exchangeCodeForSession(code)` using the cookie-based server client. Success redirects to `/dashboard`. A missing or invalid code redirects to `/auth/error`, which shows a centralized safe English message.

### Login and Logout

The login action first calls `auth.getClaims()` to detect an existing verified session, validates input, calls `signInWithPassword`, verifies the resulting server session with a second `auth.getClaims()` call, and redirects to `/dashboard`. The logout action verifies the current session with `auth.getClaims()`, signs out, and redirects to `/login`.

## Authorization

The proxy refreshes session cookies and provides fast redirects but is not the security boundary. It redirects unauthenticated `/dashboard` requests to `/login`, and authenticated `/login` or `/register` requests to `/dashboard`.

The dashboard independently calls `auth.getClaims()` and redirects to `/login` when no verified claims exist. It may then call `auth.getUser()` to obtain the email address for display. Every Server Action calls `auth.getClaims()` inside the action. No action accepts a browser-provided user ID or role. `auth.getSession()` is never used for a security decision.

## Forms and Feedback

Login and registration forms are small Client Components. `useActionState` displays safe field/general feedback and pending state. Submit buttons are disabled while pending and display `Processing...`. HTML input types, `required`, and minimum password length provide basic browser validation; Server Actions repeat validation as the trusted boundary.

## Copy and Locale

All user-facing text is English and centralized in `lib/copy.ts` where practical. Code identifiers and filenames are English. No translation framework, locale route, selector, or Turkish-specific formatting is included. Future date, time, or number rendering will use `Intl` APIs, but this scope displays none.

## Environment and Documentation

`.env.example` contains only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The README includes brief startup commands, notes that Confirm email must be enabled, and states that both the local callback URL and production callback URL must be added to Supabase Dashboard URL Configuration Redirect URLs.

## Error Handling

Validation, invalid credentials, registration failure, and callback failure map to fixed English messages. Sensitive provider details and raw Supabase errors remain server-side. Redirects use fixed internal paths and do not accept arbitrary return URLs.

## Verification

Only these commands run after implementation:

1. `npm run lint`
2. `npm run build`

No profile, link, Storage, onboarding, localization, API-layer, or test-suite code will be added.
