-- Migration 004: Site settings, admin notes, audit log index
-- Run this after supabase-migration-003.sql

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

-- ── Index for delivery reminder queries ──
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);

-- ── Index for catering inquiry lookups ──
CREATE INDEX IF NOT EXISTS idx_contact_submissions_subject ON contact_submissions(subject);
