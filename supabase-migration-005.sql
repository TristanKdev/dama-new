-- Migration 005: Menu expansion — appetizer category, banchan subcategories, dosirak set fields
-- Run this after supabase-migration-004.sql
-- Safe to run multiple times (all operations are idempotent).

-- 1. Drop and re-create the category constraint to include 'appetizer'
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check
  CHECK (category IN ('banchan', 'dosirak', 'appetizer', 'seasonal'));

-- 2. Add new columns
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS subcategory text DEFAULT NULL;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS badges text[] DEFAULT NULL;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS upgrade_price numeric(10,2) DEFAULT NULL;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS set_contents text[] DEFAULT NULL;
