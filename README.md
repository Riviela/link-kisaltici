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
2. Keep the default confirmation-link signup email template.
3. Open **Authentication > URL Configuration**.
4. Add `http://localhost:3000/auth/callback` to **Redirect URLs**.
5. Add `https://your-domain.com/auth/callback` before deploying to production.
6. Set the production **Site URL** when the live domain is available.

The registration flow uses Supabase's confirmation link. The link returns to
`/auth/callback`, which establishes the cookie-based session and sends the user
to onboarding. Custom SMTP can be configured later when email OTP templates are
needed.

The application uses only these public environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

No service-role or secret key is required.
