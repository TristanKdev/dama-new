-- ============================================================
-- DAM:A COMPLETE DATABASE INITIALIZATION
-- Paste this entire file into the Supabase SQL Editor and run it.
-- Safe to run multiple times (all operations are idempotent).
-- ============================================================


-- ========================
-- 1. CORE TABLES
-- ========================

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id text PRIMARY KEY,
  name_ko text NOT NULL,
  name_en text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL CHECK (category IN ('banchan', 'dosirak', 'appetizer', 'seasonal')),
  dietary_tags text[] NOT NULL DEFAULT '{}',
  image_url text NOT NULL DEFAULT '',
  available boolean NOT NULL DEFAULT true,
  sold_out boolean NOT NULL DEFAULT false,
  serving_size text NOT NULL DEFAULT '',
  ingredients text[] DEFAULT NULL,
  spice_level integer DEFAULT NULL CHECK (spice_level IS NULL OR (spice_level >= 0 AND spice_level <= 3)),
  subcategory text DEFAULT NULL,
  badges text[] DEFAULT NULL,
  upgrade_price numeric(10,2) DEFAULT NULL,
  set_contents text[] DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_date text NOT NULL,
  delivery_method text NOT NULL CHECK (delivery_method IN ('building-delivery', 'pickup')),
  delivery_address text,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  subtotal numeric(10,2) NOT NULL,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  notes text,
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id text NOT NULL,
  menu_item_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL
);

-- Contact Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ========================
-- 2. AUTH (Profiles)
-- ========================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  delivery_address TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  square_customer_id TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add user_id to orders
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;


-- ========================
-- 3. ADMIN COLUMNS
-- ========================

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'customer';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE contact_submissions ADD COLUMN read_at TIMESTAMPTZ DEFAULT NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Idempotent order creation via unique payment_reference
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_payment_reference_unique UNIQUE (payment_reference);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enforce delivery_address for building deliveries
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_delivery_address_required
    CHECK (delivery_method != 'building-delivery' OR delivery_address IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ========================
-- 4. SUBSCRIPTIONS
-- ========================

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL DEFAULT '',
  plan_name text NOT NULL DEFAULT 'Weekly Banchan Box',
  price_per_delivery numeric(10,2) NOT NULL DEFAULT 35.00,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'biweekly')),
  delivery_day text NOT NULL CHECK (delivery_day IN ('Tuesday', 'Thursday', 'Saturday')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  delivery_address text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  next_delivery_date date,
  paused_at timestamptz,
  cancelled_at timestamptz,
  last_charged_at timestamptz,
  square_customer_id text,
  square_card_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- ========================
-- 5. FAQS
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


-- ========================
-- 6. ELIGIBLE BUILDINGS
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


-- ========================
-- 7. DELIVERY SCHEDULE
-- ========================

CREATE TABLE IF NOT EXISTS delivery_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  active boolean NOT NULL DEFAULT true,
  cutoff_hours_before integer NOT NULL DEFAULT 24,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_blackout_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blackout_date date NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ========================
-- 8. ROW LEVEL SECURITY
-- ========================
-- NOTE: Server-side API routes use the service_role key to bypass RLS.
-- These policies restrict direct client-side (anon key) access only.

-- Helper function to check admin role without triggering RLS recursion.
-- SECURITY DEFINER runs with the function owner's permissions, bypassing RLS on profiles.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligible_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_blackout_dates ENABLE ROW LEVEL SECURITY;

-- Menu items: publicly readable
DROP POLICY IF EXISTS "Menu items are publicly readable" ON menu_items;
CREATE POLICY "Menu items are publicly readable" ON menu_items FOR SELECT USING (true);

-- Orders: anonymous can CREATE (guest checkout) but CANNOT read.
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;

-- Order items: anonymous can CREATE but CANNOT read.
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;

-- Contact: anyone can submit
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON contact_submissions;
CREATE POLICY "Anyone can submit contact forms" ON contact_submissions FOR INSERT WITH CHECK (true);

-- Profiles: users manage their own only
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Orders: authenticated users read their own only
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

-- Order items: authenticated users read items for their own orders
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Subscriptions: anonymous can create, authenticated manage own
DROP POLICY IF EXISTS "Anyone can create subscriptions" ON subscriptions;
CREATE POLICY "Anyone can create subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- FAQs: publicly readable, admin-only write
DROP POLICY IF EXISTS "FAQs are publicly readable" ON faqs;
CREATE POLICY "FAQs are publicly readable" ON faqs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage FAQs" ON faqs;
CREATE POLICY "Admins can manage FAQs" ON faqs FOR ALL
  USING (is_admin());

-- Buildings: publicly readable, admin-only write
DROP POLICY IF EXISTS "Buildings are publicly readable" ON eligible_buildings;
CREATE POLICY "Buildings are publicly readable" ON eligible_buildings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage buildings" ON eligible_buildings;
CREATE POLICY "Admins can manage buildings" ON eligible_buildings FOR ALL
  USING (is_admin());

-- Delivery schedule: publicly readable, admin-only write
DROP POLICY IF EXISTS "Delivery schedule is publicly readable" ON delivery_schedule;
CREATE POLICY "Delivery schedule is publicly readable" ON delivery_schedule FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage delivery schedule" ON delivery_schedule;
CREATE POLICY "Admins can manage delivery schedule" ON delivery_schedule FOR ALL
  USING (is_admin());

DROP POLICY IF EXISTS "Blackout dates are publicly readable" ON delivery_blackout_dates;
CREATE POLICY "Blackout dates are publicly readable" ON delivery_blackout_dates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage blackout dates" ON delivery_blackout_dates;
CREATE POLICY "Admins can manage blackout dates" ON delivery_blackout_dates FOR ALL
  USING (is_admin());


-- ========================
-- 9. ADMIN POLICIES
-- ========================

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders" ON orders FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can view all menu items" ON menu_items;
CREATE POLICY "Admins can view all menu items" ON menu_items FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update menu items" ON menu_items;
CREATE POLICY "Admins can update menu items" ON menu_items FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert menu items" ON menu_items;
CREATE POLICY "Admins can insert menu items" ON menu_items FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can view all contact submissions" ON contact_submissions;
CREATE POLICY "Admins can view all contact submissions" ON contact_submissions FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
CREATE POLICY "Admins can update contact submissions" ON contact_submissions FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update all subscriptions" ON subscriptions;
CREATE POLICY "Admins can update all subscriptions" ON subscriptions FOR UPDATE
  USING (is_admin());


-- ========================
-- 10. INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_ref ON orders(payment_reference) WHERE payment_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read_at ON contact_submissions(read_at);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_buildings_zip ON eligible_buildings(zip_code);
CREATE INDEX IF NOT EXISTS idx_buildings_active ON eligible_buildings(active);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);


