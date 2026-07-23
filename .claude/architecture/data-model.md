# Data Model

Source of truth for tables. Do not invent columns. All tables have `id uuid pk`, `created_at`, `updated_at`.

## Enums
- `agreement_status`: `active | expired | terminated | pending`
- `licence_status`: `active | expired | suspended | pending`
- `reminder_channel`: `email | push`
- `entity_type`: `agreement | licence`
- `user_role`: `admin | staff`

## Tables

### clients
| column | type | notes |
|--------|------|-------|
| id | uuid | pk |
| name | text | required |
| contact_person | text | |
| phone | text | |
| email | text | |
| address | text | |
| reg_no | text | business/NIC reg number |
| notes | text | |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | |

### agreements
| column | type | notes |
|--------|------|-------|
| id | uuid | pk |
| client_id | uuid | fk → clients.id |
| title | text | |
| type | text | e.g. transport, weighbridge service |
| start_date | date | |
| expiry_date | date | required, indexed |
| value | numeric(14,2) | optional |
| status | agreement_status | default active |
| document_url | text | Supabase storage path |
| notes | text | |

### licences  (weighbridge licences)
| column | type | notes |
|--------|------|-------|
| id | uuid | pk |
| client_id | uuid | fk → clients.id (nullable if own site) |
| site_name | text | weighbridge location |
| licence_no | text | required |
| issuing_authority | text | |
| issue_date | date | |
| expiry_date | date | required, indexed |
| status | licence_status | default active |
| document_url | text | |
| notes | text | |

### reminder_logs
| column | type | notes |
|--------|------|-------|
| id | uuid | pk |
| entity_type | entity_type | agreement or licence |
| entity_id | uuid | id of that record |
| days_before | int | e.g. 90/60/30/7 |
| channel | reminder_channel | |
| recipient | text | email/user |
| sent_at | timestamptz | |
| status | text | sent / failed |

Prevents duplicate sends: unique on (entity_type, entity_id, days_before, channel).

### app_users
Mirrors Supabase auth users with role.
| column | type | notes |
|--------|------|-------|
| id | uuid | = auth.users.id |
| email | text | |
| full_name | text | |
| role | user_role | default staff |
| is_active | boolean | default true |

### push_subscriptions
Added in M8 for web push. One row per subscribed browser/device.
| column | type | notes |
|--------|------|-------|
| id | uuid | pk |
| user_id | uuid | fk → app_users.id |
| endpoint | text | unique, the browser push endpoint URL |
| p256dh | text | subscription public key |
| auth | text | subscription auth secret |

Prevents duplicate rows per device: unique on `endpoint`.

## Phase 2 (design now, build later — do NOT create yet unless asked)
- `jobs`: id, job_no (formatted e.g. WB-2026-0001), client_id, type, status, created_by, dates...
- `job_sequences`: for atomic sequential number generation per year.
- `inquiries`: id, client_id?, subject, description, status, assigned_to, resolution...

## Reminder thresholds
Default remind at **90, 60, 30, 7** days before expiry. Configurable later.

## Indexes
- `agreements(expiry_date)`, `licences(expiry_date)`, `agreements(client_id)`, `licences(client_id)`.
