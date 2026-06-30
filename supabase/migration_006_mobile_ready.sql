-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 006 — Mobile Readiness Preparation
-- Adds: editor/support roles, geolocation columns, device_tokens,
--       notification_logs, ai_requests.
-- Safe: only ADDs columns / tables / constraints. No DROP of existing data.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Expand profiles.role to include editor and support ─────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'contractor', 'admin', 'supplier', 'editor', 'support'));

-- ── 2. Geolocation on contractors ────────────────────────────────────────────
ALTER TABLE public.contractors
  ADD COLUMN IF NOT EXISTS latitude  NUMERIC(10,6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,6);

CREATE INDEX IF NOT EXISTS idx_contractors_geo
  ON public.contractors (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ── 3. Geolocation on suppliers ──────────────────────────────────────────────
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS latitude  NUMERIC(10,6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,6);

CREATE INDEX IF NOT EXISTS idx_suppliers_geo
  ON public.suppliers (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ── 4. Device tokens (push notifications — iOS APNs / Android FCM) ───────────
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token         TEXT        NOT NULL,
  platform      TEXT        NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id     TEXT,
  app_version   TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user
  ON public.device_tokens (user_id)
  WHERE is_active = TRUE;

-- ── 5. Notification logs (in-app + push audit trail) ────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  type       TEXT        NOT NULL,   -- 'new_lead' | 'new_message' | 'payment' | ...
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  data       JSONB,                  -- arbitrary extra payload for deep linking
  channel    TEXT        NOT NULL CHECK (channel IN ('push', 'email', 'sms', 'in_app')),
  status     TEXT        NOT NULL DEFAULT 'sent'
                         CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_user
  ON public.notification_logs (user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_unread
  ON public.notification_logs (user_id)
  WHERE status != 'read';

-- ── 6. AI request logs (cost tracking / audit) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_requests (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  feature        TEXT        NOT NULL,  -- 'category_suggestion' | 'description_gen' | ...
  provider       TEXT        NOT NULL DEFAULT 'anthropic',
  model          TEXT,
  input_tokens   INTEGER,
  output_tokens  INTEGER,
  latency_ms     INTEGER,
  success        BOOLEAN     NOT NULL DEFAULT TRUE,
  error          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_requests_feature
  ON public.ai_requests (feature, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_requests_user
  ON public.ai_requests (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- ── 7. Enable RLS on new tables ──────────────────────────────────────────────
ALTER TABLE public.device_tokens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_requests        ENABLE ROW LEVEL SECURITY;

-- device_tokens: user manages own tokens; admin sees all
CREATE POLICY "device_tokens_own"
  ON public.device_tokens FOR ALL
  USING (user_id = auth.uid() OR public.is_admin());

-- notification_logs: user reads/updates own; admin full access
CREATE POLICY "notif_logs_select"
  ON public.notification_logs FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notif_logs_insert"
  ON public.notification_logs FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notif_logs_update"
  ON public.notification_logs FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin());

-- ai_requests: admin only
CREATE POLICY "ai_requests_admin"
  ON public.ai_requests FOR ALL
  USING (public.is_admin());
