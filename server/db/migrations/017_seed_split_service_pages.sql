-- ============================================
-- 017: Ensure both split service pages have complete CMS content
-- Seeds /ingatlan-ertekesites and /ingatlan-berbeadas with full bilingual blocks.
-- Uses ON CONFLICT DO NOTHING to preserve any existing admin edits.
-- ============================================

-- /ingatlan-ertekesites (Property Sales)
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.title', '{"hu":"Ingatlan értékesítés","en":"Property Sales"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.subtitle', '{"hu":"Lakossági és gazdasági ingatlanok értékesítése","en":"Residential and commercial property sales"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.paragraphs', '{"hu":"<p>Lakossági ingatlanok (lakások, házak, telkek) és gazdasági, ipari, mezőgazdasági ingatlanok értékesítésében nyújtunk segítséget.</p><p>Az értékesítési folyamat minden lépésében támogatjuk: az ingatlan felmérésétől, az árazáson és hirdetésen át a szerződéskötésig.</p><p>Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!</p>","en":"<p>We help with the sale of residential properties (apartments, houses, plots) as well as commercial, industrial, and agricultural properties.</p><p>We support you at every step of the sales process: from property assessment, pricing, and advertising to contract signing.</p><p>Contact us and let''s find the best solution together!</p>"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.benefits.title', '{"hu":"Előnyeink","en":"Our Benefits"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.benefits', '{"hu":["Ingyenes ingatlan értékelés","Professzionális fotózás és hirdetés","Teljes körű ügyintézés","Szerződéskötés segítése"],"en":["Free property evaluation","Professional photography and advertising","Full administrative support","Contract assistance"]}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.cta.text', '{"hu":"Érdekli szolgáltatásunk? Vegye fel velünk a kapcsolatot!","en":"Interested in our service? Get in touch with us!"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.cta.label', '{"hu":"Érdeklődöm","en":"I''m interested"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.cta.url', '{"hu":"/kapcsolat","en":"/en/contact"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.otherServices', '{"hu":"További szolgáltatásaink","en":"Our Other Services"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites', 'service.moreLink', '{"hu":"Részletek","en":"More"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

-- /ingatlan-berbeadas (Property Letting)
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
  VALUES ('/ingatlan-berbeadas', 'service.cta.text', '{"hu":"Érdekli szolgáltatásunk? Vegye fel velünk a kapcsolatot!","en":"Interested in our service? Get in touch with us!"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.cta.label', '{"hu":"Érdeklődöm","en":"I''m interested"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.cta.url', '{"hu":"/kapcsolat","en":"/en/contact"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.otherServices', '{"hu":"További szolgáltatásaink","en":"Our Other Services"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-berbeadas', 'service.moreLink', '{"hu":"Részletek","en":"More"}', 'json')
  ON CONFLICT (page_path, block_key) DO NOTHING;
