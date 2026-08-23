# PMA Prep

## Payment and access setup

After the base Supabase schema is installed, run these migrations in order:

1. `supabase/migrations/20260821_payment_integrity.sql`
2. `supabase/migrations/20260821_access_packages.sql`
3. `supabase/migrations/20260821_access_integration.sql`
4. `supabase/migrations/20260821_referral_growth.sql`
5. `supabase/migrations/20260821_gto_lessons.sql`
6. `supabase/migrations/20260821_blog_cms_phase1.sql`
7. `supabase/migrations/20260821_blog_cms_phase2.sql`
8. `supabase/migrations/20260821_blog_cms_phase3.sql`
9. `supabase/migrations/20260821_blog_cms_phase4.sql`

The application uses 100 starter credits, time-limited Initial and ISSB entitlements, and administrator-verified Easypaisa payments. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and configure the payment account values from `.env.example`.

A deployment-ready Next.js App Router application for ISSB/PMA preparation. It includes Supabase authentication, free/premium content gates enforced by Postgres RLS, manual Easypaisa payment submission, private screenshot storage, and a protected admin verification dashboard.

## Local setup

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor.
2. In Supabase Authentication settings, set the Site URL to `http://localhost:3000` locally and add your Vercel URL after deployment.
3. Copy `.env.example` to `.env.local` and fill every value. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never prefix it with `NEXT_PUBLIC_`.
4. Set `ADMIN_EMAILS` to a comma-separated allowlist of registered admin account emails.
5. Install and run:

```bash
npm install
npm run dev
```

The admin dashboard is at `/admin`. An account must be signed in and its email must appear in `ADMIN_EMAILS`.

## Deploy to Vercel

Push the repository to GitHub, import it in Vercel, and add all variables from `.env.example` under Project Settings → Environment Variables. Deploy, then add the production URL to Supabase Authentication → URL Configuration → Redirect URLs.

## Security notes

- Premium access is enforced in both server-rendered routes and Supabase Row Level Security.
- Payment screenshots are private; admins receive signed links valid for 10 minutes.
- Admin mutations use the service role only after a server-side email allowlist check.
- Transaction IDs are unique to prevent duplicate submissions.
