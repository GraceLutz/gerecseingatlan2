-- ============================================
-- 017: Ensure both split service pages have complete CMS content
-- Seeds /ingatlan-ertekesites and /ingatlan-berbeadas with full bilingual blocks.
-- Skips existing rows to preserve any admin edits.
-- ============================================

DO $$
BEGIN

-- /ingatlan-ertekesites (Property Sales)
INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.title', '{"hu":"Ingatlan értékesítés","en":"Property Sales"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.title');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.subtitle', '{"hu":"Lakossági és gazdasági ingatlanok értékesítése","en":"Residential and commercial property sales"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.subtitle');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.paragraphs', '{"hu":"<p>Lakossági ingatlanok (lakások, házak, telkek) és gazdasági, ipari, mezőgazdasági ingatlanok értékesítésében nyújtunk segítséget.</p><p>Az értékesítési folyamat minden lépésében támogatjuk: az ingatlan felmérésétől, az árazáson és hirdetésen át a szerződéskötésig.</p><p>Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!</p>","en":"<p>We help with the sale of residential properties (apartments, houses, plots) as well as commercial, industrial, and agricultural properties.</p><p>We support you at every step of the sales process: from property assessment, pricing, and advertising to contract signing.</p><p>Contact us and let''s find the best solution together!</p>"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.paragraphs');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.benefits.title', '{"hu":"Előnyeink","en":"Our Benefits"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.benefits.title');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.benefits', '{"hu":["Ingyenes ingatlan értékelés","Professzionális fotózás és hirdetés","Teljes körű ügyintézés","Szerződéskötés segítése"],"en":["Free property evaluation","Professional photography and advertising","Full administrative support","Contract assistance"]}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.benefits');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.cta.text', '{"hu":"Érdekli szolgáltatásunk? Vegye fel velünk a kapcsolatot!","en":"Interested in our service? Get in touch with us!"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.cta.text');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.cta.label', '{"hu":"Érdeklődöm","en":"I''m interested"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.cta.label');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.cta.url', '{"hu":"/kapcsolat","en":"/en/contact"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.cta.url');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.otherServices', '{"hu":"További szolgáltatásaink","en":"Our Other Services"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.otherServices');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-ertekesites', 'service.moreLink', '{"hu":"Részletek","en":"More"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-ertekesites' AND block_key='service.moreLink');

-- /ingatlan-berbeadas (Property Letting)
INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.title', '{"hu":"Ingatlan bérbeadás","en":"Property Letting"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.title');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.subtitle', '{"hu":"Lakossági és gazdasági ingatlanok bérbeadása","en":"Residential and commercial property letting and rentals"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.subtitle');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.paragraphs', '{"hu":"<p>Lakossági ingatlanok (lakások, házak) és gazdasági, ipari ingatlanok bérbeadásában nyújtunk segítséget.</p><p>Segítünk a megfelelő bérlő megtalálásában, a bérleti szerződés elkészítésében és a jogi háttér biztosításában.</p><p>Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!</p>","en":"<p>We help with the letting of residential properties (apartments, houses) as well as commercial and industrial properties.</p><p>We help find the right tenant, prepare the lease agreement, and ensure legal compliance.</p><p>Contact us and let''s find the best solution together!</p>"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.paragraphs');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.benefits.title', '{"hu":"Előnyeink","en":"Our Benefits"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.benefits.title');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.benefits', '{"hu":["Bérlő kiválasztás","Bérleti szerződés készítés","Jogi háttér biztosítás","Teljes körű ügyintézés"],"en":["Tenant selection","Lease agreement preparation","Legal compliance","Full administrative support"]}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.benefits');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.cta.text', '{"hu":"Érdekli szolgáltatásunk? Vegye fel velünk a kapcsolatot!","en":"Interested in our service? Get in touch with us!"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.cta.text');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.cta.label', '{"hu":"Érdeklődöm","en":"I''m interested"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.cta.label');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.cta.url', '{"hu":"/kapcsolat","en":"/en/contact"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.cta.url');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.otherServices', '{"hu":"További szolgáltatásaink","en":"Our Other Services"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.otherServices');

INSERT INTO content_blocks (page_path, block_key, content, content_type) SELECT '/ingatlan-berbeadas', 'service.moreLink', '{"hu":"Részletek","en":"More"}', 'json' WHERE NOT EXISTS (SELECT 1 FROM content_blocks WHERE page_path='/ingatlan-berbeadas' AND block_key='service.moreLink');

END $$;
