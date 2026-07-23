# Deploy Guide

How to ship changes to production without help. Read this before your first solo deploy.

## The moving parts

| Piece | Where it lives | Live URL |
|---|---|---|
| Web (React PWA) | Vercel | https://avs-wb-management.vercel.app |
| API (NestJS) | Render | https://avs-wb-api.onrender.com |
| Database + Auth + Storage + Cron | Supabase | (your Supabase dashboard) |

## Two GitHub remotes — important

This repo pushes to **two** places, because Vercel's free plan won't deploy from a
GitHub Organization repo:

- `origin` → `github.com/AVS-Dev-app/avs-wb-management` — **Render watches this one** (API).
- `personal` → `github.com/shashidil/avs-wb-management` — **Vercel watches this one** (web).

Check your remotes any time with `git remote -v`.

**Every time you want to deploy, push to both:**

```bash
git push origin main
git push personal main
```

If you only push to one, only that half of the app updates — the other stays on the
old version. This is the #1 thing to remember.

## Normal deploy flow

1. Make your code changes.
2. If you changed anything in `packages/shared`, run `npm run build -w packages/shared`
   locally first and confirm `apps/api` / `apps/web` still build:
   ```bash
   npm run build -w packages/shared
   npm run build -w apps/api
   npm run build -w apps/web
   ```
3. Commit as normal.
4. Push to both remotes (above). That's it — Render and Vercel each auto-build and
   redeploy on push. No dashboard clicks needed for a normal code change.
5. Render takes ~3-5 min, Vercel ~1-2 min. Check progress in each dashboard if you
   want to watch, or just wait and test the live URL after.

## If only the web app changed (no API/shared changes)

You can skip the org repo and only push `personal` — but it's simpler and harmless
to just always push both, so that's the recommended habit.

## Manually re-triggering a deploy (no code change)

Useful after changing an environment variable in a dashboard, since those don't
auto-redeploy on their own.

- **Render**: dashboard → `avs-wb-api` service → **Manual Deploy** → **Deploy latest commit**.
- **Vercel**: dashboard → project → **Deployments** tab → **⋯** on the latest one → **Redeploy**.

## Changing environment variables / secrets

Env vars live in each provider's dashboard, not in git (never commit real `.env` files).

- **API secrets** (Supabase keys, Resend key, CRON_SECRET, VAPID keys, CORS_ORIGIN):
  Render dashboard → `avs-wb-api` → **Environment** tab. Editing a value triggers an
  automatic redeploy.
- **Web vars** (`VITE_*`): Vercel dashboard → project → **Settings** → **Environment
  Variables**. You must **Redeploy** manually after changing these — Vercel doesn't
  auto-redeploy on env var changes.
- Full list of what each app needs: `apps/api/.env.example` and `apps/web/.env.example`.
- `render.yaml` at the repo root also documents/pins the non-secret API env vars
  (`PORT`, `APP_TIMEZONE`, `CORS_ORIGIN`) — Render auto-syncs those from git on push.

## Database changes (new migration)

1. Write your SQL in a new file under `supabase/migrations/`, named like the
   existing ones (`YYYYMMDDHHMMSS_description.sql`), so history stays readable.
2. Open your Supabase project → **SQL Editor**, paste the SQL, run it.
3. Commit the migration file to git too, so it's documented — but running it in the
   SQL Editor is what actually applies it. There's no separate "deploy the database"
   step; Supabase isn't rebuilt from git.

## Rolling back a bad deploy

- **Render**: dashboard → `avs-wb-api` → **Events**/**Deploys** tab → find the last
  good deploy → **Rollback to this deploy**.
- **Vercel**: dashboard → project → **Deployments** → find the last good one → **⋯**
  → **Promote to Production**.
- Neither of these touches the database, so a rollback is safe for code-only bugs.
  If a migration caused the problem, you'll need to write a follow-up migration to
  undo it — Postgres migrations aren't auto-reversible here.

## After deploying: PWA cache gotcha

Anyone with the app installed on their phone (Add to Home Screen) may keep seeing
the old version for a bit — the service worker caches the app shell. Tell users to
fully close the app (swipe away, don't just background it) and reopen it after a
deploy. It self-updates on the next fresh launch.

## Troubleshooting checklist

- **Web loads but API calls fail / blank data**: check `VITE_API_BASE_URL` in Vercel
  matches the real Render URL exactly (no trailing slash), and that you redeployed
  Vercel after setting it.
- **CORS errors in browser console**: `CORS_ORIGIN` in Render must exactly match the
  Vercel URL you're loading the app from (scheme + host, no trailing slash). Multiple
  origins can be comma-separated.
- **Reminders not sending**: check Supabase SQL Editor → `select * from cron.job;`
  confirms the `daily-reminders` job exists. You can manually trigger a test run any
  time with a POST to `/internal/run-reminders` with header `x-cron-secret: <value>`.
- **Render API "sleeping"**: free tier spins down after ~15 min idle; first request
  after that takes 30-60s to wake up. Not a bug.
- Logs: Render dashboard → **Logs** tab (API errors). Vercel dashboard → deployment →
  **Build Logs** / **Function Logs** (build or routing errors).
