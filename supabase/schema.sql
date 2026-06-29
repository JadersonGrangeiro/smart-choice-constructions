-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Choice Constructions — Complete Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";        -- fuzzy text search
create extension if not exists "unaccent";        -- normalize accents for search

-- ── Profiles (extends Supabase auth.users) ───────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null default 'customer' check (role in ('customer','contractor','admin','supplier')),
  full_name     text,
  email         text unique not null,
  phone         text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  admin_emails text := current_setting('app.admin_emails', true);
  user_role    text := 'customer';
begin
  -- Check if this email should be admin
  if admin_emails is not null and new.email = any(string_to_array(admin_emails, ',')) then
    user_role := 'admin';
  end if;

  insert into public.profiles (id, role, email, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', user_role),
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Contractors ───────────────────────────────────────────────────────────────
create table public.contractors (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references public.profiles(id) on delete set null,
  -- Business
  company_name        text not null,
  owner_first_name    text not null,
  owner_last_name     text not null,
  email               text not null,
  phone               text,
  category            text not null,
  -- Location
  state_code          text not null,
  city                text not null,
  zip_code            text,
  service_radius      text not null default '25',
  additional_states   text[] default '{}',
  additional_cities   text,
  -- Profile
  description         text,
  website             text,
  facebook_url        text,
  instagram_url       text,
  linkedin_url        text,
  -- Schedule
  working_days        text[] default '{}',
  open_time           text default '08:00',
  close_time          text default '17:00',
  has_emergency       boolean not null default false,
  -- Credentials
  license_number      text,
  insurance_number    text,
  years_experience    integer not null default 0,
  -- Verification & Status
  is_licensed         boolean not null default false,
  is_insured          boolean not null default false,
  is_background_checked boolean not null default false,
  status              text not null default 'pending_payment'
                      check (status in ('pending_payment','pending_approval','active','suspended','canceled','rejected')),
  profile_visible     boolean not null default false,
  rejection_reason    text,
  -- Stripe
  stripe_customer_id  text unique,
  -- Ranking (computed periodically)
  ranking_score       numeric(5,2) not null default 0,
  -- Metrics
  response_time_hours numeric(5,1),
  -- Media
  avatar_url          text,
  -- Timestamps
  approved_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── Contractor Photos ─────────────────────────────────────────────────────────
create table public.contractor_photos (
  id            uuid primary key default uuid_generate_v4(),
  contractor_id uuid not null references public.contractors(id) on delete cascade,
  storage_path  text not null,
  public_url    text not null,
  caption       text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ── Contractor Documents ──────────────────────────────────────────────────────
create table public.contractor_documents (
  id            uuid primary key default uuid_generate_v4(),
  contractor_id uuid not null references public.contractors(id) on delete cascade,
  doc_type      text not null check (doc_type in ('license','insurance','background_check','certification','other')),
  storage_path  text not null,
  file_name     text not null,
  verified      boolean not null default false,
  verified_at   timestamptz,
  verified_by   uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);

-- ── Subscriptions ─────────────────────────────────────────────────────────────
create table public.contractor_subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  contractor_id         uuid not null references public.contractors(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_customer_id    text not null,
  stripe_price_id       text not null,
  status                text not null
                        check (status in ('trialing','active','past_due','canceled','unpaid','paused','incomplete')),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  trial_end             timestamptz,
  failed_payment_count  integer not null default 0,
  last_failed_at        timestamptz,
  suspended_at          timestamptz,
  canceled_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── Payment Events ────────────────────────────────────────────────────────────
create table public.payment_events (
  id              uuid primary key default uuid_generate_v4(),
  contractor_id   uuid references public.contractors(id) on delete set null,
  stripe_event_id text unique not null,
  event_type      text not null,
  amount_cents    integer,
  currency        text not null default 'usd',
  status          text,
  failure_reason  text,
  invoice_id      text,
  raw_payload     jsonb,
  created_at      timestamptz not null default now()
);

-- ── Homeowners ────────────────────────────────────────────────────────────────
create table public.homeowners (
  id          uuid primary key references public.profiles(id) on delete cascade,
  zip_code    text,
  city        text,
  state_code  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Quote Requests ────────────────────────────────────────────────────────────
create table public.quote_requests (
  id              uuid primary key default uuid_generate_v4(),
  homeowner_id    uuid references public.profiles(id) on delete set null,
  contractor_id   uuid references public.contractors(id) on delete cascade,
  service_type    text not null,
  description     text,
  budget_range    text,
  city            text,
  state_code      text,
  zip_code        text,
  contact_name    text,
  contact_email   text,
  contact_phone   text,
  status          text not null default 'pending'
                  check (status in ('pending','viewed','responded','completed','declined')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Reviews ───────────────────────────────────────────────────────────────────
create table public.reviews (
  id              uuid primary key default uuid_generate_v4(),
  contractor_id   uuid not null references public.contractors(id) on delete cascade,
  homeowner_id    uuid references public.profiles(id) on delete set null,
  reviewer_name   text not null,
  rating          integer not null check (rating between 1 and 5),
  title           text,
  body            text not null,
  project_type    text,
  is_verified     boolean not null default false,
  is_flagged      boolean not null default false,
  flag_reason     text,
  is_published    boolean not null default true,
  admin_note      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Contractor Favorites ──────────────────────────────────────────────────────
create table public.favorites (
  id              uuid primary key default uuid_generate_v4(),
  homeowner_id    uuid not null references public.profiles(id) on delete cascade,
  contractor_id   uuid not null references public.contractors(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (homeowner_id, contractor_id)
);

-- ── Messages ──────────────────────────────────────────────────────────────────
create table public.message_threads (
  id              uuid primary key default uuid_generate_v4(),
  homeowner_id    uuid not null references public.profiles(id) on delete cascade,
  contractor_id   uuid not null references public.contractors(id) on delete cascade,
  quote_request_id uuid references public.quote_requests(id),
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (homeowner_id, contractor_id)
);

create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  thread_id   uuid not null references public.message_threads(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Audit Logs ────────────────────────────────────────────────────────────────
create table public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   text,
  details     jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

-- ── Suppliers ─────────────────────────────────────────────────────────────────
create table public.suppliers (
  id            uuid primary key default uuid_generate_v4(),
  company_name  text not null,
  category      text not null,
  sub_category  text,
  email         text,
  phone         text,
  website       text,
  description   text,
  state_code    text,
  city          text,
  address       text,
  logo_url      text,
  is_featured   boolean not null default false,
  status        text not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Platform Settings ─────────────────────────────────────────────────────────
create table public.platform_settings (
  key         text primary key,
  value       text not null,
  updated_by  uuid references public.profiles(id),
  updated_at  timestamptz not null default now()
);

-- Insert default settings
insert into public.platform_settings (key, value) values
  ('maintenance_mode',         'false'),
  ('signup_enabled',           'true'),
  ('contractor_signup_enabled','true'),
  ('first_month_price_cents',  '2990'),
  ('monthly_price_cents',      '4990'),
  ('grace_period_days',        '3'),
  ('deactivation_days',        '30');

-- ── INDEXES ───────────────────────────────────────────────────────────────────
create index idx_contractors_state        on public.contractors(state_code);
create index idx_contractors_city         on public.contractors(city);
create index idx_contractors_category     on public.contractors(category);
create index idx_contractors_status       on public.contractors(status);
create index idx_contractors_visible      on public.contractors(profile_visible) where profile_visible = true;
create index idx_contractors_ranking      on public.contractors(ranking_score desc);
create index idx_contractors_user         on public.contractors(user_id);
create index idx_subs_contractor          on public.contractor_subscriptions(contractor_id);
create index idx_subs_stripe_sub          on public.contractor_subscriptions(stripe_subscription_id);
create index idx_payment_events_stripe    on public.payment_events(stripe_event_id);
create index idx_reviews_contractor       on public.reviews(contractor_id);
create index idx_quote_requests_contractor on public.quote_requests(contractor_id);
create index idx_messages_thread          on public.messages(thread_id);
create index idx_audit_logs_admin         on public.audit_logs(admin_id);
create index idx_audit_logs_entity        on public.audit_logs(entity_type, entity_id);

-- Full-text search index on contractors
create index idx_contractors_fts on public.contractors
  using gin(to_tsvector('english', coalesce(company_name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(city,'')));

-- Trigram index for fuzzy search on company name
create index idx_contractors_company_trgm on public.contractors
  using gin(company_name gin_trgm_ops);

-- ── FUNCTIONS ─────────────────────────────────────────────────────────────────

-- Compute contractor ranking score (called by webhook or scheduled job)
create or replace function public.compute_ranking_score(p_contractor_id uuid)
returns numeric
language plpgsql
as $$
declare
  v_score        numeric := 0;
  v_avg_rating   numeric;
  v_review_count integer;
  v_profile_pct  integer;
  v_has_sub      boolean;
  v_is_licensed  boolean;
  v_is_insured   boolean;
  v_has_photos   integer;
  v_years_exp    integer;
begin
  select
    coalesce(avg(r.rating), 0),
    count(r.id),
    c.is_licensed,
    c.is_insured,
    c.years_experience
  into v_avg_rating, v_review_count, v_is_licensed, v_is_insured, v_years_exp
  from public.contractors c
  left join public.reviews r on r.contractor_id = c.id and r.is_published = true
  where c.id = p_contractor_id
  group by c.is_licensed, c.is_insured, c.years_experience;

  select count(*) into v_has_photos
  from public.contractor_photos where contractor_id = p_contractor_id;

  select exists(
    select 1 from public.contractor_subscriptions
    where contractor_id = p_contractor_id and status = 'active'
  ) into v_has_sub;

  -- Score components (total 100 points)
  v_score := v_score + (v_avg_rating / 5.0)       * 30;  -- 30pts: avg rating
  v_score := v_score + least(v_review_count, 50) / 50.0 * 20;  -- 20pts: review count (cap 50)
  v_score := v_score + case when v_is_licensed  then 15 else 0 end;  -- 15pts: license
  v_score := v_score + case when v_is_insured   then 10 else 0 end;  -- 10pts: insurance
  v_score := v_score + case when v_has_sub      then 15 else 0 end;  -- 15pts: active subscription
  v_score := v_score + least(v_has_photos, 10) / 10.0 * 5;          -- 5pts: photos
  v_score := v_score + least(v_years_exp, 20) / 20.0 * 5;           -- 5pts: experience

  return round(v_score, 2);
end;
$$;

-- Update ranking scores for all active contractors
create or replace function public.refresh_rankings()
returns void
language plpgsql
as $$
begin
  update public.contractors
  set ranking_score = public.compute_ranking_score(id),
      updated_at = now()
  where status = 'active' and profile_visible = true;
end;
$$;

-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────

alter table public.profiles                  enable row level security;
alter table public.contractors               enable row level security;
alter table public.contractor_photos         enable row level security;
alter table public.contractor_documents      enable row level security;
alter table public.contractor_subscriptions  enable row level security;
alter table public.payment_events            enable row level security;
alter table public.homeowners                enable row level security;
alter table public.quote_requests            enable row level security;
alter table public.reviews                   enable row level security;
alter table public.favorites                 enable row level security;
alter table public.message_threads           enable row level security;
alter table public.messages                  enable row level security;
alter table public.audit_logs                enable row level security;
alter table public.suppliers                 enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles: users can read their own, admins read all
create policy "profiles_select_own"  on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id or public.is_admin());

-- Contractors: public profiles visible to all; own data to owner; full to admin
create policy "contractors_select_public" on public.contractors for select using (
  profile_visible = true or user_id = auth.uid() or public.is_admin()
);
create policy "contractors_insert_own"  on public.contractors for insert with check (
  user_id = auth.uid() or public.is_admin()
);
create policy "contractors_update_own"  on public.contractors for update using (
  user_id = auth.uid() or public.is_admin()
);
create policy "contractors_delete_admin" on public.contractors for delete using (public.is_admin());

-- Photos: public read, owner write, admin all
create policy "photos_select_all"   on public.contractor_photos for select using (true);
create policy "photos_insert_own"   on public.contractor_photos for insert with check (
  exists (select 1 from public.contractors where id = contractor_id and user_id = auth.uid())
  or public.is_admin()
);
create policy "photos_delete_own"   on public.contractor_photos for delete using (
  exists (select 1 from public.contractors where id = contractor_id and user_id = auth.uid())
  or public.is_admin()
);

-- Documents: owner and admin only
create policy "docs_select_own"  on public.contractor_documents for select using (
  exists (select 1 from public.contractors where id = contractor_id and user_id = auth.uid())
  or public.is_admin()
);
create policy "docs_insert_own"  on public.contractor_documents for insert with check (
  exists (select 1 from public.contractors where id = contractor_id and user_id = auth.uid())
  or public.is_admin()
);

-- Subscriptions: owner and admin
create policy "subs_select_own"  on public.contractor_subscriptions for select using (
  exists (select 1 from public.contractors where id = contractor_id and user_id = auth.uid())
  or public.is_admin()
);

-- Payment events: admin only
create policy "payments_admin"   on public.payment_events for all using (public.is_admin());

-- Quote requests: homeowner or contractor involved, or admin
create policy "quotes_select"    on public.quote_requests for select using (
  homeowner_id = auth.uid()
  or exists (select 1 from public.contractors where id = contractor_id and user_id = auth.uid())
  or public.is_admin()
);
create policy "quotes_insert"    on public.quote_requests for insert with check (true);
create policy "quotes_update"    on public.quote_requests for update using (
  homeowner_id = auth.uid()
  or exists (select 1 from public.contractors where id = contractor_id and user_id = auth.uid())
  or public.is_admin()
);

-- Reviews: public read, homeowner write own, admin all
create policy "reviews_select"   on public.reviews for select using (is_published = true or public.is_admin());
create policy "reviews_insert"   on public.reviews for insert with check (
  homeowner_id = auth.uid() or public.is_admin()
);
create policy "reviews_update"   on public.reviews for update using (
  homeowner_id = auth.uid() or public.is_admin()
);
create policy "reviews_delete"   on public.reviews for delete using (public.is_admin());

-- Favorites: owner only
create policy "favorites_own"    on public.favorites for all using (homeowner_id = auth.uid());

-- Messages: participants only
create policy "threads_select"   on public.message_threads for select using (
  homeowner_id = auth.uid()
  or exists (select 1 from public.contractors where id = contractor_id and user_id = auth.uid())
  or public.is_admin()
);
create policy "messages_select"  on public.messages for select using (
  exists (
    select 1 from public.message_threads mt
    where mt.id = thread_id
    and (mt.homeowner_id = auth.uid()
      or exists (select 1 from public.contractors where id = mt.contractor_id and user_id = auth.uid()))
  )
  or public.is_admin()
);
create policy "messages_insert"  on public.messages for insert with check (sender_id = auth.uid());

-- Audit logs: admin only
create policy "audit_admin"      on public.audit_logs for all using (public.is_admin());

-- Suppliers: public read, admin write
create policy "suppliers_select" on public.suppliers for select using (status = 'active' or public.is_admin());
create policy "suppliers_write"  on public.suppliers for all using (public.is_admin());

-- Homeowners: owner and admin
create policy "homeowners_own"   on public.homeowners for all using (id = auth.uid() or public.is_admin());
