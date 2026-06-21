# Multi-Step Registration and Email OTP Design

## Scope

Replace only the existing registration experience with a four-step email, profile URL, password, and email OTP flow. Login, the fallback callback route, onboarding profile creation, dashboard protection, public profiles, RLS, and existing Server Action security remain intact. No migration, service-role key, API route, localization system, or new package is introduced.

## Architecture

`/register` remains the registration entry point. A small Client Component owns the temporary wizard state for the email, username suggestion, password, and confirmation password. Browser validation controls step navigation, while the final registration Server Action repeats all validation before calling Supabase.

After a successful `signUp`, the server stores short-lived pending-registration cookies and redirects to the separate `/verify-email` page. This page renders the OTP Client Component. OTP verification and resend use Server Actions and the existing `@supabase/ssr` server client; no separate API layer is added.

## Step 1: Email

The first screen accepts only an email address. The existing general email rules remain: a conventional address format is required, but no specific top-level domain such as `.com` is required. `Continue` is enabled only when the browser-side validator accepts the trimmed value. Server validation remains authoritative when registration is submitted.

Safe English validation copy includes `Enter a valid email address.`

## Step 2: Choose Your Profile URL

The profile URL host is stored once in a central application constant with the value `test.com`. The UI renders `test.com/` as a muted, immutable prefix and lets the user edit only the username segment. The live preview updates as the username changes.

The email local-part provides the initial suggestion. It is lowercased, unsupported character runs are converted to underscores, leading characters that cannot start a username are removed, and the result is limited to 30 characters. The editable value must still pass the existing username rules: 3-30 characters, first character alphanumeric, and remaining characters limited to lowercase letters, numbers, and underscores.

This step does not reserve the username and does not present an availability result. Anonymous RLS cannot reliably reveal private username ownership, and no privileged lookup is added. The existing onboarding insert, database uniqueness constraint, reserved-name constraint, and safe conflict handling remain the source of truth.

## Step 3: Create Password

The third screen contains `Password` and `Confirm password`. The current 8-128 character password limits remain in force, and both values must match. Browser validation provides immediate feedback; the Server Action independently validates the email, normalized username, password, and confirmation value.

The registration action calls `signUp` with the selected username only as temporary user metadata:

```ts
options: {
  data: {
    pending_username: normalizedUsername,
  },
}
```

`pending_username` is user-editable metadata and is never used for authentication, authorization, RLS, ownership, or reservation decisions. Registration continues to use only the publishable key and the cookie-based server client.

On accepted signup, the action sets the pending-registration cookies and redirects to `/verify-email`. The Confirm signup email template uses `{{ .Token }}` so the message contains a six-digit OTP. The registration flow does not depend on a callback URL as its primary confirmation mechanism.

## Pending Registration Cookies

Two cookies are used only by the signup verification flow:

- `pending_signup_email` stores the normalized email used by `verifyOtp` and resend.
- `pending_signup_resend_after` stores the next time the UI may offer resend.

Both cookies use a short 15-minute lifetime, `HttpOnly`, `SameSite=Lax`, and `Secure` in production. Their path is restricted to `/verify-email`. They contain no session token and are not authentication evidence. Both are cleared after successful verification. The email is never accepted from a hidden field, query parameter, or other browser-controlled form value during verify or resend.

The `/verify-email` Server Component reads the pending email cookie before rendering. If it is absent or expired, the page redirects to a fixed `/register?notice=verification-expired` destination. The register page maps that allowlisted notice key to `Your verification session has expired. Start registration again.` It never renders arbitrary query text.

## Step 4: Verify Email

The page displays `We sent a verification code to your email.` above six visually separate inputs. Each input accepts one digit, uses a numeric input mode, and has an accessible label such as `Digit 1 of 6`. Typing advances focus, Backspace on an empty input moves to the previous input, and pasting six digits distributes them across the inputs. Verification is enabled only for exactly six digits.

The verification Server Action does not require or call `getClaims()` before `verifyOtp`, because the user is not authenticated yet. It reads the email only from `pending_signup_email`, validates the six-digit token, and calls:

```ts
supabase.auth.verifyOtp({ email, token, type: "email" })
```

On success, the action requires both returned `session` and `user` data to be present. The existing `@supabase/ssr` server client receives the new auth state and writes the Supabase session cookies through its `getAll()`/`setAll()` cookie adapter. The action does not manually serialize access or refresh tokens. After the auth cookies have been written, it clears the pending-registration cookies and redirects to the fixed `/onboarding` route.

`/onboarding` and every other protected page remain authoritative on the following request: they call `auth.getClaims()` before trusting the identity. Proxy checks continue to provide only session refresh and fast routing, not the security boundary.

## Onboarding Prefill

After `/onboarding` verifies the session with `getClaims()` and confirms that no profile exists, it may call `getUser()` to read `user_metadata.pending_username` for presentation only. The value is normalized and checked against the username syntax before becoming the form's editable initial value; an invalid value is ignored.

The profile creation action continues to use the submitted form value, verified `claims.sub`, existing RLS, and database constraints. It does not trust metadata for identity or availability. A username taken between signup and onboarding produces the existing safe username-unavailable message.

## Resend Flow

`resendSignupOtpAction` does not require an authenticated session and accepts no email from the browser. It reads only `pending_signup_email`, checks the server-side resend timestamp for user experience feedback, and calls:

