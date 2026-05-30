-- ============================================
-- 017: Ensure both split service pages have complete CMS content
-- Safe to run regardless of DB state — handles all cases:
--   - Old combined page still exists → moves it to ertekesites
--   - Some rows already exist → skips them
--   - No rows exist → creates them
-- ============================================

-- Step 1: If old combined page rows still exist, move them to ertekesites
UPDATE content_blocks
  SET page_path = '/ingatlan-ertekesites'
  WHERE page_path = '/ingatlan-ertekesites-berbeadas'
    AND NOT EXISTS (
      SELECT 1 FROM content_blocks cb2
      WHERE cb2.page_path = '/ingatlan-ertekesites'
        AND cb2.block_key = content_blocks.block_key
    );

-- Step 2: Delete any leftover old combined page rows (already copied above)
DELETE FROM content_blocks WHERE page_path = '/ingatlan-ertekesites-berbeadas';

-- Step 3: Seed /ingatlan-ertekesites blocks (skip if exist)
INSERT INTO content_blocks (page_path, block_key, content, content_type)
SELECT v.page_path, v.block_key, v.content, v.content_type
FROM (VALUES
  ('/ingatlan-ertekesites', 'service.title', '{"hu":"Ingatlan értékesítés","en":"Property Sales"}', 'json'),
  ('/ingatlan-ertekesites', 'service.subtitle', '{"hu":"Lakossági és gazdasági ingatlanok értékesítése","en":"Residential and commercial property sales"}', 'json'),
  ('/ingatlan-ertekesites', 'service.paragraphs', '{"hu":"<p>Lakossági ingatlanok (lakások, házak, telkek) és gazdasági, ipari, mezőgazdasági ingatlanok értékesítésében nyújtunk segítséget.</p><p>Az értékesítési folyamat minden lépésében támogatjuk: az ingatlan felmérésétől, az árazáson és hirdetésen át a szerződéskötésig.</p><p>Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!</p>","en":"<p>We help with the sale of residential properties (apartments, houses, plots) as well as commercial, industrial, and agricultural properties.</p><p>We support you at every step of the sales process: from property assessment, pricing, and advertising to contract signing.</p><p>Contact us and let''s find the best solution together!</p>"}', 'json'),
  ('/ingatlan-ertekesites', 'service.benefits.title', '{"hu":"Előnyeink","en":"Our Benefits"}', 'json'),
  ('/ingatlan-ertekesites', 'service.benefits', '{"hu":["Ingyenes ingatlan értékelés","Professzionális fotózás és hirdetés","Teljes körű ügyintézés","Szerződéskötés segítése"],"en":["Free property evaluation","Professional photography and advertising","Full administrative support","Contract assistance"]}', 'json'),
  ('/ingatlan-ertekesites', 'service.cta.text', '{"hu":"Érdekli szolgáltatásunk? Vegye fel velünk a kapcsolatot!","en":"Interested in our service? Get in touch with us!"}', 'json'),
  ('/ingatlan-ertekesites', 'service.cta.label', '{"hu":"Érdeklődöm","en":"I''m interested"}', 'json'),
  ('/ingatlan-ertekesites', 'service.cta.url', '{"hu":"/kapcsolat","en":"/en/contact"}', 'json'),
  ('/ingatlan-ertekesites', 'service.otherServices', '{"hu":"További szolgáltatásaink","en":"Our Other Services"}', 'json'),
  ('/ingatlan-ertekesites', 'service.moreLink', '{"hu":"Részletek","en":"More"}', 'json')
) AS v(page_path, block_key, content, content_type)
WHERE NOT EXISTS (
  SELECT 1 FROM content_blocks cb
  WHERE cb.page_path = v.page_path AND cb.block_key = v.block_key
);

-- Step 4: Seed /ingatlan-berbeadas blocks (skip if exist)
INSERT INTO content_blocks (page_path, block_key, content, content_type)
SELECT v.page_path, v.block_key, v.content, v.content_type
FROM (VALUES
  ('/ingatlan-berbeadas', 'service.title', '{"hu":"Ingatlan bérbeadás","en":"Property Letting"}', 'json'),
  ('/ingatlan-berbeadas', 'service.subtitle', '{"hu":"Lakossági és gazdasági ingatlanok bérbeadása","en":"Residential and commercial property letting and rentals"}', 'json'),
  ('/ingatlan-berbeadas', 'service.paragraphs', '{"hu":"<p>Lakossági ingatlanok (lakások, házak) és gazdasági, ipari ingatlanok bérbeadásában nyújtunk segítséget.</p><p>Segítünk a megfelelő bérlő megtalálásában, a bérleti szerződés elkészítésében és a jogi háttér biztosításában.</p><p>Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!</p>","en":"<p>We help with the letting of residential properties (apartments, houses) as well as commercial and industrial properties.</p><p>We help find the right tenant, prepare the lease agreement, and ensure legal compliance.</p><p>Contact us and let''s find the best solution together!</p>"}', 'json'),
  ('/ingatlan-berbeadas', 'service.benefits.title', '{"hu":"Előnyeink","en":"Our Benefits"}', 'json'),
  ('/ingatlan-berbeadas', 'service.benefits', '{"hu":["Bérlő kiválasztás","Bérleti szerződés készítés","Jogi háttér biztosítás","Teljes körű ügyintézés"],"en":["Tenant selection","Lease agreement preparation","Legal compliance","Full administrative support"]}', 'json'),
  ('/ingatlan-berbeadas', 'service.cta.text', '{"hu":"Érdekli szolgáltatásunk? Vegye fel velünk a kapcsolatot!","en":"Interested in our service? Get in touch with us!"}', 'json'),
  ('/ingatlan-berbeadas', 'service.cta.label', '{"hu":"Érdeklődöm","en":"I''m interested"}', 'json'),
  ('/ingatlan-berbeadas', 'service.cta.url', '{"hu":"/kapcsolat","en":"/en/contact"}', 'json'),
  ('/ingatlan-berbeadas', 'service.otherServices', '{"hu":"További szolgáltatásaink","en":"Our Other Services"}', 'json'),
  ('/ingatlan-berbeadas', 'service.moreLink', '{"hu":"Részletek","en":"More"}', 'json')
) AS v(page_path, block_key, content, content_type)
WHERE NOT EXISTS (
  SELECT 1 FROM content_blocks cb
  WHERE cb.page_path = v.page_path AND cb.block_key = v.block_key
);
