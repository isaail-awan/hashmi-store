-- =========================================================
-- HASHMI STORE — Phase 3 Migration
-- Reviews/Ratings + Wishlist + Order Tracking Timeline
-- Ye SQL Editor me paste karke Run karo (existing project pe,
-- purani tables ke saath add hota hai — kuch delete nahi hota)
-- =========================================================

-- ---------------------------------------------------------
-- 1) REVIEWS TABLE — product ratings & comments
-- ---------------------------------------------------------
create table if not exists public.reviews (
  id           bigint generated always as identity primary key,
  product_id   bigint not null references public.products(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  user_name    text not null default 'Customer',
  rating       integer not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (product_id, user_id)  -- ek user, ek product pe sirf 1 review (edit ho sakta hai)
);

alter table public.reviews enable row level security;

-- Har koi reviews dekh sake — store public hai
create policy "Reviews: public read"
  on public.reviews for select
  to anon, authenticated
  using (true);

-- Sirf logged-in user apna review daal sake
create policy "Reviews: user inserts own"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Sirf apna review edit kar sake
create policy "Reviews: user updates own"
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Sirf apna review delete kar sake
create policy "Reviews: user deletes own"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);


-- ---------------------------------------------------------
-- 2) WISHLIST TABLE — saved products per user
-- ---------------------------------------------------------
create table if not exists public.wishlist_items (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  product_id   bigint not null references public.products(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlist_items enable row level security;

-- Sirf apni wishlist dekh sake
create policy "Wishlist: user reads own"
  on public.wishlist_items for select
  to authenticated
  using (auth.uid() = user_id);

-- Sirf apni wishlist mein add kar sake
create policy "Wishlist: user inserts own"
  on public.wishlist_items for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Sirf apni wishlist se remove kar sake
create policy "Wishlist: user deletes own"
  on public.wishlist_items for delete
  to authenticated
  using (auth.uid() = user_id);


-- ---------------------------------------------------------
-- 3) ORDERS: tracking timeline timestamps
--    (Order Placed -> Dispatched -> Delivered timeline ke liye)
-- ---------------------------------------------------------
alter table public.orders
  add column if not exists dispatched_at timestamptz;
alter table public.orders
  add column if not exists delivered_at timestamptz;
