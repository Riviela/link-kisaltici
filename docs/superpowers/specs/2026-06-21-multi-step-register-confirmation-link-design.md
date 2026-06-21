# Multi-Step Registration with Confirmation Links

## Scope

Keep the three-step registration experience while temporarily using Supabase's default confirmation-link email flow. Custom SMTP, email OTP entry, resend controls, pending signup cookies, migrations, new packages, service-role access, and API routes remain out of scope.

## Registration Experience

`/register` keeps the existing Client Component wizard:

1. Email
2. Choose your profile URL
3. Create password

Email validation accepts conventional addresses without requiring `.com`. The profile URL uses the central `test.com` host, suggests a normalized value from the email local-part, and validates against the existing username syntax. The username is not reserved during registration.

The final Server Action independently validates email, username, password, and password confirmation. It calls Supabase `signUp` with the selected username stored only as `user_metadata.pending_username` and sets `emailRedirectTo` to the existing `/auth/callback` route.

## Safe Signup Result

The register page does not redirect to an OTP screen. After Supabase accepts the signup request, it stays on the third step and displays:

`If an account can be created with this email, check your inbox to verify your email address.`

Known account-existence responses map to the same result, preserving the existing anti-enumeration behavior. Raw Supabase errors are never displayed.

## Confirmation Callback

The default Supabase confirmation email contains a confirmation link. After the user follows it, `/auth/callback` reads the fixed `code` query parameter and calls `exchangeCodeForSession(code)` with the existing cookie-based server client.

Missing or invalid codes continue to redirect to the safe auth error page. Successful exchange writes the Supabase session cookies and redirects to `/onboarding`, not `/dashboard`.

## Onboarding Prefill and Security

`/onboarding` continues to authenticate the next request with `getClaims()`. For an authenticated user without a profile, it may call `getUser()` and use a syntactically valid `user_metadata.pending_username` only as an editable initial form value.

Metadata is never used for authorization, ownership, username reservation, or RLS. Profile creation continues to trust only verified `claims.sub`, Server Action validation, RLS, and database constraints.

## Removed OTP Surface

The temporary `/verify-email` route, six-box OTP form, OTP verification and resend Server Actions, pending email and resend cookies, cooldown state, and proxy matcher entry are removed. `/auth/callback` remains the only signup verification return route for this phase.

## Supabase Configuration

Confirm email remains enabled. The default confirmation-link template remains in use. Local and production `/auth/callback` URLs stay allowlisted in Supabase URL Configuration. Custom SMTP and a `{{ .Token }}` template can be introduced in a later, separately designed change.

## Verification

After implementation, run only:

1. `npm run lint`
2. `npm run build`

Manual verification should cover the three wizard steps, generic post-signup copy, confirmation-link callback, onboarding redirect, metadata prefill, existing-email non-enumeration, login, dashboard protection, and public profiles.
