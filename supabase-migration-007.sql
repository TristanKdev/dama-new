-- Migration 007: Performance indexes + webhook processed events table
-- Run this migration against your Supabase database to improve query performance

-- ============================================================
-- Performance indexes for frequently-queried columns
-- ============================================================

-- Orders: queried by user_id, customer_email, delivery_date, status, payment_reference
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items: always joined on order_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Subscriptions: queried by user_id, customer_email, status, delivery_day
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email ON subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_delivery_day ON subscriptions(delivery_day);

-- Contact submissions: filtered by read_at for unread count
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read_at ON contact_submissions(read_at);

-- Menu items: filtered by category, available, sold_out
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- Audit logs: queried by admin_id, table_name
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Promo codes: looked up by code
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);

-- ============================================================
-- Webhook processed events table (for deduplication)
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_processed_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-clean old webhook events (older than 7 days)
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_processed_events(processed_at);

-- ============================================================
-- Newsletter subscribers table (if not already exists)
-- ============================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);