-- ========================
-- 11. SEED DATA
-- ========================

-- Menu items — Dosirak Sets
INSERT INTO menu_items (id, name_ko, name_en, description, price, category, dietary_tags, image_url, available, sold_out, serving_size, spice_level, badges, upgrade_price, set_contents) VALUES
  ('dosirak-premium-dinner', '프리미엄 디너 세트', 'DAMA Premium Dinner Set', 'A full Korean dinner set featuring 2 proteins, 2 appetizers, 4 banchan, Caesar salad, and rice.', 24.00, 'dosirak', ARRAY[]::text[], '/images/food/dosirak-dinner-1.jpg', true, false, '1 box (serves 1)', 1, ARRAY['Premium','High Protein','Full Dinner Set'], 2.00, ARRAY['Protein: Bulgogi (Galbi upgrade +$2)','Protein: Dak-galbi','Appetizer: Crispy Tofu Tangsuyuk','Appetizer: Japchae','Banchan: Gyeran Mari','Banchan: Seasoned Radish','Banchan: Hobak Jeon','Banchan: Mu Saengchae','Caesar Salad','Steamed Rice']),
  ('dosirak-signature-lunch', '시그니처 런치 세트', 'DAMA Signature Lunch Set', 'A signature Korean lunch set featuring Bulgogi, rolled omelet, 4 banchan, Asian salad, and rice.', 16.00, 'dosirak', ARRAY[]::text[], '/images/food/dosirak-lunch.jpg', true, false, '1 box (serves 1)', 0, ARRAY['Best Seller','Lunch Favorite'], 2.00, ARRAY['Protein: Bulgogi (Galbi upgrade +$2)','Appetizer: Gyeran Mari','Banchan: Gamja Jorim','Banchan: Kongnamul','Banchan: Eomuk Bokkeum','Banchan: Baek Kimchi','Asian Salad','Steamed Rice']),
  ('dosirak-temple-vegan', '템플 시그니처 세트 (비건)', 'DAMA Temple Signature Set', 'A vegan Korean lunch set with Tofu Steak, Vegetable Japchae, 4 banchan, Tomato salad, and Quinoa rice.', 16.00, 'dosirak', ARRAY['Vegan','Dairy-Free'], '/images/food/dosirak-vegan-lunch.jpg', true, false, '1 box (serves 1)', 0, ARRAY['Vegan','Plant Protein','Quinoa Grain'], NULL, ARRAY['Protein: Tofu Steak','Appetizer: Vegetable Japchae','Banchan: Sigeumchi Muchim','Banchan: Kongnamul','Banchan: Carrot & Zucchini','Banchan: Baek Kimchi','Tomato Salad','Quinoa Rice']),
  ('dosirak-mini-kimbap', '미니 김밥 박스', 'DAMA Mini Kimbap Box', 'A grab-and-go mini box with Kimbap, Rolled Omelet, Fresh Spring Roll, and Inari Sushi.', 9.00, 'dosirak', ARRAY[]::text[], '/images/food/dosirak-mini.jpg', true, false, '1 box (serves 1)', 0, ARRAY['Mini Box','Grab & Go','Add-On Favorite'], NULL, ARRAY['Kimbap (Half Roll)','Gyeran Mari','Fresh Spring Roll','Inari Sushi'])
