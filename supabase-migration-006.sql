-- Migration 006: Insert appetizer menu items (if missing from DB)
-- The appetizer category was added in migration-005, but the actual items were not inserted.

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
