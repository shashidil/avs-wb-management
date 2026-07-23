# Plan: Phase 1

Goal: manage Clients, Agreements, Weighbridge Licences, and send expiry reminders.

## Milestones (build in this order)

### M0 — Scaffolding
- [ ] Monorepo setup (apps/api, apps/web, packages/shared).
- [ ] NestJS app boots with health route.
- [ ] React + Vite + Tailwind boots; `vite-plugin-pwa` configured (manifest + icons).
- [ ] Supabase project created; env wired.

### M1 — Database
- [ ] Migration: enums + clients, agreements, licences, reminder_logs, app_users.
- [ ] Indexes on expiry_date, client_id.
- [ ] Enable RLS; seed one admin user.

### M2 — Auth
- [ ] Supabase email/password login on web.
- [ ] NestJS AuthGuard verifies JWT; loads role from app_users.
- [ ] Role decorator (admin/staff). Protected routes.

### M3 — Clients CRUD
- [ ] API: clients module (list, get, create, update, deactivate).
- [ ] Web: clients list + search + create/edit form.

### M4 — Agreements CRUD
- [ ] API + web forms; link to client; status; document upload to Storage.

### M5 — Licences CRUD
- [ ] API + web forms; link to client/site; status; document upload.

### M6 — Expiry Dashboard
- [ ] Home screen with urgency buckets (🔴🟠🟡🟢) across agreements + licences.
- [ ] Filters by type/client/status.

### M7 — Reminder Engine
- [ ] RemindersService (thresholds 90/60/30/7).
- [ ] Resend email integration + templates.
- [ ] Secured cron endpoint + pg_cron daily trigger.
- [ ] reminder_logs + idempotency.
- [ ] Daily sweep to mark expired.

### M8 — Push + Polish
- [ ] Web push subscription + send.
- [ ] PWA install prompt, offline shell, app icons.
- [ ] Basic user management (admin invites staff).

### M9 — Deploy
- [ ] web → Vercel, api → Render/Railway, DB → Supabase.
- [ ] Smoke test on mobile (Android + iOS add-to-home-screen).

## Definition of done (Phase 1)
Staff can log in on phone/desktop, manage clients/agreements/licences, see what's expiring, and receive email reminders automatically.
