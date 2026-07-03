-- =========================================================
-- FIX v2: Grants + RLS policies (safe to re-run anytime)
-- Naye Supabase projects me table create hote hi anon/authenticated
-- roles ko automatic GRANT nahi milta — RLS policy hone ke bawajood
-- bhi "permission denied" jaisa "RLS violation" error aa sakta hai.
-- =========================================================

-- ---------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------
grant select, insert on public.orders to anon, authenticated;
grant update on public.orders to authenticated;
grant usage on sequence orders_id_seq to anon, authenticated;

alter table public.orders enable row level security;

drop policy if exists "Orders: anyone can place an order" on public.orders;
drop policy if exists "Orders: authenticated read" on public.orders;
drop policy if exists "Orders: authenticated update" on public.orders;

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

-- ---------------------------------------------------------
-- PRODUCTS (same fix, taake future issues na aayein)
-- ---------------------------------------------------------
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant usage on sequence products_id_seq to authenticated;

-- ---------------------------------------------------------
-- PROFILES (same fix)
-- ---------------------------------------------------------
grant select, insert, update on public.profiles to authenticated;

-- ---------------------------------------------------------
-- Verify — dono queries chala kar dekho ke rows aa rahi hain
-- ---------------------------------------------------------
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('orders', 'products', 'profiles')
order by table_name, grantee;

select policyname, cmd, roles from pg_policies where tablename = 'orders';
