# Gezer Tarım Market

Next.js 16 / React 19 catalog with Supabase authentication, database and image storage.
Node.js 22.17+ is used for development and the regression tests.

## Setup

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and enter your Supabase project URL and **publishable** key (the legacy anonymous key is also supported as `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Never put a service-role/secret key in a `NEXT_PUBLIC_` variable.
3. Apply the migrations in `supabase/migrations` in filename order. For an existing project with the initial schema already applied, apply only `20260916000000_security_and_reliability.sql`, using your normal Supabase migration workflow or SQL editor.
4. Create an admin account through Supabase Auth in the dashboard, then assign the administrator role using a trusted database connection / Supabase SQL editor:

   ```sql
   update public.profiles set role = 'admin' where id = '<auth-user-uuid>';
   ```

   The current schema allows one administrator. Customers cannot assign roles through the API.
5. Run `npm run dev` and open http://localhost:3000.

Apply the new migration **before deploying this version**. The application needs the shared settings table, media cleanup queue and atomic product-save function. Missing configuration or database failures show an error state; no sample inventory is substituted.

## Checks

```bash
npm run lint
npm test
npx tsc --noEmit
npm run build -- --webpack
```

`npm run build` uses Turbopack. Webpack is available for environments that restrict Turbopack's worker sockets. Production runs with `npm start`. Google Fonts are fetched during a cold build, so network access is needed.

The unit tests cover admin-only login, upload limits, form validation, storage retries and authentication cookie refresh.

For database regression tests, use a **new disposable local PostgreSQL instance**, create an empty database named `gezer_review_test`, and run:

```bash
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f supabase/tests/bootstrap.sql \
  -f supabase/migrations/20260914000000_initial_schema.sql \
  -f supabase/migrations/20260916000000_security_and_reliability.sql \
  -f supabase/tests/security.sql
```

`bootstrap.sql` models Supabase's auth/storage schemas and API roles locally. It is **not** a production migration. Tests verify role protection even before an admin exists, private profile access, shared settings permissions, hidden product-image metadata, product-save rollback, and media cleanup triggers. They do not replace a staging test against Supabase Auth and Storage services.

## Data and storage behavior

- Public pages show active products; administrators also see inactive products.
- Product and image-reference changes commit together in one database transaction.
- Company settings are saved to Supabase and shared with all visitors.
- Product images allow JPEG, PNG and WEBP, up to 10 MiB per file. A form accepts at most ten new images.
- Each upload reserves a cleanup entry before transferring bytes. Abandoned uploads become eligible after 24 hours; known failed saves and deleted images become eligible immediately.
- Cleanup runs after deletions and on server renders of the admin layout, processing up to 50 due entries. Referenced files are retained; failed storage deletions stay queued for retry. A lost save response therefore does not immediately destroy possibly committed images. The dashboard shows pending cleanup. If the admin panel is not visited, queued files remain until the next cleanup run; larger installations should schedule a trusted cleanup worker.
- Catalog buckets are public. Deactivating a product hides its catalog metadata, but does not revoke previously known image URLs. These buckets must never contain private customer/service media.
- Existing orphan files from before this migration are not automatically removed. Review them against current image references before deleting them.
- Visitors browse without an account and ask about individual products through WhatsApp. There is no cart; prices and stock are confirmed by the business.

## Current scope

Available: public catalog, admin-only login, product management, slide management, shared company settings and live dashboard counts.

There is no customer registration or account area. Legacy `/register` and `/account` URLs redirect to admin login; `/cart` redirects to the catalog.

Service requests currently use WhatsApp. Online orders, customer management and public product reviews are not implemented; the former placeholder links, fabricated statistics and browser-only review form have been removed. Browser-only company settings are not automatically imported: enter the intended shared values under **Admin → Firma Ayarları** after migration.
