# Command: Add a Feature / Module

Follow this workflow when asked to build a new feature. Keeps changes small and token-cheap.

## Steps
1. **Confirm scope.** Restate the feature in 1-2 lines. Check the matching plan in `.claude/plans/`.
2. **Check schema.** Read `.claude/architecture/data-model.md`. If new tables/columns are needed, write a migration in `supabase/migrations/` first. Do not invent fields.
3. **Shared types.** Add/extend DTOs + enums in `packages/shared`.
4. **Backend (NestJS).**
   - Create/extend module: controller (routes) → service (logic) → supabase provider.
   - Add DTO validation. Guard routes + role check.
5. **Frontend (PWA).**
   - Add feature folder under `features/`.
   - API calls via `lib/api.ts`. Server state via TanStack Query. Forms via RHF + zod.
   - Mobile-first UI.
6. **Test the happy path** locally; note any edge cases.
7. **Summarize** the diff in 2-3 lines and update the checklist in the relevant plan file.

## Guardrails
- Open only files you edit.
- No secrets in frontend.
- Migrations are additive; never break existing columns.
- Reuse existing patterns (auth, query hooks, form components).
