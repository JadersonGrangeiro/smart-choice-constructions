-- Migration 005: Add contractor reply to reviews
-- Run this in Supabase SQL Editor

alter table public.reviews
  add column if not exists contractor_reply      text,
  add column if not exists contractor_reply_at   timestamptz;
