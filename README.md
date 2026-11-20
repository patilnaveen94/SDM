# SDM Camera Rentals

The customer website and rental-management admin are in [`web/`](./web/). The Expo mobile app is in [`mobile/`](./mobile/).

## Run the web app

```powershell
cd web
npm install
npm run dev
```

The web project uses Vite. Add the Supabase project URL and publishable/anon key to `web/.env.local` before using admin sign-in or public quote requests. See [Supabase setup and production deployment](./SUPABASE_SETUP.md) for database migration, administrator provisioning, legacy data import, and Vercel deployment instructions.

## Run the mobile app

See [`MOBILE_SETUP_GUIDE.md`](./MOBILE_SETUP_GUIDE.md) for Expo setup and device testing.
