# Plan: Phase 2 (future — do not build yet)

Only start after Phase 1 is live and in use.

## Job Number Generation
- `jobs` table + `job_sequences` for atomic per-year sequence.
- Format: `WB-{YEAR}-{0000}` (configurable prefix).
- Generate server-side in NestJS inside a transaction to avoid duplicates.
- Link job → client; track status, dates, assigned user.

## Inquiry Handling
- `inquiries` table: subject, description, client (optional), status (open/in-progress/resolved/closed), assigned_to, resolution, timestamps.
- Web: inquiry list, assign, status updates, simple activity log.
- Optional: convert an inquiry into a job.

## Notes
- Reuse existing auth, roles, dashboard patterns.
- Add new NestJS modules `jobs`, `inquiries`; add shared types in `packages/shared`.
- Keep schema additive (migrations only, no breaking changes).
