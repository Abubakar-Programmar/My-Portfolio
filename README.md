# Personal portfolio — public site, API and admin panel

A production-ready portfolio for a developer / SEO consultant, built with **Nuxt 4**, **Nitro**, **PostgreSQL (Drizzle ORM)** and **Tailwind CSS**. It has a public website, a typed server API and a single-admin dashboard that edits everything the site shows — no code changes needed.

## Quick start

```bash
pnpm install
cp .env.example .env     # fill in DATABASE_URL, NUXT_SESSION_PASSWORD, MAIL_* and ADMIN_EMAIL
pnpm db:seed             # creates the admin account + sample content (safe to re-run)
pnpm dev                 # applies pending migrations automatically, then serves the site
```

- Public site: `http://localhost:3000` (match the port in `APP_URL`)
- Admin panel: `/admin/login` (not linked from the public site)

`pnpm dev` runs pending migrations on startup and verifies the SMTP connection (logging only success or failure, never credentials).

> **Database sharing.** All tables live in a dedicated Postgres schema called `portfolio`, so the app can share a database with other applications without touching their tables. Migrations are tracked in `portfolio.__migrations`.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` / `build` / `preview` | Nuxt dev server, production build, preview of the build |
| `pnpm db:generate` | Generate a SQL migration from `server/database/schema.ts` |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:push` | Push the schema directly (prototyping) |
| `pnpm db:seed` | Seed admin account, settings and sample content (`pnpm db:seed --reset` wipes content first; `pnpm db:seed --sync-services` adds any missing sample services) |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm lint` / `typecheck` | ESLint, `vue-tsc` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright flows (contact → inbox → notification → email, admin login, CRUD) |

End-to-end tests start their own dev server on port 3100 (or use `PLAYWRIGHT_BASE_URL`). Run `pnpm exec playwright install chromium` once, or set `PW_CHANNEL=msedge` / `chrome` to use an installed browser.

## Environment variables

See [.env.example](.env.example) — every variable is documented there. Highlights:

- `DATABASE_URL`, `NUXT_SESSION_PASSWORD` (≥ 32 chars), `APP_URL`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_ENCRYPTION` (`tls` or `ssl`), `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seeded once; if the password is missing the seed generates one and writes it to `.env`)
- `UPLOADS_DIR` — where uploaded media lives (outside the build output; back it up)

`APP_URL` is read at **build** time for canonical URLs, sitemap and RSS; set it to your production URL before `pnpm build`.

## Architecture

```
app/                    Nuxt front end (SSR public site, SPA admin)
  pages/                Public pages + pages/admin/** (SPA, noindex)
  components/           UI; components/admin/** for the admin
  composables/          useSite, usePageSeo, useAdminNotifications …
  utils/                adminResources.ts (declarative CRUD config), adminSettings.ts, format, api helpers
  plugins/              v-reveal scroll animations, first-party analytics, hydration marker
shared/                 Zod schemas + text utils used by BOTH client and server
server/
  api/                  Public JSON API; api/admin/** is admin-only
  middleware/           CSRF origin check, admin session guard
  plugins/              Auto-migrate on startup, SMTP verification
  tasks/                Weekly summary email (Nitro scheduled task)
  routes/               /media/** (safe file serving + sharp resizing), /rss.xml
  database/             Drizzle schema, migrations, migrator, seed
  utils/                auth, mail + templates, notify (DB → SSE → email), resources registry, sanitize …
tests/                  unit (Vitest) and e2e (Playwright)
```

### How the pieces fit

- **Validation:** one Zod schema per form lives in `shared/schemas`; the browser validates before submitting and every API route re-validates. Errors use one format: `{ statusCode, statusMessage, message, data: { errors } }` (stack traces only appear in dev).
- **Admin CRUD is data-driven.** `app/utils/adminResources.ts` describes each resource's list columns and form fields; `server/utils/resources.ts` registers the matching table, schema and hooks. Adding a field = schema column + zod field + one config line.
- **Auth:** argon2id hashes, sealed httpOnly `SameSite=Strict` session cookie, plus a server-side `admin_session` row per sign-in so sessions can be revoked instantly. Lockout after 5 failures (15 min), rate limiting, optional TOTP 2FA, forgot password via a 6-digit emailed code (10-minute expiry, 5 attempts, no reuse of the current password). Every `/api/admin/*` route is guarded by server middleware — client guards are UX only.
- **Notifications:** every event is stored in `notification` first, pushed live to the dashboard bell over Server-Sent Events (polling fallback), then emailed (with retry/backoff) if the preference is on. Delivery results are in `email_log` (Admin → Site settings → Email delivery).
- **Uploads:** MIME is detected from magic bytes (client MIME is ignored), images are re-encoded to WebP with sharp (metadata stripped), saved under random names and served by `/media/<file>?w=…` with on-demand resizing and long-lived caching. SVG uploads are rejected.
- **Analytics:** first-party and cookie-less (path, referrer host, device type, optional country header). No IP stored, Do Not Track respected, admin excluded.
- **SEO:** per-page meta, Open Graph/Twitter, canonical URLs, JSON-LD (Person, Service, FAQPage, Article, BreadcrumbList), dynamic sitemap, robots, RSS.
- **Security:** CSP with nonces, HSTS, X-Frame-Options, rate limits (contact, login, reset), honeypot + minimum-fill-time on forms, HTML sanitisation of rich text, CSV formula-injection protection.

## Admin guide

Sign in at `/admin/login`.

- **Dashboard** — message and content counts, visits vs. last week, 30-day charts, top pages, recent messages and activity, quick actions.
- **Inbox** — filter by status, service and date; star, archive, mark spam; bulk actions; internal notes; reply by email (stored with the thread); CSV export. Opening a message marks it read.
- **Services / Projects / Blog / Testimonials** — create, edit, duplicate, delete. Rich text via the editor, image library picker, drag-to-reorder galleries, SEO fields, featured toggles. Blog posts support *Draft*, *Scheduled* (goes live automatically at the publish date) and *Published*.
- **Profile** — bio, photo, resume PDF, availability badge, home-page counters; **Skills / Experience / Education / Certifications** have their own lists.
- **Media library** — upload (drag & drop), alt text, delete (blocked while a file is in use).
- **Site settings** — site title, logo, favicon, SEO defaults, contact details, social links, notification address and preferences, auto-reply, maintenance mode, **Send test email**.
- **Security** — change password, 2FA, active sessions (revoke), login history.
- **Activity log** and **Data export** (JSON/CSV).

## Notes

- Seeded testimonials, clients, employers and statistics are **fictional samples** — replace them from the admin before launch.
- The weekly summary is a Nitro scheduled task (Mondays 08:00). It runs in the server process, so it needs a long-running Node host.
- Deployment is intentionally not configured; run `pnpm build` and start `.output/server/index.mjs` with the environment variables set (`node --env-file=.env .output/server/index.mjs`). Migrations run on startup when `server/database/migrations` is present next to the working directory, or run `pnpm db:migrate`.

## Image credits

Service artwork in `public/seed/services/` uses free photos from [Unsplash](https://unsplash.com) (Unsplash License — no attribution required).
