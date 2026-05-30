-- ============================================
-- 015: Split ingatlan-ertekesites-berbeadas into two separate service pages
-- Creates /ingatlan-ertekesites (selling) and /ingatlan-berbeadas (letting)
-- ============================================

-- UP MIGRATION

-- Step 1: Copy existing combined page content to the new selling page
UPDATE content_blocks
  SET page_path = '/ingatlan-ertekesites'
  WHERE page_path = '/ingatlan-ertekesites-berbeadas';

-- Step 2: Update the title for the selling page
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.title', '{"hu":"Ingatlan értékesítés","en":"Property Sales"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.subtitle', '{"hu":"Lakossági és gazdasági ingatlanok értékesítése","en":"Residential and commercial property sales"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.paragraphs', '{"hu":"<p>Lakossági ingatlanok (lakások, házak, telkek) és gazdasági, ipari, mezőgazdasági ingatlanok értékesítésében nyújtunk segítséget.</p><p>Az értékesítési folyamat minden lépésében támogatjuk: az ingatlan felmérésétől, az árazáson és hirdetésen át a szerződéskötésig.</p><p>Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!</p>","en":"<p>We help with the sale of residential properties (apartments, houses, plots) as well as commercial, industrial, and agricultural properties.</p><p>We support you at every step of the sales process: from property assessment, pricing, and advertising to contract signing.</p><p>Contact us and let''s find the best solution together!</p>"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

-- Step 3: Create the new letting/rental page with its own content
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.title', '{"hu":"Ingatlan bérbeadás","en":"Property Letting"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.subtitle', '{"hu":"Lakossági és gazdasági ingatlanok bérbeadása","en":"Residential and commercial property letting and rentals"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.paragraphs', '{"hu":"<p>Lakossági ingatlanok (lakások, házak) és gazdasági, ipari ingatlanok bérbeadásában nyújtunk segítséget.</p><p>Segítünk a megfelelő bérlő megtalálásában, a bérleti szerződés elkészítésében és a jogi háttér biztosításában.</p><p>Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!</p>","en":"<p>We help with the letting of residential properties (apartments, houses) as well as commercial and industrial properties.</p><p>We help find the right tenant, prepare the lease agreement, and ensure legal compliance.</p><p>Contact us and let''s find the best solution together!</p>"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.benefits.title', '{"hu":"Előnyeink","en":"Our Benefits"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.benefits', '{"hu":["Bérlő kiválasztás","Bérleti szerződés készítés","Jogi háttér biztosítás","Teljes körű ügyintézés"],"en":["Tenant selection","Lease agreement preparation","Legal compliance","Full administrative support"]}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.cta.label', '{"hu":"Érdeklődöm","en":"I''m interested"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.cta.url', '/kapcsolat', 'text')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.cta.text', '{"hu":"Érdekli szolgáltatásunk? Vegye fel velünk a kapcsolatot!","en":"Interested in our service? Get in touch with us!"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

-- Step 4: Update the services overview title on the homepage
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'services.salesTitle', '{"hu":"Ingatlan értékesítés","en":"Property Sales"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'services.salesDesc', '{"hu":"Lakossági, gazdasági és ipari ingatlanok értékesítése.","en":"Residential, commercial, and industrial property sales."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'services.rentalTitle', '{"hu":"Ingatlan bérbeadás","en":"Property Letting"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'services.rentalDesc', '{"hu":"Lakossági, gazdasági és ipari ingatlanok bérbeadása.","en":"Residential, commercial, and industrial property letting and rentals."}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

-- Step 5: Add footer link for the new rental page
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/footer', 'links.rental', '{"hu":"Ingatlan bérbeadás","en":"Property Letting"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

-- DOWN MIGRATION (run manually to rollback):
-- UPDATE content_blocks SET page_path = '/ingatlan-ertekesites-berbeadas' WHERE page_path = '/ingatlan-ertekesites';
-- DELETE FROM content_blocks WHERE page_path = '/ingatlan-berbeadas';
-- DELETE FROM content_blocks WHERE page_path = '/' AND block_key = 'services.rentalTitle';
-- DELETE FROM content_blocks WHERE page_path = '/' AND block_key = 'services.rentalDesc';
-- DELETE FROM content_blocks WHERE page_path = '/footer' AND block_key = 'links.rental';
