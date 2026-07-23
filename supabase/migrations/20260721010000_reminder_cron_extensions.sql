-- M7: enable the extensions needed to schedule the daily reminder sweep.
-- Safe to run now, even before the API is deployed.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- ─────────────────────────────────────────────────────────────────
-- DO NOT RUN YET. Run this manually in the SQL Editor once the API
-- is deployed (M9) and you have a real public URL + CRON_SECRET.
--
-- This schedules a daily call to POST /internal/run-reminders at
-- 07:00 Asia/Colombo (01:30 UTC, since Sri Lanka is UTC+5:30 with
-- no DST). Replace <YOUR-API-URL> and <YOUR-CRON-SECRET> below.
--
-- select cron.schedule(
--   'daily-reminders',
--   '30 1 * * *',
--   $$
--   select net.http_post(
--     url := 'https://<YOUR-API-URL>/internal/run-reminders',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'x-cron-secret', '<YOUR-CRON-SECRET>'
--     )
--   );
--   $$
-- );
--
-- To update the schedule later: select cron.unschedule('daily-reminders');
-- then re-run cron.schedule(...) with the new values.
-- ─────────────────────────────────────────────────────────────────
