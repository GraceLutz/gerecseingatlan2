-- ============================================
-- 012: Update /bemutatkozas motto, title, and
-- "not right fit" items per operator request.
-- Safe to re-run: ON CONFLICT DO UPDATE.
-- ============================================

-- Motto
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES (
    '/bemutatkozas',
    'intro.motto',
    '{"hu":"Az a jó üzlet amikor mindenki elégedett😊","en":"A good deal is when everyone is satisfied😊"}',
    'json'
  )
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- Not Right Fit title
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES (
    '/bemutatkozas',
    'intro.notRightFit.title',
    '{"hu":"Mikor NEM mi vagyunk a megoldás az Ön élethelyzetére, ingatlant érintő problémájára?","en":"When are we NOT the solution for your situation or property problem?"}',
    'json'
  )
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- Not Right Fit items (5 items, removed "low commission" item)
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES (
    '/bemutatkozas',
    'intro.notRightFit.items',
    '{"hu":["Ha nem szeretne őszinte, reális véleményt hallani","Ha nem hajlandó kihasználni általunk biztosított kedvezményeket","Ha zavarja az, hogy mindent elintézünk Ön helyett (érintésvédelem, energetika, földhivatali ügyintézés, ügyvédi egyeztetések az adásvétellel és az ingatlant érintő tennivalókkal kapcsolatban)","Ha azt várja, hogy rábeszéljük vagy támogassuk egy rossz döntésben","Ha nem szeretne első kézből hitelezési tanácsokat, információkat kapni"],"en":["If you don''t want to hear honest, realistic opinions","If you''re unwilling to take advantage of the discounts we provide","If it bothers you that we handle everything for you (contact protection, energy certification, land registry, legal consultations regarding the sale and property-related tasks)","If you expect us to talk you into or support a bad decision","If you don''t want first-hand mortgage advice and information"]}',
    'json'
  )
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();
