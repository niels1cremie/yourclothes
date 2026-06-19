-- MIRROR — wardrobe persistence.
-- Every isolated garment detected by the AI scanner is stored as a row here.

create table if not exists public.user_wardrobe (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  category text not null,
  style text not null,
  color text not null,
  fabric text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_wardrobe_user_id_idx
  on public.user_wardrobe (user_id, created_at desc);

alter table public.user_wardrobe enable row level security;

create policy "Users read own wardrobe"
  on public.user_wardrobe for select
  using (auth.uid() = user_id);

create policy "Users insert own wardrobe"
  on public.user_wardrobe for insert
  with check (auth.uid() = user_id);

create policy "Users delete own wardrobe"
  on public.user_wardrobe for delete
  using (auth.uid() = user_id);
