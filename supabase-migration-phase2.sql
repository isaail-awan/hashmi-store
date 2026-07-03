-- =========================================================
-- HASHMI STORE — Phase 2 Migration
-- Delivery time slots ke liye orders table me column add karo
-- =========================================================

alter table public.orders
  add column if not exists delivery_slot text not null default 'Jaldi se jaldi';
