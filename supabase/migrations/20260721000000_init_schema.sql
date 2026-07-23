-- M1: enums, core tables, indexes, RLS
-- Source of truth: .claude/architecture/data-model.md

-- ── Enums ────────────────────────────────────────────────
create type agreement_status as enum ('active', 'expired', 'terminated', 'pending');
create type licence_status as enum ('active', 'expired', 'suspended', 'pending');
create type reminder_channel as enum ('email', 'push');
create type entity_type as enum ('agreement', 'licence');
create type user_role as enum ('admin', 'staff');

-- ── clients ──────────────────────────────────────────────
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  reg_no text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── agreements ───────────────────────────────────────────
create table agreements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  title text,
  type text,
  start_date date,
  expiry_date date not null,
  value numeric(14, 2),
  status agreement_status not null default 'active',
  document_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── licences (weighbridge licences) ─────────────────────
create table licences (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  site_name text,
  licence_no text not null,
  issuing_authority text,
  issue_date date,
  expiry_date date not null,
  status licence_status not null default 'active',
  document_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── reminder_logs ────────────────────────────────────────
create table reminder_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  entity_id uuid not null,
  days_before int not null,
  channel reminder_channel not null,
  recipient text not null,
  sent_at timestamptz not null default now(),
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id, days_before, channel)
);

-- ── app_users (mirrors Supabase auth users, adds role) ──
create table app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────
create index idx_agreements_expiry_date on agreements (expiry_date);
create index idx_agreements_client_id on agreements (client_id);
create index idx_licences_expiry_date on licences (expiry_date);
create index idx_licences_client_id on licences (client_id);

-- ── updated_at trigger ───────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_clients_updated_at
  before update on clients for each row execute function set_updated_at();
create trigger trg_agreements_updated_at
  before update on agreements for each row execute function set_updated_at();
create trigger trg_licences_updated_at
  before update on licences for each row execute function set_updated_at();
create trigger trg_reminder_logs_updated_at
  before update on reminder_logs for each row execute function set_updated_at();
create trigger trg_app_users_updated_at
  before update on app_users for each row execute function set_updated_at();

-- ── Row Level Security ───────────────────────────────────
-- NestJS talks to Supabase via the service-role key, which bypasses RLS,
-- so enabling with no policies is correct for now: it default-denies any
-- direct browser access. See .claude/guidelines/supabase.md.
alter table clients enable row level security;
alter table agreements enable row level security;
alter table licences enable row level security;
alter table reminder_logs enable row level security;
alter table app_users enable row level security;
