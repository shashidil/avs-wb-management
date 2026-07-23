# Architecture Overview

## High-level
```
[ React PWA ]  --HTTPS/REST-->  [ NestJS API ]  --SDK-->  [ Supabase ]
   (browser/mobile)                (business logic)          (Postgres, Auth, Storage, Cron)
        |                                                          |
        |<-------------- Web Push / Email (Resend) ----------------|
```

- **PWA (React + Vite):** UI, installable, offline shell, push notifications.
- **NestJS API:** validation, business rules, reminder scheduling, auth guard, talks to Supabase via service role key (server-side only).
- **Supabase:** database, user auth, file storage, and pg_cron for scheduled jobs.

## Why this split
- Supabase alone could serve the frontend directly, but NestJS gives a clean place for business logic (job number generation later, reminder rules, validation) and keeps the service-role key off the client.

## Folder structure (monorepo)
```
weighbridge-system/
├── CLAUDE.md
├── .claude/               # docs for Claude Code (this folder)
├── apps/
│   ├── api/               # NestJS backend
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── clients/
│   │       │   ├── agreements/
│   │       │   ├── licences/
│   │       │   ├── reminders/
│   │       │   └── auth/
│   │       ├── common/    # guards, filters, decorators, dto base
│   │       ├── supabase/  # supabase client provider
│   │       └── main.ts
│   └── web/               # React PWA
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── features/  # clients, agreements, licences, dashboard
│           ├── lib/       # api client, supabase client, hooks
│           └── main.tsx
├── packages/
│   └── shared/            # shared TS types (DTOs, enums) used by api + web
└── supabase/
    ├── migrations/        # SQL migrations
    └── seed.sql
```

## Module pattern (NestJS)
Each module = `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, and uses shared types from `packages/shared`.

## Auth flow
- Supabase Auth issues JWT to the PWA on login.
- PWA sends JWT in `Authorization: Bearer` to NestJS.
- NestJS `AuthGuard` verifies the JWT with Supabase and attaches the user + role.
- Roles: `admin` (full), `staff` (CRUD, no user management).

## Deployment
- **web** → Vercel (static + service worker).
- **api** → Railway or Render (single small instance).
- **db/auth/storage/cron** → Supabase project.