ON CONFLICT (id) DO NOTHING;

-- Menu items — Banchan (24 items: 6 muchim + 6 bokkeum + 6 jorim + 6 kimchi)
INSERT INTO menu_items (id, name_ko, name_en, description, price, category, dietary_tags, image_url, available, sold_out, serving_size, spice_level, subcategory) VALUES
  ('oi-muchim', '오이무침', 'Oi Muchim', 'Crunchy cucumber tossed in mild gochujang with vinegar, garlic, and sesame.', 5.00, 'banchan', ARRAY['Vegan','Gluten-Friendly','Dairy-Free'], '/images/food/banchan/oi-muchim.jpg', true, false, '6 oz', 1, 'muchim'),
  ('sigeumchi-namul', '시금치나물', 'Sigeumchi Namul', 'Blanched spinach seasoned with sesame oil, garlic, and soy.', 5.00, 'banchan', ARRAY['Vegan','Gluten-Friendly','Dairy-Free'], '/images/food/banchan/sigeumchi-namul.jpg', true, false, '6 oz', 0, 'muchim'),
  ('kongnamul-muchim', '콩나물무침', 'Kongnamul Muchim', 'Seasoned soybean sprouts with sesame and scallion.', 5.00, 'banchan', ARRAY['Vegan','Gluten-Friendly','Dairy-Free'], '/images/food/banchan/kongnamul-muchim.jpg', true, false, '6 oz', 0, 'muchim'),
  ('broccoli-doenjang', '브로콜리 된장무침', 'Broccoli Doenjang Muchim', 'Blanched broccoli dressed in fermented soybean paste with sesame and garlic.', 5.00, 'banchan', ARRAY['Vegan','Dairy-Free'], '/images/food/banchan/broccoli-doenjang.jpg', true, false, '6 oz', 0, 'muchim'),
  ('gaji-namul', '가지나물', 'Gaji Namul', 'Soft steamed eggplant seasoned with soy sauce, sesame, and scallion.', 5.00, 'banchan', ARRAY['Vegan','Dairy-Free'], '/images/food/banchan/gaji-namul.jpg', true, false, '6 oz', 0, 'muchim'),
  ('miyeok-cho-muchim', '미역초무침', 'Miyeok Cho Muchim', 'Seaweed salad with bright vinegar-soy dressing.', 5.00, 'banchan', ARRAY['Vegan','Dairy-Free'], '/images/food/banchan/miyeok-cho-muchim.jpg', true, false, '6 oz', 0, 'muchim'),
  ('myeolchi-bokkeum', '멸치볶음', 'Myeolchi Bokkeum', 'Stir-fried anchovies glazed in sweet soy with nuts and sesame.', 5.00, 'banchan', ARRAY['Dairy-Free','Contains Nuts'], '/images/food/banchan/myeolchi-bokkeum.jpg', true, false, '4 oz', 0, 'bokkeum'),
  ('eomuk-bokkeum', '어묵볶음', 'Eomuk Bokkeum', 'Stir-fried Korean fish cake with soy sauce, garlic, and onion.', 5.00, 'banchan', ARRAY['Dairy-Free'], '/images/food/banchan/eomuk-bokkeum.jpg', true, false, '6 oz', 0, 'bokkeum'),
  ('mushroom-bokkeum', '버섯볶음', 'Mushroom Bokkeum', 'Mixed mushrooms stir-fried with soy, garlic, and black pepper.', 5.00, 'banchan', ARRAY['Vegan','Dairy-Free'], '/images/food/banchan/mushroom-bokkeum.jpg', true, false, '6 oz', 0, 'bokkeum'),
  ('aehobak-bokkeum', '애호박볶음', 'Aehobak Bokkeum', 'Delicate Korean zucchini stir-fried with garlic and sesame.', 5.00, 'banchan', ARRAY['Vegan','Dairy-Free'], '/images/food/banchan/aehobak-bokkeum.jpg', true, false, '6 oz', 0, 'bokkeum'),
  ('beef-gochujang-bokkeum', '소고기 고추장볶음', 'Mild Gochujang Beef Bokkeum', 'Savory-sweet beef crumbles in mild gochujang sauce.', 5.50, 'banchan', ARRAY['Dairy-Free'], '/images/food/banchan/beef-gochujang-bokkeum.jpg', true, false, '5 oz', 1, 'bokkeum'),
  ('chicken-soy-garlic-bokkeum', '닭고기 간장볶음', 'Soy-Garlic Chicken Bokkeum', 'Tender chicken stir-fried in soy, garlic, and ginger.', 5.50, 'banchan', ARRAY['Dairy-Free'], '/images/food/banchan/chicken-soy-garlic-bokkeum.jpg', true, false, '5 oz', 0, 'bokkeum'),
  ('gamja-jorim', '감자조림', 'Gamja Jorim', 'Braised potatoes in a sweet soy glaze, tender and glossy.', 5.00, 'banchan', ARRAY['Vegan','Dairy-Free'], '/images/food/banchan/gamja-jorim.jpg', true, false, '6 oz', 0, 'jorim'),
  ('dubu-jorim', '두부조림', 'Dubu Jorim', 'Braised tofu in a savory soy glaze with garlic and scallion.', 5.00, 'banchan', ARRAY['Vegan','Dairy-Free'], '/images/food/banchan/dubu-jorim.jpg', true, false, '6 oz', 1, 'jorim'),
  ('ueong-jorim', '우엉조림', 'Burdock Root Stir-Fry', 'Burdock root in glossy soy glaze. Crisp-chewy, earthy, uniquely Korean.', 5.00, 'banchan', ARRAY['Vegan','Dairy-Free'], '/images/food/banchan/yeongeun-jorim.jpg', true, false, '5 oz', 0, 'jorim'),
  ('beoseot-jangjorim', '버섯장조림', 'Beoseot Jangjorim', 'Soy-braised mushrooms in savory Korean stock.', 5.00, 'banchan', ARRAY['Vegan','Dairy-Free'], '/images/food/banchan/beoseot-jangjorim.jpg', true, false, '5 oz', 0, 'jorim'),
  ('quail-egg-jangjorim', '메추리알 장조림', 'Quail Egg Jangjorim', 'Soy-braised quail eggs in savory stock.', 5.50, 'banchan', ARRAY['Dairy-Free'], '/images/food/banchan/quail-egg-jangjorim.jpg', true, false, '5 oz', 0, 'jorim'),
  ('beef-jangjorim', '소고기 장조림', 'Beef Jangjorim', 'Korean soy-braised shredded beef.', 5.50, 'banchan', ARRAY['Dairy-Free'], '/images/food/banchan/beef-jangjorim.jpg', true, false, '5 oz', 0, 'jorim'),
  ('baechu-kimchi', '배추김치', 'Baechu Kimchi', 'Classic mild napa cabbage kimchi with chili flakes, garlic, and ginger.', 5.00, 'banchan', ARRAY['Gluten-Friendly','Dairy-Free'], '/images/food/banchan/baechu-kimchi.jpg', true, false, '6 oz', 2, 'kimchi'),
  ('kkakdugi', '깍두기', 'Kkakdugi', 'Cubed radish kimchi with a satisfying crunch.', 5.00, 'banchan', ARRAY['Gluten-Friendly','Dairy-Free'], '/images/food/banchan/kkakdugi.jpg', true, false, '6 oz', 2, 'kimchi'),
  ('baek-kimchi', '백김치', 'Baek Kimchi', 'Non-spicy white kimchi, refreshing and mild.', 5.00, 'banchan', ARRAY['Gluten-Friendly','Dairy-Free'], '/images/food/banchan/baek-kimchi.jpg', true, false, '6 oz', 0, 'kimchi'),
  ('oi-sobagi', '오이소박이', 'Oi Sobagi', 'Stuffed cucumber kimchi filled with chive, garlic, and chili.', 5.00, 'banchan', ARRAY['Gluten-Friendly','Dairy-Free'], '/images/food/banchan/oi-sobagi.jpg', true, false, '6 oz', 1, 'kimchi'),
  ('buchu-kimchi', '부추김치', 'Buchu Kimchi', 'Bold garlic chive kimchi, herbaceous and pungent.', 5.00, 'banchan', ARRAY['Gluten-Friendly','Dairy-Free'], '/images/food/banchan/buchu-kimchi.jpg', true, false, '5 oz', 2, 'kimchi'),
  ('yangbaechu-kimchi', '양배추 김치', 'Yangbaechu Kimchi', 'Green cabbage kimchi, crunchy and approachable.', 5.00, 'banchan', ARRAY['Gluten-Friendly','Dairy-Free'], '/images/food/banchan/yangbaechu-kimchi.jpg', true, false, '6 oz', 1, 'kimchi')
