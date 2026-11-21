# Supabase setup and production deployment

The web application uses Supabase Postgres for shared business data and Supabase Auth for administrator access. The browser only receives the project URL and publishable/anon key; the service-role key must never be added to this repository or frontend environment.

## 1. Create and secure the Supabase project

1. Create a Supabase project in the region closest to Bengaluru and save the database password in a password manager.
2. In **Project Settings → API**, copy the Project URL and the publishable key (or legacy anon key).
3. In **SQL Editor**, run [`supabase/migrations/20261120190000_initial.sql`](./supabase/migrations/20261120190000_initial.sql) once, then apply subsequent migration files in timestamp order. The testimonials and media migration is [`supabase/migrations/20261121190000_testimonials_and_media.sql`](./supabase/migrations/20261121190000_testimonials_and_media.sql).
4. In **Authentication → Users**, invite/create the first administrator using an individual email account. Do not use a shared password. Opening the invitation establishes an administrator session; the app's `/admin` page prompts the user to create their own password. If the invite redirects to the public homepage, open `/admin` in that same browser.
5. Copy that user's UUID and grant the allowlist entry in SQL Editor:

   ```sql
   insert into public.sdm_admin_users (user_id)
   values ('AUTH_USER_UUID');
   ```

6. Disable public sign-ups in **Authentication → Settings**. Administrators must be created/invited by the project owner and added to `sdm_admin_users`. Use individual accounts with strong passwords and set the production Site URL to the deployed admin URL (for example `https://example.com/admin`) and add the deployed website to the redirect allowlist. This app does not yet implement an MFA step-up screen; do not enforce an MFA policy until that flow has been added and tested.

The RLS policies keep orders, customer profiles, quotations, testimonial contact details, and unpublished content private to allowlisted administrators. Anonymous website visitors can read only public catalog/content through filtered database views/functions and can submit validated enquiries and pending testimonials; they cannot read the enquiry queue. Testimonial photos stay in private storage until approval. A phone-based cooldown and an overall request cap are included. Add a CAPTCHA/Turnstile verification flow before promoting public submissions heavily.

## 2. Configure and run the web app

The SDM Supabase project URL and publishable key are included as public-client defaults in the web app, so a Vercel environment-variable misconfiguration does not disable login or enquiries. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to override those defaults for another deployment. The publishable key is designed for browser use and protected by RLS; it is not a service-role key.

To override the defaults locally, create `web/.env.local` from [`web/.env.example`](./web/.env.example):

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

These are public client values and are protected by database RLS; they are not substitutes for policies. Never set `SUPABASE_SERVICE_ROLE_KEY` or a database password in a `VITE_` variable. Restart the Vite server after changing environment variables.

For the Expo app, create `mobile/.env` from [`mobile/.env.example`](./mobile/.env.example) with the same project URL and publishable/anon key. For EAS builds, set those two `EXPO_PUBLIC_` variables in the EAS environment used for the build. They enable the mobile gear screen to read the same public inventory; the mobile cart does not create orders or enquiries.

From `web/`, validate and run:

```powershell
npm install
npx tsc --noEmit
npm run build
npm run dev
```

Without both Supabase variables, the public pages still render from their local/default content, but admin sign-in and public enquiry submission are intentionally unavailable. The app does not fall back to the former hard-coded admin credentials.

## 3. Deploy the site

For Vercel, import the repository, set **Root Directory** to `web`, and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Production (and Preview/Development if needed). The existing `web/vercel.json` supplies the SPA route rewrite. Redeploy after setting environment variables. Add the final deployed hostname to Supabase Auth's Site URL and redirect allowlist, then test sign-in, a quote request, gear, an order, a return, payment settlement, quotations, reports, and a second-device login.

The SQL migration is not automatically run by Vercel; apply migrations through Supabase before the first production deploy. Redeploy after changing environment variables so the built frontend receives them.

## Data behavior and operational notes

- The current synchronous store API is retained. Each collection is persisted as a JSONB snapshot in `sdm_app_state`; order creation and item-return/inventory changes use an atomic, revision-checked database batch. A concurrent edit that has a stale revision is rejected and shown in an on-screen error rather than silently overwriting the newer database state; refresh before retrying.
- Admin pages load the latest shared data at sign-in/page startup; refresh a second open device after another administrator makes changes.
- Public quote forms write directly to `sdm_quote_requests` through a validated RPC. Administrators review and update requests through the admin panel.
- Testimonial submissions require a photo and phone number; only approved names, photos, and text are available to the public. The phone number remains administrator-only. Public media uploads use the `sdm-public-media` bucket and require an administrator session.
- The legacy browser data is not automatically uploaded. If an empty Supabase database and old local records are found, the admin panel offers a one-time import from that browser. Review the data and import from the browser that contains the authoritative live records. Demo-mode data remains browser-only and is never synchronized.
- Invoice/quotation generation and payment status are supported, but this integration does not process payments, send email/SMS, or issue electronic tax invoices. Confirm GST/business invoice requirements with your accountant before using generated invoices as tax invoices.
- Aadhaar/PAN and customer contact information are business-sensitive. Limit administrator accounts, use MFA, avoid shared devices, and establish an appropriate retention/privacy policy. Do not collect identity numbers unless operationally necessary.
- Supabase Free is suitable for a pilot and low-volume deployment, not a contractual uptime/backup guarantee. Review current plan quotas and project pausing/backup terms before launch, export critical business records regularly, and move to a paid plan if continuous operation or recoverable backups are required.
