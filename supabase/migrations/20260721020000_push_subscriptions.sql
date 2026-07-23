-- M8: web push subscriptions (one row per subscribed browser/device).
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_push_subscriptions_user_id on push_subscriptions (user_id);

create trigger trg_push_subscriptions_updated_at
  before update on push_subscriptions for each row execute function set_updated_at();

alter table push_subscriptions enable row level security;
