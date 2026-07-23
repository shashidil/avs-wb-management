# Supabase Guidelines

## Keys (critical)
- **anon key** → used by the PWA (public, safe, limited by RLS).
- **service-role key** → used by NestJS ONLY, server-side. NEVER ship to the browser.

## Client setup
- NestJS: create one Supabase client with the service-role key in `apps/api/src/supabase/supabase.provider.ts`. Inject it into services.
- Web: create a Supabase client with the anon key in `apps/web/src/lib/supabase.ts` — used mainly for Auth (login/session), not direct table writes.

## Data access pattern
- Writes and business reads go **through NestJS**, not directly from the browser. This keeps logic centralized (validation, job numbers, reminders).
- The browser uses Supabase directly only for: auth/session, and (optionally) file uploads to Storage.

## Row Level Security (RLS)
- Enable RLS on all tables.
- Since NestJS uses the service-role key (bypasses RLS), enforce authorization in NestJS guards.
- If you ever let the browser query tables directly, write strict RLS policies first.

## Auth
- Use Supabase email/password auth. Invite the 8-10 users manually (no public signup).
- On login, web gets a JWT session; send it to NestJS; NestJS verifies via `supabase.auth.getUser(jwt)`.
- Store role in `app_users` table; join on request to get role.

## Storage
- Bucket `documents` for agreement/licence PDFs. Private bucket; generate signed URLs via NestJS when viewing.

## Migrations
- All schema changes as SQL files in `supabase/migrations/` (timestamped). No manual dashboard-only changes — keep them in git.

## Scheduled jobs
- Use `pg_cron` (enable extension) or Supabase Scheduled Functions for the daily reminder trigger. See `.claude/architecture/reminders.md`.

## Free-tier notes
- Free tier: 500MB DB, 1GB storage, 50k monthly active users, 2 projects. Ample for 8-10 users.
- Project pauses after inactivity on free tier — for production, the ~$25/mo Pro tier avoids pausing. Start free, upgrade when live.
