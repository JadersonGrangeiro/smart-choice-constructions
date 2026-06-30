-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: Availability status for contractors and suppliers
-- Run in Supabase SQL Editor: https://app.supabase.com → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Add availability_status to contractors
alter table public.contractors
  add column if not exists availability_status text not null default 'available'
    check (availability_status in ('available','busy','on_vacation','not_accepting'));

-- Add availability_status to suppliers
alter table public.suppliers
  add column if not exists availability_status text not null default 'available'
    check (availability_status in ('available','busy','on_vacation','not_accepting'));

-- Index for filtering available providers in search
create index if not exists idx_contractors_availability
  on public.contractors (availability_status)
  where profile_visible = true and status = 'active';

create index if not exists idx_suppliers_availability
  on public.suppliers (availability_status)
  where is_active = true;