ON CONFLICT (id) DO NOTHING;

-- Menu items — Appetizers
INSERT INTO menu_items (id, name_ko, name_en, description, price, category, dietary_tags, image_url, available, sold_out, serving_size, spice_level) VALUES
  ('japchae-cups', '잡채 컵', 'Japchae Cups', 'Sweet potato glass noodles tossed with colorful vegetables in a savory soy-sesame garlic sauce.', 9.50, 'appetizer', ARRAY['Vegan','Dairy-Free'], '/images/food/appetizer/japchae-cups.jpg', true, false, '1 serving', 0),
  ('gyeran-mari-bites', '계란말이 바이트', 'Rolled Omelet Cubes', 'Soft Korean rolled omelet bites with soy-sesame dipping sauce. Cheese add-on +$1.', 8.95, 'appetizer', ARRAY['Vegetarian'], '/images/food/appetizer/gyeran-mari-bites.jpg', true, false, '1 serving', 0),
  ('dumpling-duo', '만두 듀오', 'Dumpling Duo Plate', 'A mix of crispy pan-fried and steamed Korean dumplings with soy-vinegar sauce.', 9.95, 'appetizer', ARRAY[]::text[], '/images/food/appetizer/dumpling-duo.jpg', true, false, '1 serving', 0),
  ('tteokbokki', '떡볶이', 'Tteokbokki', 'Chewy Korean rice cakes in sweet-spicy gochujang or creamy rose sauce.', 9.95, 'appetizer', ARRAY['Dairy-Free'], '/images/food/appetizer/tteokbokki.jpg', true, false, '1 serving', 2),
  ('kimchi-cheese-jeon', '김치치즈전', 'Kimchi Cheese Jeon', 'Crispy mini kimchi pancakes with melted cheese and soy-vinegar dipping sauce.', 9.50, 'appetizer', ARRAY[]::text[], '/images/food/appetizer/kimchi-cheese-jeon.jpg', true, false, '1 serving', 1),
  ('kfc-bites', '허니 고추장 치킨', 'Korean Fried Chicken Bites', 'Crispy chicken bites glazed in Korean honey gochujang sauce.', 9.95, 'appetizer', ARRAY['Dairy-Free'], '/images/food/appetizer/kfc-bites.jpg', true, false, '1 serving', 2),
  ('tteok-skewers', '떡꼬치', 'Grilled Tteok Skewers', 'Grilled rice cake skewers with sweet-spicy gochujang glaze.', 8.95, 'appetizer', ARRAY['Vegan','Dairy-Free'], '/images/food/appetizer/tteok-skewers.jpg', true, false, '1 serving', 1),
  ('dubu-gangjeong', '두부강정', 'Dubu Gangjeong', 'Crispy tofu bites in soy garlic or sweet gochujang glaze.', 9.50, 'appetizer', ARRAY['Vegan','Dairy-Free'], '/images/food/appetizer/dubu-gangjeong.jpg', true, false, '1 serving', 1),
  ('eomuk-skewers', '어묵 스큐어 컵', 'Eomuk Skewer Cups', 'Warm Korean fish cake skewers in light savory broth.', 9.25, 'appetizer', ARRAY['Dairy-Free'], '/images/food/appetizer/eomuk-skewers.jpg', true, false, '1 serving', 0),
  ('mini-corn-dogs', '미니 핫도그', 'Mini Korean Corn Dog Bites', 'Mini Korean-style corn dogs with signature dipping sauces.', 9.95, 'appetizer', ARRAY[]::text[], '/images/food/appetizer/mini-corn-dogs.jpg', true, false, '1 serving', 0)
