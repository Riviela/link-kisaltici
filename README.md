# Canvas Links

The authentication foundation for a link-in-bio application, built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase SSR.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and publishable key.
3. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Auth Configuration

In Supabase Dashboard:

1. Open **Authentication > Providers > Email** and keep **Confirm email** enabled.
2. Open **Authentication > Email Templates > Confirm signup**.
3. Use `{{ .Token }}` in the template so new registrations receive a six-digit verification code instead of relying on a confirmation link.
4. Open **Authentication > URL Configuration**.
5. Add `http://localhost:3000/auth/callback` to **Redirect URLs**.
6. Add `https://your-domain.com/auth/callback` before deploying to production.
7. Set the production **Site URL** when the live domain is available.

The primary registration flow verifies the six-digit code on `/verify-email`.
`/auth/callback` remains available only for legacy or fallback confirmation
links.

The application uses only these public environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

No service-role or secret key is required.
