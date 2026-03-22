-- Migration 008: Add square_subscription_id to subscriptions table
-- Stores the Square Subscriptions API subscription ID for managed recurring billing

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS square_subscription_id text DEFAULT NULL;

COMMENT ON COLUMN subscriptions.square_subscription_id IS 'Square Subscriptions API subscription ID for managed recurring billing';
