-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Expand suppliers table + seed platform content settings
-- Run in Supabase SQL Editor: https://app.supabase.com → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Add missing columns to suppliers ─────────────────────────────────────────
alter table public.suppliers
  add column if not exists products          text[]       default '{}',
  add column if not exists brands            text[]       default '{}',
  add column if not exists rating            numeric(3,2) default 0,
  add column if not exists review_count      integer      default 0,
  add column if not exists years_in_business integer      default 0,
  add column if not exists hours             text,
  add column if not exists instagram_url     text,
  add column if not exists facebook_url      text,
  add column if not exists linkedin_url      text,
  add column if not exists verified          boolean      not null default false;

-- ── Seed banners in platform_settings (stored as JSON array) ─────────────────
insert into public.platform_settings (key, value)
values (
  'banners',
  $$[
    {
      "id": "b1",
      "title": "First Month Only $29.90",
      "subtitle": "Join Smart Choice today and get your first month at 40% off.",
      "ctaLabel": "Join Now",
      "ctaHref": "/join",
      "placement": "homepage_hero",
      "bgColor": "#162E5E",
      "active": true,
      "startDate": "2025-06-01",
      "endDate": null,
      "priority": 1
    },
    {
      "id": "b2",
      "title": "New: Local Suppliers Now Live",
      "subtitle": "Find building materials, equipment rental, and design pros near you.",
      "ctaLabel": "Browse Suppliers",
      "ctaHref": "/suppliers",
      "placement": "global_bar",
      "bgColor": "#C7191A",
      "active": true,
      "startDate": "2025-06-28",
      "endDate": "2025-07-31",
      "priority": 1
    }
  ]$$
)
on conflict (key) do nothing;

-- ── Seed testimonials in platform_settings ────────────────────────────────────
insert into public.platform_settings (key, value)
values (
  'testimonials',
  $$[
    {
      "id": "t1",
      "name": "Jennifer M.",
      "city": "Austin, TX",
      "role": "Homeowner",
      "rating": 5,
      "text": "Found an amazing contractor for our kitchen remodel in less than 24 hours. The platform made it so easy to compare reviews and get quotes.",
      "project": "Kitchen Remodel",
      "active": true,
      "featured": true,
      "date": "2025-06-20"
    },
    {
      "id": "t2",
      "name": "Carlos R.",
      "city": "Dallas, TX",
      "role": "Homeowner",
      "rating": 5,
      "text": "Three quotes from licensed contractors within a day. Ended up saving over $4,000 compared to the first company I called on my own.",
      "project": "Bathroom Renovation",
      "active": true,
      "featured": true,
      "date": "2025-06-15"
    },
    {
      "id": "t3",
      "name": "Thomas R.",
      "city": "Austin, TX",
      "role": "Contractor",
      "rating": 5,
      "text": "I've been on the platform for 6 months and my pipeline has never been this full. The quality of homeowner leads is exactly what my business needed.",
      "project": null,
      "active": true,
      "featured": false,
      "date": "2025-06-10"
    }
  ]$$
)
on conflict (key) do nothing;
