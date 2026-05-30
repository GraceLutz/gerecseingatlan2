-- ============================================
-- 013: Fix missing English translations and
-- malformed content blocks.
-- Safe to re-run: ON CONFLICT DO UPDATE.
-- ============================================

-- /belsoepiteszet-latvanyterv
UPDATE content_blocks SET content = '{"hu":"Belsőépítészeti tanácsadás és 3D látványtervezés közvetítése.","en":"Interior design consultation and 3D visualization brokerage."}'
  WHERE page_path = '/belsoepiteszet-latvanyterv' AND block_key = 'service.paragraphs[0]' AND content_type = 'json';

-- /teljeskoru-jogi-hatter
UPDATE content_blocks SET content = '{"hu":"Ügyvédi közreműködés, szerződésírás, jogi tanácsadás ingatlanügyekhez.","en":"Legal assistance, contract drafting, and legal advice for real estate matters."}'
  WHERE page_path = '/teljeskoru-jogi-hatter' AND block_key = 'service.paragraphs[0]' AND content_type = 'json';

-- /impresszum
UPDATE content_blocks SET content = '{"hu":"Gerecse Ingatlan","en":"Gerecse Ingatlan"}'
  WHERE page_path = '/impresszum' AND block_key = 'company.name' AND content_type = 'json';

UPDATE content_blocks SET content = '{"hu":"2541 Lábatlan Rákóczi F. út 123.","en":"2541 Lábatlan, Rákóczi F. út 123."}'
  WHERE page_path = '/impresszum' AND block_key = 'company.address' AND content_type = 'json';

UPDATE content_blocks SET content = '{"hu":"91954633-1-31","en":"91954633-1-31"}'
  WHERE page_path = '/impresszum' AND block_key = 'company.taxNumber' AND content_type = 'json';

UPDATE content_blocks SET content = '{"hu":"","en":""}'
  WHERE page_path = '/impresszum' AND block_key = 'company.regNumber' AND content_type = 'json';

-- /kapcsolat hours
UPDATE content_blocks SET content = '{"hu":"","en":""}'
  WHERE page_path = '/kapcsolat' AND block_key = 'contact.info.hours.saturday' AND content_type = 'json';

UPDATE content_blocks SET content = '{"hu":"","en":""}'
  WHERE page_path = '/kapcsolat' AND block_key = 'contact.info.hours.sunday' AND content_type = 'json';

-- /ertekbecsles-ertekmeghatrozas empty paragraphs - ensure valid bilingual format
UPDATE content_blocks SET content = '{"hu":"","en":""}'
  WHERE page_path = '/ertekbecsles-ertekmeghatrozas' AND block_key IN ('service.paragraphs[0]','service.paragraphs[1]','service.paragraphs[2]','service.paragraphs[3]') AND content_type = 'json'
  AND (content IS NULL OR content = '' OR content = '{"hu":""}');

-- /hitel-allami-tamogatasok empty paragraphs
UPDATE content_blocks SET content = '{"hu":"","en":""}'
  WHERE page_path = '/hitel-allami-tamogatasok' AND block_key IN ('service.paragraphs[0]','service.paragraphs[3]') AND content_type = 'json'
  AND (content IS NULL OR content = '' OR content = '{"hu":""}');

-- /ingatlan-ertekesites-berbeadas fix double-encoded JSON
UPDATE content_blocks SET content = '{"hu":"Az ingatlanértékesítés folyamata az eladó ingatlan felkészítésével, árazásával, hirdetésével, a vevők szűrésével, a szerződéskötéssel és a birtokba adással foglalkozik.","en":"The property sales process covers preparing the property for sale, pricing, advertising, screening buyers, contract signing, and handover."}'
  WHERE page_path = '/ingatlan-ertekesites-berbeadas' AND block_key = 'service.paragraphs[0]' AND content_type = 'json';
