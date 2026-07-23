# Environment & Secrets

Never commit `.env`. Commit `.env.example` (keys only, no values).

## apps/api/.env (NestJS)
```
PORT=3000
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=***server-only***
SUPABASE_JWT_SECRET=***for verifying tokens***
RESEND_API_KEY=***
REMINDER_FROM_EMAIL=alerts@yourcompany.com
REMINDER_RECIPIENTS=***comma-separated emails, e.g. renewals@yourcompany.com,ops@yourcompany.com***
CRON_SECRET=***random-long-string***
WEB_PUSH_VAPID_PUBLIC=***
WEB_PUSH_VAPID_PRIVATE=***
APP_TIMEZONE=Asia/Colombo
CORS_ORIGIN=***comma-separated allowed origins, e.g. https://your-app.vercel.app — omit locally to allow any origin***
```

Users are created and have their passwords set directly by an admin (`auth.admin.createUser` /
`auth.admin.updateUserById`) — no invite or password-reset emails are sent, so there's no
Supabase auth-email rate limit to worry about.

## apps/web/.env (Vite — only VITE_ vars reach the browser)
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=***public-anon***
VITE_API_BASE_URL=https://your-api.onrender.com
VITE_WEB_PUSH_VAPID_PUBLIC=***
```

## Rules
- Only `VITE_`-prefixed vars are exposed to the frontend. Never put service-role key or Resend key there.
- Generate `CRON_SECRET` and VAPID keys once; store in the hosting provider's secret manager.
- Rotate keys if leaked.
