# Coding Standards

## General
- TypeScript strict mode everywhere. No `any` unless justified with a comment.
- Shared types (DTOs, enums) live in `packages/shared` — import from there in both api and web. Never redefine.
- Small files, single responsibility. Prefer clear names over comments.
- No dead code, no console.log in committed code (use the logger).

## NestJS (backend)
- One module per domain: clients, agreements, licences, reminders, auth.
- Structure: `controller` (routes only) → `service` (logic) → supabase provider (data).
- Validate all input with DTOs + `class-validator`. Enable global `ValidationPipe`.
- Return typed responses; wrap errors with Nest exceptions (`NotFoundException`, etc.).
- Never expose the Supabase service-role key to the client. Server-side only.
- Guard every route except health + login. Role check via a `@Roles()` decorator.

## React PWA (frontend)
- Functional components + hooks only.
- Data fetching via a typed API client in `lib/api.ts` (wraps fetch, attaches JWT).
- Use **TanStack Query** for server state (caching, refetch) — keep it simple.
- Forms: React Hook Form + zod (zod schema can be shared from `packages/shared`).
- Keep components presentational; put logic in hooks under `features/*`.
- Mobile-first Tailwind. Test layouts at 360px width.

## Naming
- Files: `kebab-case.ts`. React components: `PascalCase.tsx`.
- DB columns: `snake_case`. TS fields: `camelCase` (map at the boundary).
- Booleans: `is_`, `has_` prefix.

## Git
- Small commits, imperative messages: `feat(agreements): add expiry filter`.
- Never commit `.env`, keys, or `dist/`.

## Token discipline for Claude Code
- Open only the file(s) you edit. Do not scan the repo.
- Reuse types from `packages/shared` instead of re-reading models.
- When unsure of schema, read `.claude/architecture/data-model.md`, not the whole DB.
