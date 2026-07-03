-- =========================================================
-- HASHMI STORE — Supabase Setup Script
-- Ye poora script SQL Editor me paste karke "Run" dabao.
-- Naya Supabase project chahiye: Settings -> API se URL/anon key
-- .env.local me daalni hai (neeche instructions mein hai).
-- =========================================================

-- ---------------------------------------------------------
-- 1) PRODUCTS TABLE
-- ---------------------------------------------------------
create table if not exists public.products (
  id           bigint generated always as identity primary key,
  name         text not null,
  price        numeric not null,
  original_price numeric,               -- sirf tab hoti hai jab is_offer = true
  category     text not null default 'Grocery',
  image        text,                    -- public image URL (storage se ya placeholder)
  is_offer     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.products enable row level security;

-- Har koi (bina login) products dekh sake — store public hai
create policy "Products: public read"
  on public.products for select
  to anon, authenticated
  using (true);

-- Sirf logged-in (admin) user add/edit/delete kar sake
create policy "Products: authenticated insert"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Products: authenticated update"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

create policy "Products: authenticated delete"
  on public.products for delete
  to authenticated
  using (true);


-- ---------------------------------------------------------
-- 2) ORDERS TABLE
-- ---------------------------------------------------------
create table if not exists public.orders (
  id               bigint generated always as identity primary key,
  customer_name    text not null,
  customer_phone   text not null,
  customer_address text not null,
  total_amount     numeric not null,
  items            jsonb not null,       -- cart snapshot: [{id, name, price, quantity, image}]
  status           text not null default 'Pending', -- Pending / Dispatched / Delivered
  user_email       text not null,        -- logged-in customer ka email, ya "Guest Order"
  created_at       timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Guest ya logged-in, dono checkout kar sakein (order place = insert)
create policy "Orders: anyone can place an order"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- Sirf logged-in users apne/store ke orders dekh sakein
-- (Profile page apne email se filter karta hai, Admin sab dekhta hai)
create policy "Orders: authenticated read"
  on public.orders for select
  to authenticated
  using (true);

-- Sirf logged-in (admin) status update kar sake
create policy "Orders: authenticated update"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);


-- ---------------------------------------------------------
-- 3) STORAGE BUCKET — product images
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Har koi image dekh sake (public store hai)
create policy "Product images: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'products');

-- Sirf logged-in (admin) upload kar sake
create policy "Product images: authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

create policy "Product images: authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products');

create policy "Product images: authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products');


-- ---------------------------------------------------------
-- 4) OPTIONAL: shuru ke liye kuch sample products
--    (chaho to ye 4 lines skip/delete kar sakte ho)
-- ---------------------------------------------------------
insert into public.products (name, price, original_price, category, image, is_offer) values
  ('Dalda Cooking Oil 5 Litre', 2850, null, 'Grocery', 'https://placehold.co/400x300/e2e8f0/1e293b?text=Cooking+Oil', false),
  ('Mughal Premium Basmati Rice 5kg', 1800, null, 'Grocery', 'https://placehold.co/400x300/e2e8f0/1e293b?text=Basmati+Rice', false),
  ('Surf Excel Washing Powder 1kg', 650, 750, 'Household', 'https://placehold.co/400x300/e2e8f0/1e293b?text=Surf+Excel', true),
  ('Lipton Yellow Label Tea 950g', 1650, null, 'Grocery', 'https://placehold.co/400x300/e2e8f0/1e293b?text=Lipton+Tea', false);
