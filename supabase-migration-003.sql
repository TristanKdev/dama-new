-- Migration 003: Webhook dedup, promo codes, newsletter subscribers
-- Run this after supabase-migration-002.sql

-- ── Webhook processed events (for replay prevention) ──
CREATE TABLE IF NOT EXISTS webhook_processed_events (
  event_id text PRIMARY KEY,
  processed_at timestamptz DEFAULT now()
);

-- Auto-cleanup old events (older than 24 hours)
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_processed_events(processed_at);

-- RLS: no public access, only service role
ALTER TABLE webhook_processed_events ENABLE ROW LEVEL SECURITY;

-- ── Promo codes ──
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order_amount numeric DEFAULT 0,
  max_uses integer,
  current_uses integer DEFAULT 0,
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can validate a promo code (read)
DROP POLICY IF EXISTS "Anyone can read active promo codes" ON promo_codes;
CREATE POLICY "Anyone can read active promo codes"
  ON promo_codes FOR SELECT
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

-- ── Newsletter subscribers ──
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- No public read. Service role handles inserts from API.

-- ── Subscription billing tracking ──

-- Add last_charged_at to subscriptions for billing tracking
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_charged_at timestamptz;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS square_customer_id text;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS square_card_id text;

-- Add square_customer_id to profiles for repeat purchases
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS square_customer_id text;

-- ── Admin notes on customer profiles ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_notes text;

-- ── Site settings (key-value store for business config) ──
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- No public access. Service role only.
