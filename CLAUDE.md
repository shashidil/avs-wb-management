# CLAUDE.md

Root context for Claude Code. Keep this file short. Load detailed docs ONLY when needed (paths below).

## Project
Internal management system for a weighbridge + logistics company (8-10 users).
- **Phase 1:** Clients, Agreements, Weighbridge Licences, Expiry Reminders.
- **Phase 2 (later):** Job number generation, Inquiry handling.

## Stack
- **Backend:** NestJS (TypeScript, REST)
- **DB + Auth + Storage + Cron:** Supabase (Postgres)
- **Frontend:** React + Vite + TypeScript PWA (`vite-plugin-pwa`), Tailwind + Mantine/shadcn
- **Notifications:** Email (Resend) primary, Web Push secondary
- **Hosting:** Frontend → Vercel/Netlify; Backend → Railway/Render; DB → Supabase (all free/low tier)

## Golden Rules (read before coding)
1. Do NOT read large files or the whole repo. Ask for / open only the file you are editing.
2. Follow the schema in `.claude/architecture/data-model.md` — do not invent fields.
3. Follow conventions in `.claude/guidelines/coding-standards.md`.
4. Before a big change, check `.claude/plans/` for the current plan. If none, propose one first.
5. Never commit secrets. Use `.env` (see `.claude/guidelines/env.md`).
6. Prefer small, focused diffs. Explain what changed in 2-3 lines.

## When to load more context (token discipline)
| Task | Load this file |
|------|----------------|
| DB / tables / relations | `.claude/architecture/data-model.md` |
| System design, folders | `.claude/architecture/overview.md` |
| Code style, naming, patterns | `.claude/guidelines/coding-standards.md` |
| Supabase usage | `.claude/guidelines/supabase.md` |
| Env vars / secrets | `.claude/guidelines/env.md` |
| Reminder logic | `.claude/architecture/reminders.md` |
| A specific feature build | matching file in `.claude/plans/` |
| Repeatable command | matching file in `.claude/commands/` |

Do not load files not relevant to the current task.

## Current status
Phase 1 — initial setup. See `.claude/plans/phase-1.md`.
