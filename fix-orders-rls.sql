-- =========================================================
-- FIX: Orders table par insert policy dobara (safely) banao
-- Ye script dobara bhi chalayi ja sakti hai, koi error nahi degi.
-- =========================================================

-- Pehle confirm karo RLS on hai
alter table public.orders enable row level security;

-- Purani (agar tooti hui) policy hatao
drop policy if exists "Orders: anyone can place an order" on public.orders;
drop policy if exists "Orders: authenticated read" on public.orders;
drop policy if exists "Orders: authenticated update" on public.orders;

-- Dobara sahi se banao
create policy "Orders: anyone can place an order"
  on public.orders for insert
  to anon, authenticated
  with check (true);

create policy "Orders: authenticated read"
  on public.orders for select
  to authenticated
  using (true);

create policy "Orders: authenticated update"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

-- Isko run karke confirm karo ke policies ban gayi hain:
select policyname, cmd, roles from pg_policies where tablename = 'orders';
