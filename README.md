# The Oasis Abeokuta

Next.js App Router application with React, plain responsive CSS, and a server-side Supabase Data API registration endpoint. The original workspace contained only design/media assets, with no application, tests, database, or admin dashboard.

## Run locally

Requires Node.js 20.9+.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. All booking/coming-soon links lead to `/early-access`.

## Connect Supabase

1. The project **The Oasis Abeokuta** is created in **Adsahq**, reference `nzuwqfqxprtvuyskjhyk`, region `eu-west-1`, on the quoted $0/month plan.
2. The migration has already been applied to this project as `create_early_access_registrations`. Do not re-run its CREATE TABLE statements there. The local SQL file records the schema for review or setup of another environment.
3. `.env.local` has the project URL configured. Copy the project secret key from [Supabase API Keys](https://supabase.com/dashboard/project/nzuwqfqxprtvuyskjhyk/settings/api-keys) into `SUPABASE_SECRET_KEY` there. A legacy `SUPABASE_SERVICE_ROLE_KEY` is also supported. These are server-only variables: never use a `NEXT_PUBLIC_` prefix or commit secrets.
4. Restart the app and submit a registration. Verify the row in Supabase Table Editor → `early_access_registrations`.

There is no JSON or browser-local registration storage. Missing credentials or an unavailable database return a helpful error; the UI never claims a real registration succeeded when storage fails.

Records contain full name, normalized phone, lowercase/trimmed email, and a database-generated registration timestamp. A unique database constraint on normalized email prevents concurrent duplicates. Repeated submissions return the same success response without changing the original details or exposing whether an address was registered.

RLS is enabled and privileges are revoked from `anon` and `authenticated`. Only the server service role can insert/read records through the API. No public read endpoint exists. Authorized Supabase project administrators can view, sort and export registrations from Table Editor; a second administrative login system is deliberately unnecessary. Limit project membership to the administrators who need access. See [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Checks

```sh
npm test
npm run build
npm start
```

Tests cover server validation and normalization, malformed/oversized requests, origin protection, storage failure, idempotent duplicate handling and honeypot filtering. They use a storage test double and do not prove a live Supabase project is connected. To verify the database: submit a dedicated test email, repeat it with different casing/outer spaces, verify only one row exists and its original fields/date are retained, then remove the test row in the authorized Supabase dashboard. Verify anonymous/publishable-key requests cannot read or insert into the table.

## Assets and reference

- Layout, navy/gold palette, logo crop, typography proportions, four image slots and feature row follow the supplied reference PNG.
- `public/assets/logo.png` is an unchanged rectangular crop from that reference. No standalone official logo was supplied; replace it with the official source asset when available for higher resolution.
- Hero: supplied `The_Oasis_Abeokuta_Cinematic_Motion.mp4`, muted and looped, with a photo fallback and pause control. Reduced-motion preferences suppress playback.
- The gallery uses the three supplied property photographs. The second photo, supplied later from Downloads, replaces the temporary video still. Original images remain intact.
- No external stock imagery, booking system, payments, or deployment has been added.

## Before production

Configure Supabase and apply the migration, verify the real registration flow, set the same server environment variables on the chosen host, and use HTTPS. Supabase provides persistent storage independently of the Next.js host. Keep database backups and retention settings appropriate to your operation. The app includes a honeypot and request-size limit; configure host-level rate limiting if needed for public launch traffic. Deployment requires the owner's approval.

## Verification in this workspace

The 13 registration tests pass and the production build passes. Tests include the Supabase HTTP payload and authentication headers. The new live Supabase database also passed transaction-scoped checks for service-role insert/read, generated IDs/timestamps, duplicate-email rejection, lowercase-email enforcement, phone validation, RLS, and denied anon/authenticated privileges. Test records were rolled back; the table remains empty.

The Supabase security advisor reports only the informational [RLS enabled with no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) notice: intentional here because all public privileges are revoked and only the server service role is used. The performance advisor reports the date index as [unused](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index), expected for this new empty table.

The project URL is configured in `.env.local`. The key has been updated and is now identified as a server secret key (`sb_secret_...`), without displaying its value. The user ran `npm run test:live` from their terminal and confirmed authentication, table access, real registration persistence, generated date, input validation, and normalized-email duplicate prevention all pass. The synthetic test record was subsequently removed through the authorized Supabase connection. The workspace itself cannot reach Supabase because hostname resolution fails (`ENOTFOUND`); the live test passed from the user’s terminal. Run `npm run test:live` in your own terminal to verify real registration storage, its generated date and duplicate prevention. This creates one synthetic `oasis-connection-test@example.invalid` record for review; remove it through the Supabase Table Editor afterward. The script never displays secret values. Local server startup is blocked by the workspace (`listen EPERM`), and Chromium could not launch here, so visual/browser verification remains outstanding. Nothing has been deployed.

## Vercel deployment

Production deployment `dpl_CaKbEdyH6UtRv5pu52bj4eVHjGh7` is READY in project `the-oasis-abeokuta` (`prj_gwvm0A8nIg8pAqL96JdoGAdyHTRs`), team `samuels-projects-87b0a359`. Source files were uploaded directly through Vercel; no Git repository is connected. The server runs in Dublin (`dub1`) near the Supabase project. Production-only Supabase configuration was added; the secret is stored as a sensitive variable. The local `.env.local` was excluded from the source upload.

Homepage and `/early-access` returned HTTP 200 through the authenticated Vercel fetch tool. The production-domain registration POST and browser journey still need verification after DNS is connected. Deployment URL: https://the-oasis-abeokuta.vercel.app (Vercel authentication may apply to this URL).

Both `theoasisabeokuta.com` and `www.theoasisabeokuta.com` are attached. The www domain redirects permanently (308) to the apex. DNS is still pointing to Namecheap parking. Vercel returned these recommended records for this project:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 216.198.79.1 |
| A | @ | 64.29.17.1 |
| CNAME | www | 7a3246a964be3bbe.vercel-dns-017.com |

Set TTL to Automatic. Replace the existing parking/URL-redirect records at @ and parking CNAME at www. Preserve unrelated MX/TXT/email records and the existing nameservers. Verify DNS and HTTPS through Vercel after saving.