ON CONFLICT (id) DO NOTHING;

-- Eligible buildings
INSERT INTO eligible_buildings (name, address, zip_code, neighborhood) VALUES
  ('The Beacon', '85 River Drive South', '07310', 'Waterfront'),
  ('Ellipse', '25 River Drive South', '07310', 'Waterfront'),
  ('Crystal Point', '2 2nd Street', '07302', 'Exchange Place'),
  ('Portofino', '1 2nd Street', '07302', 'Exchange Place'),
  ('70 Columbus', '70 Columbus Drive', '07302', 'Downtown'),
  ('Liberty Towers', '33 Hudson Street', '07302', 'Paulus Hook'),
  ('Paulus Hook Towers', '100 Montgomery Street', '07302', 'Paulus Hook'),
  ('The Morgan', '140 Morgan Street', '07302', 'Downtown'),
  ('Dixon Mills', '1 Mill Street', '07302', 'Downtown'),
  ('Journal Squared', '615 Pavonia Avenue', '07306', 'Journal Square'),
  ('Urby', '200 Greene Street', '07311', 'Waterfront'),
  ('Monaco', '475 Washington Boulevard', '07310', 'Waterfront'),
  ('The Vantage', '1 Vantage Court', '07302', 'Hamilton Park'),
  ('BLVD Collection', '18 Park Street', '07306', 'Journal Square'),
  ('225 Grand', '225 Grand Street', '07302', 'Downtown'),
  ('Grove Pointe', '150 Bay Street', '07302', 'Downtown'),
  ('Hamilton House', '50 Hamilton Street', '07302', 'Hamilton Park'),
  ('The Heights Tower', '350 Central Avenue', '07307', 'The Heights')
