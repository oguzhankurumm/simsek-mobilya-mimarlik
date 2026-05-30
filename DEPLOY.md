# Go-Live Checklist — Şimşek Mobilya & Mimarlık

Deploying the commerce platform to production (Vercel + Neon Postgres). The
marketing site needs none of the DB/auth steps; this list is for the shop.

## 1. Database (Neon)

1. Create a Neon project (region close to your customers, e.g. `eu-central-1`).
2. Grab two connection strings from the Neon dashboard:
   - **Pooled** (has `-pooler` in the host) → `DATABASE_URL`. Append
     `?sslmode=require`.
   - **Direct** (no `-pooler`) → `DIRECT_URL`. Prisma migrations need the
     non-pooled connection.

## 2. Vercel environment variables

Set these in **Project → Settings → Environment Variables** (Production):

| Var | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | Neon **pooled** URL | runtime queries |
| `DIRECT_URL` | Neon **direct** URL | migrations |
| `JWT_SECRET` | `openssl rand -base64 48` | ≥32 chars, **never reuse dev value** |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | metadata, CSRF origin check, emails |
| `SEED_ADMIN_EMAIL` | your admin email | used once by the seed |
| `SEED_ADMIN_PASSWORD` | a strong password | **change before seeding** |
| `RESEND_API_KEY` | Resend key | optional; unset → emails log to console |
| `CONTACT_EMAIL_TO` / `CONTACT_EMAIL_FROM` | your addresses | contact form |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | admin product image uploads |
| `CRON_SECRET` | `openssl rand -hex 32` | guards the pending-order cron |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL | **cross-instance rate limiting** |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token | without it the limiter is per-instance |

> The limiter falls back to in-process if Upstash is unset — it works, but each
> Vercel instance counts independently, weakening brute-force protection. Create
> a free Upstash Redis DB and paste the REST URL + token.

## 3. Schema + seed (one time)

From a machine with `DATABASE_URL`/`DIRECT_URL` pointing at Neon:

```bash
npx prisma migrate deploy   # apply migrations (or `prisma db push` if not using migrations)
npm run db:seed             # admin user + site settings + 1 sample product/IBAN/WhatsApp
```

For an **existing** Neon DB that already has tables (created via `db push`), run
`prisma migrate resolve --applied <migration>` to baseline before
`migrate deploy`. Fresh DB: `migrate deploy` just works.

## 4. Cron (auto-cancel stale pending orders)

The app ships `/api/cron/cleanup-pending-orders` (cancels PENDING orders >7 days,
restores their stock). Wire it in `vercel.json`:

```json
{ "crons": [{ "path": "/api/cron/cleanup-pending-orders", "schedule": "0 3 * * *" }] }
```

Vercel signs cron requests with `CRON_SECRET` in the `Authorization` header; the
route rejects anything else in production.

## 5. First admin pass (after deploy)

1. Log in at `/admin/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
2. **Change the admin password** immediately (Profile).
3. Replace the seed placeholders with real data: IBANs, WhatsApp line(s), hero
   slides, categories, products. Set the legal fields (VKN/MERSIS/ETBİS) in
   Settings — Turkish distance-selling law requires them in the footer.

## 6. Post-deploy smoke (5 minutes)

- [ ] `/` and `/urunler` render; products show (no "demo katalog" banner — that
      banner only appears in dev, never in production).
- [ ] `/api/health` returns `{ "ok": true }`.
- [ ] Register a test customer → place an order → order number appears in
      `/hesabim/siparislerim`.
- [ ] Admin sees the order, changes status → customer gets the status email
      (or it logs to the server if `RESEND_API_KEY` is unset).
- [ ] Admin cancels a PENDING order → its stock is restored (not lost).
- [ ] Guest order is blocked without a name + phone.

## 7. Known follow-ups

- **Playwright e2e in CI is best-effort** — the browser download stalls on the
  GitHub runner, so the job is non-blocking (`.github/workflows/ci.yml`). The
  blocking gates are typecheck/unit, build/size, and Lighthouse. Revisit by
  caching browsers or pinning a Playwright version.
- **Prisma 6 → 7** upgrade is available; the `package.json#prisma` seed config is
  deprecated (move to `prisma.config.ts`) when you take that on.
