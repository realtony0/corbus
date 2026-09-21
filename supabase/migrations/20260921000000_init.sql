-- CORBUS — Supabase schema
-- Run once in the Supabase SQL editor (Dashboard > SQL Editor > New query).
-- Safe to re-run: every statement is idempotent.

-- ── Products ────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id          text primary key,
  name        text        not null,
  description text        not null default '',
  price       integer     not null,
  currency    text        not null default 'XOF',
  images      jsonb       not null default '[]'::jsonb,
  sizes       jsonb       not null default '[]'::jsonb,
  category    text        not null default '',
  in_stock    boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at);

-- ── Site content (settings + gallery) ───────────────────────────────────────
-- Key/value store holding one row per document: 'settings' and 'gallery'.
-- This is what moves the admin panel off localStorage, so what the admin
-- saves is what every visitor sees.
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── Row level security ──────────────────────────────────────────────────────
-- The app only ever reaches Supabase from the server with the service-role
-- key, which bypasses RLS. Enabling it with no permissive policy means the
-- anon key cannot read or write these tables even if it leaks.
alter table public.products     enable row level security;
alter table public.site_content enable row level security;

-- ── Seed ────────────────────────────────────────────────────────────────────
insert into public.products (id, name, description, price, currency, images, sizes, category, in_stock)
values
  ('corbus-a-era-white',
   'CORBUS A ERA — White',
   'Catch Our Rebel Brand Unique Shit. T-shirt blanc avec le logo Corbus sur le devant et le design A ERA au dos.',
   20000, 'XOF',
   '["/images/products/a-era-white.jpg"]'::jsonb,
   '["S","M","L","XL"]'::jsonb,
   'T-shirts', false),
  ('corbus-a-era-black',
   'CORBUS A ERA — Black',
   'Catch Our Rebel Brand Unique Shit. T-shirt noir avec le logo Corbus sur le devant et le design A ERA au dos.',
   20000, 'XOF',
   '["/images/products/a-era-black.jpg"]'::jsonb,
   '["S","M","L","XL"]'::jsonb,
   'T-shirts', false),
  ('corbus-embrace-white',
   'CORBUS Embrace — White',
   '"Embrace the Corbus land, they hold the truth." T-shirt blanc avec le logo Corbus gothique et le design Embrace au dos.',
   20000, 'XOF',
   '["/images/products/embrace-white.jpg"]'::jsonb,
   '["S","M","L","XL"]'::jsonb,
   'T-shirts', false)
on conflict (id) do nothing;

insert into public.site_content (key, value)
values ('gallery', '["/images/gallery/hero.jpg","/images/gallery/photo1.jpg","/images/gallery/photo2.jpg","/images/gallery/photo3.jpg","/images/gallery/photo4.jpg"]'::jsonb)
on conflict (key) do nothing;

insert into public.site_content (key, value)
values ('settings', '{}'::jsonb)
on conflict (key) do nothing;
