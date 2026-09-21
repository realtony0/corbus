-- Orders, and the extra product columns the admin panel needs.
-- Idempotent: safe to re-run.

-- ── Orders ──────────────────────────────────────────────────────────────────
-- Orders used to exist only as a WhatsApp message, so nothing was recorded.
-- A row is written at checkout, before the customer is handed to WhatsApp.
create table if not exists public.orders (
  id             uuid        primary key default gen_random_uuid(),
  reference      text        not null unique,
  customer_name  text        not null,
  customer_phone text        not null,
  address        text        not null default '',
  city           text        not null default '',
  country        text        not null default '',
  items          jsonb       not null default '[]'::jsonb,
  total          integer     not null default 0,
  currency       text        not null default 'XOF',
  -- received | paid | shipped | delivered | cancelled
  status         text        not null default 'received',
  note           text        not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx     on public.orders (status);

alter table public.orders enable row level security;

-- ── Product columns ─────────────────────────────────────────────────────────
-- stock: per-size quantities, e.g. {"M": 4, "L": 0}. Absent size = untracked.
alter table public.products add column if not exists stock      jsonb   not null default '{}'::jsonb;
-- sort_order: manual catalog ordering, lowest first, ties broken by created_at.
alter table public.products add column if not exists sort_order integer not null default 0;

create index if not exists products_sort_order_idx on public.products (sort_order, created_at);
