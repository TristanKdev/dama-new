-- ============================================================
-- DAM:A MIGRATION 001 — Security & Schema Improvements
-- Run this in the Supabase SQL Editor AFTER the initial schema.
-- Safe to run multiple times (all operations are idempotent).
-- ============================================================


-- ========================
-- 1. NEW COLUMNS ON ORDERS
-- ========================

-- Payment status tracking (independent from order status)
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Track when orders are updated
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN updated_at timestamptz DEFAULT now();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Ensure user_id column exists (should already from full-init)
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Unique constraint on payment_reference for idempotent order creation
-- (allows NULL — only enforced when a reference exists)
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_payment_reference_unique UNIQUE (payment_reference);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enforce delivery_address for building deliveries at DB level
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_delivery_address_required
    CHECK (delivery_method != 'building-delivery' OR delivery_address IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ========================
-- 2. FAQS TABLE
-- ========================

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "FAQs are publicly readable" ON faqs;
CREATE POLICY "FAQs are publicly readable" ON faqs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage FAQs" ON faqs;
CREATE POLICY "Admins can manage FAQs" ON faqs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ========================
-- 3. ELIGIBLE BUILDINGS TABLE
-- ========================

CREATE TABLE IF NOT EXISTS eligible_buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  zip_code text NOT NULL,
  neighborhood text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE eligible_buildings ENABLE ROW LEVEL SECURITY;

-- Publicly readable (used by address checker)
DROP POLICY IF EXISTS "Buildings are publicly readable" ON eligible_buildings;
CREATE POLICY "Buildings are publicly readable" ON eligible_buildings
  FOR SELECT USING (true);

-- Admins can manage
DROP POLICY IF EXISTS "Admins can manage buildings" ON eligible_buildings;
CREATE POLICY "Admins can manage buildings" ON eligible_buildings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed building data
INSERT INTO eligible_buildings (name, address, zip_code, neighborhood) VALUES
  ('The Beacon', '85 River Drive South', '07310', 'Waterfront'),
  ('Ellipse', '30 Hudson Street', '07302', 'Exchange Place'),
  ('Urby', '200 Greene Street', '07311', 'Downtown'),
  ('Crystal Point', '2 2nd Street', '07302', 'Exchange Place'),
  ('Silverman', '100 Christopher Columbus Drive', '07302', 'Exchange Place'),
  ('Trump Bay', '475 Washington Boulevard', '07310', 'Waterfront'),
  ('The Morgan', '100 Morgan Street', '07302', 'Downtown'),
  ('One Ten', '110 1st Street', '07302', 'Downtown'),
  ('Portside', '155 Washington Street', '07302', 'Exchange Place'),
  ('225 Grand', '225 Grand Street', '07302', 'Downtown'),
  ('18 Park', '18 Park Street', '07304', 'Journal Square'),
  ('Journal Squared', '615 Pavonia Avenue', '07306', 'Journal Square'),
  ('The Art House', '321 Newark Avenue', '07302', 'Downtown'),
  ('Cast Iron Lofts', '365 Grove Street', '07302', 'Downtown'),
  ('50 Columbus', '50 Columbus Drive', '07302', 'Exchange Place'),
  ('Liberty Towers', '33 Hudson Street', '07302', 'Exchange Place'),
  ('Marbella', '1 2nd Street', '07302', 'Exchange Place'),
  ('Porto', '225 Pavonia Avenue', '07310', 'Waterfront')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_buildings_zip ON eligible_buildings(zip_code);
CREATE INDEX IF NOT EXISTS idx_buildings_active ON eligible_buildings(active);


-- ========================
-- 4. DELIVERY SCHEDULE TABLE
-- ========================

CREATE TABLE IF NOT EXISTS delivery_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  active boolean NOT NULL DEFAULT true,
  cutoff_hours_before integer NOT NULL DEFAULT 24,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Blackout dates (holidays, closures)
CREATE TABLE IF NOT EXISTS delivery_blackout_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blackout_date date NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE delivery_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_blackout_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Delivery schedule is publicly readable" ON delivery_schedule;
CREATE POLICY "Delivery schedule is publicly readable" ON delivery_schedule
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage delivery schedule" ON delivery_schedule;
CREATE POLICY "Admins can manage delivery schedule" ON delivery_schedule FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Blackout dates are publicly readable" ON delivery_blackout_dates;
CREATE POLICY "Blackout dates are publicly readable" ON delivery_blackout_dates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage blackout dates" ON delivery_blackout_dates;
CREATE POLICY "Admins can manage blackout dates" ON delivery_blackout_dates FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed default delivery days: Tuesday (2), Thursday (4), Saturday (6)
INSERT INTO delivery_schedule (day_of_week, active, cutoff_hours_before) VALUES
  (2, true, 24),  -- Tuesday
  (4, true, 24),  -- Thursday
  (6, true, 24)   -- Saturday
ON CONFLICT DO NOTHING;


-- ========================
-- 5. FIX RLS POLICIES
-- ========================

-- Remove overly permissive anonymous read policies
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;

-- Ensure users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view items for their own orders
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Ensure admin policies exist for all tables
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON subscriptions;
CREATE POLICY "Admins can update all subscriptions" ON subscriptions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ========================
-- 6. NEW INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_ref ON orders(payment_reference) WHERE payment_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read_at ON contact_submissions(read_at);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_buildings_zip ON eligible_buildings(zip_code);
