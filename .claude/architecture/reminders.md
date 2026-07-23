# Reminder Engine

Sends expiry alerts for agreements and licences.

## Approach (pick ONE, A recommended for low cost)

### A. Supabase pg_cron + NestJS endpoint (recommended)
1. A daily `pg_cron` job (or Supabase Scheduled Function) calls a secured NestJS endpoint `POST /internal/run-reminders` once per day (e.g. 07:00).
2. Endpoint is protected by a secret header (`x-cron-secret`), not user auth.
3. NestJS `RemindersService`:
   - For each threshold in [90,60,30,7]:
     - find agreements/licences where `expiry_date = today + threshold` AND status active.
     - skip if a `reminder_logs` row already exists for that (entity, threshold, channel).
     - send email via Resend (+ web push if subscribed).
     - insert `reminder_logs` row.
4. Also flag records where `expiry_date < today` → set status `expired` (daily sweep).

### B. Pure Supabase Edge Function
Same logic in an Edge Function on a schedule. Use only if you drop NestJS for reminders. Keeps everything in Supabase but splits business logic — not preferred since logic lives in NestJS.

## Rules
- Idempotent: never send the same (entity, days_before, channel) twice — enforced by unique index + pre-check.
- Email is the reliable channel. Push is best-effort (especially iOS).
- Timezone: run in company local time (Asia/Colombo). Store dates as `date`, compare in that TZ.
- Log every attempt (sent/failed) with error captured.

## Dashboard (frontend)
Main screen buckets records by urgency:
- 🔴 expired / ≤7 days
- 🟠 8-30 days
- 🟡 31-90 days
- 🟢 >90 days
Query: order by `expiry_date asc`, filter active.

## Config (later)
Thresholds and recipients should move to a `settings` table so admins can edit without redeploy.
