-- MIRROR — subscription engine.
-- One row per user holding their active tier:
--   'atelier' (Free) · 'couture' (Premium Monthly) · 'pro' (Yearly)

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tier text not null default 'atelier' check (tier in ('atelier', 'couture', 'pro')),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.user_subscriptions enable row level security;

create policy "Users read own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users insert own subscription"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users update own subscription"
  on public.user_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at fresh on every write.
create or replace function public.set_user_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_subscriptions_updated_at on public.user_subscriptions;
create trigger trg_user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row execute function public.set_user_subscriptions_updated_at();