```ts
supabase.auth.resend({ type: "signup", email })
```

After a successful resend, the server advances the timestamp and the client restarts a 60-second display countdown. A refresh derives the remaining time from the HttpOnly timestamp rather than resetting the UI immediately. The countdown is only a user experience guard; Supabase Auth remains the authoritative rate limiter. A failed resend does not expose provider text and does not falsely report that a new code was sent.

Because `pending_signup_resend_after` is HttpOnly, the OTP Client Component never reads it directly. The `/verify-email` Server Component reads the timestamp, calculates the nonnegative remaining duration, and passes it to the OTP form as `initialResendSeconds`. A successful resend action returns a typed safe result containing the new cooldown duration, and the client replaces its countdown state with that returned value.

English resend copy includes `Resend code`, `Resend code in 00:42`, `A new verification code has been sent.`, and `Please wait before requesting another code.`

The OTP screen also provides two non-enumerating exits. `Use a different email` invokes a Server Action that clears both pending cookies with the same `/verify-email` path and redirects to `/register`. `Already have an account? Sign in` links directly to `/login`. Neither path reports whether the pending email belongs to an existing account.

## Error Handling

All action results are typed and contain only fixed English messages. Raw Supabase or Postgres errors never reach the client.

- Invalid, expired, or already-used OTP: `The code is invalid or has expired. Request a new code.`
- Missing or expired pending context: redirect to `/register` with `Your verification session has expired. Start registration again.`
- Invalid registration input: field-specific safe validation messages.
- Signup, verification, network, or resend fallback: `We could not complete this request. Please try again.`
- Resend cooldown: `Please wait before requesting another code.`

Redirects remain outside broad `try/catch` blocks. Existing-account responses remain non-enumerating; the UI does not disclose whether an email is already registered.

## Route and Proxy Behavior

- `/register`: public multi-step wizard; an already authenticated user follows the existing authenticated redirect behavior.
- `/verify-email`: public while verification is pending; it requires the pending email cookie, not an existing session.
- `/onboarding`: protected and independently verified with `getClaims()`.
- `/auth/callback`: retained unchanged as a legacy or fallback confirmation-link handler.

The proxy matcher adds `/verify-email` for session cookie refresh and fast routing. It must allow unauthenticated users with pending verification context to reach that page. If a valid authenticated session reaches `/verify-email`, fast routing may send it to `/onboarding`, whose own profile and claims checks remain authoritative.

## Planned File Boundaries

- `app/(auth)/register/page.tsx`: register page wrapper and fixed notice mapping.
- `components/auth/register-wizard.tsx`: local step state and browser validation.
- `app/verify-email/page.tsx`: pending-cookie gate and OTP page wrapper.
- `components/auth/otp-verification-form.tsx`: six-digit input behavior, pending state, and resend countdown initialized only from the server-provided `initialResendSeconds` prop.
- `app/actions/auth.ts`: final signup, OTP verification, and resend Server Actions.
- `lib/auth/register-validation.ts`: username suggestion and trusted registration/OTP validation.
- `lib/auth/types.ts`: typed safe action states.
- `lib/config/site.ts`: central `test.com` profile host constant.
- `app/onboarding/page.tsx` and `components/onboarding/profile-form.tsx`: safe metadata-derived initial username.
- `lib/copy.ts`: centralized English copy.
- `proxy.ts` and `lib/supabase/proxy.ts`: `/verify-email` matching and fast routing only.
- `README.md`: Confirm signup `{{ .Token }}` configuration and fallback callback note.

## Supabase Configuration

Confirm email remains enabled. The Confirm signup template contains `{{ .Token }}`, which Supabase documents as the six-digit OTP value. `/auth/callback` and its allowlisted URLs remain configured for legacy or fallback messages, but newly generated registration emails are designed around the entered OTP rather than a confirmation link.

## Manual Test Plan

1. Accept valid non-`.com` addresses and reject malformed addresses.
2. Generate and edit the local-part username suggestion; verify the live `test.com/username` preview and syntax limits.
3. Reject mismatched, too-short, and too-long passwords in both browser and Server Action validation.
4. Confirm signup stores `pending_username` only as metadata and redirects to `/verify-email` without an authenticated-session prerequisite.
5. Verify digit-only entry, automatic focus, Backspace navigation, six-digit paste, keyboard labels, and disabled incomplete submission.
6. Verify a valid OTP returns session and user data, writes SSR auth cookies, clears pending cookies, and reaches `/onboarding`, where `getClaims()` succeeds.
7. Verify invalid, expired, and reused OTPs return only safe English messages.
8. Remove or expire the pending email cookie and confirm `/verify-email` returns to `/register` with the fixed safe notice.
9. Confirm resend uses only the pending cookie email, preserves the countdown through refresh, and handles Supabase rate limits safely.
10. Confirm `pending_username` prefills onboarding but remains editable and cannot bypass syntax, reserved-name, uniqueness, ownership, or RLS checks.
11. Confirm a username taken after signup is handled safely during profile creation.
12. Confirm the fallback `/auth/callback`, login, logout, dashboard, public profiles, and existing protected-route behavior still work.

## Implementation Verification

After later implementation, run only:

1. `npm run lint`
2. `npm run build`

This document introduces no application code, migration, package, or runtime behavior by itself.
