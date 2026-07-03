-- =========================================================
-- HASHMI STORE — Phase 1 Migration
-- Ye SQL Editor me paste karke Run karo (existing project pe,
-- naya project nahi banana — ye purani tables ke saath add hota hai)
-- =========================================================

-- ---------------------------------------------------------
-- 1) PRODUCTS: stock tracking
-- ---------------------------------------------------------
alter table public.products
  add column if not exists stock integer not null default 50;

-- ---------------------------------------------------------
-- 2) PROFILES TABLE — customer settings (avatar, phone, address)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  address     text,           -- default delivery address
  avatar_url  text,
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Har user sirf apni profile dekh/badal sake
create policy "Profiles: user reads own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Profiles: user inserts own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Profiles: user updates own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Naya user signup kare to profile row apne aap ban jaye
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- 3) STORAGE BUCKET — profile avatars
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

create policy "Avatars: user uploads own"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Avatars: user updates own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Avatars: user deletes own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