ON CONFLICT DO NOTHING;

-- Delivery schedule: Tuesday, Thursday, Saturday
INSERT INTO delivery_schedule (day_of_week, active, cutoff_hours_before) VALUES
  (2, true, 24),
  (4, true, 24),
  (6, true, 24)
ON CONFLICT DO NOTHING;


-- ========================
-- 12. WEBHOOK DEDUP TABLE
-- ========================

CREATE TABLE IF NOT EXISTS webhook_processed_events (
  event_id text PRIMARY KEY,
  processed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_processed_events(processed_at);
ALTER TABLE webhook_processed_events ENABLE ROW LEVEL SECURITY;

-- ========================
-- 13. PROMO CODES
-- ========================

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

DROP POLICY IF EXISTS "Anyone can read active promo codes" ON promo_codes;
CREATE POLICY "Anyone can read active promo codes"
  ON promo_codes FOR SELECT
  USING (active = true AND (expires_at IS NULL OR expires_at > now()));

-- ========================
-- 14. NEWSLETTER SUBSCRIBERS
-- ========================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ========================
-- 15. SITE SETTINGS
-- ========================

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ========================
-- 16. INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_subject ON contact_submissions(subject);

-- ========================
-- 17. ADMIN PROFILE
-- ========================

INSERT INTO profiles (id, full_name, role)
VALUES ('97a2dbf1-f088-4197-a036-08d5cb571d13', 'Tristan Kublanov', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Tristan Kublanov';
