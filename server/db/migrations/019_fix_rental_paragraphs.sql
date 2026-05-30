-- Migration 019: populate the empty rental-page service description.
-- /ingatlan-berbeadas service.paragraphs was stored as {"hu":"<p></p>","en":""},
-- so the description section rendered empty. Idempotent: re-running re-sets the same value.
UPDATE content_blocks
   SET content = '{"hu":"<p>Lakossági ingatlanok (lakások, házak) és gazdasági, ipari ingatlanok bérbeadásában nyújtunk segítséget.</p><p>Segítünk a megfelelő bérlő megtalálásában, a bérleti szerződés elkészítésében és a jogi háttér biztosításában.</p><p>Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!</p>","en":"<p>We help with the letting of residential properties (apartments, houses) as well as commercial and industrial properties.</p><p>We help find the right tenant, prepare the lease agreement, and ensure legal compliance.</p><p>Contact us and let''s find the best solution together!</p>"}',
       updated_at = NOW()
 WHERE page_path = '/ingatlan-berbeadas'
   AND block_key = 'service.paragraphs';
