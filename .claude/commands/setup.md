# Command: Project Setup

Repeatable setup steps. Run from repo root.

## Monorepo init
```bash
mkdir -p apps packages/shared supabase/migrations
npm init -y            # root (workspaces)
# add to root package.json:  "workspaces": ["apps/*", "packages/*"]
```

## Backend (NestJS)
```bash
npm i -g @nestjs/cli
cd apps && nest new api --package-manager npm --skip-git
cd api
npm i @supabase/supabase-js class-validator class-transformer
npm i resend web-push
# generate modules
nest g module clients && nest g controller clients && nest g service clients
nest g module agreements && nest g controller agreements && nest g service agreements
nest g module licences && nest g controller licences && nest g service licences
nest g module reminders && nest g service reminders
nest g module auth
```

## Frontend (React PWA)
```bash
cd apps
npm create vite@latest web -- --template react-ts
cd web
npm i @supabase/supabase-js @tanstack/react-query react-hook-form zod
npm i -D vite-plugin-pwa tailwindcss postcss autoprefixer
npx tailwindcss init -p
# configure vite-plugin-pwa in vite.config.ts (manifest + workbox)
```

## Shared types
```bash
cd packages/shared && npm init -y
# export DTO/enum types; reference from api & web via workspace import
```

## Supabase
```bash
npm i -g supabase
supabase login
supabase init
supabase link --project-ref <ref>
# put SQL in supabase/migrations, then:
supabase db push
```

## Run dev
```bash
# terminal 1
cd apps/api && npm run start:dev
# terminal 2
cd apps/web && npm run dev
```
