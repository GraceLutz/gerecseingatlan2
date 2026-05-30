-- ============================================
-- 008: Content body blocks — full CMS seed
-- Seeds all body text, lists, FAQ, testimonials
-- for click-to-edit visual editor feature.
-- Safe to re-run: ON CONFLICT DO UPDATE.
-- ============================================

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites-berbeadas', 'service.title', '{"hu":"Ingatlan értékesítés és bérbeadás","en":"Property Sales & Rentals"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites-berbeadas', 'service.subtitle', '{"hu":"Lakossági és gazdasági ingatlanok értékesítése, bérbeadása","en":"Residential and commercial property sales and rentals"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites-berbeadas', 'service.paragraphs', '{"hu":["Lakossági ingatlanok (lakások, házak, telkek) és gazdasági, ipari, mezőgazdasági ingatlanok értékesítésében és bérbeadásában nyújtunk segítséget.","Az értékesítési folyamat minden lépésében támogatjuk: az ingatlan felmérésétől, az árazáson és hirdetésen át a szerződéskötésig.","Bérbeadás esetén segítünk a megfelelő bérlő megtalálásában, a bérleti szerződés elkészítésében és a jogi háttér biztosításában.","Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!"],"en":["We help with the sale and rental of residential properties (apartments, houses, plots) as well as commercial, industrial, and agricultural properties.","We support you at every step of the sales process: from property assessment, pricing, and advertising to contract signing.","For rentals, we help find the right tenant, prepare the lease agreement, and ensure legal compliance.","Contact us and let''s find the best solution together!"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites-berbeadas', 'service.benefits', '{"hu":["Ingyenes ingatlan értékelés","Professzionális fotózás és hirdetés","Teljes körű ügyintézés","Szerződéskötés segítése"],"en":["Free property evaluation","Professional photography and advertising","Full administrative support","Contract assistance"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ingatlan-ertekesites-berbeadas', 'service.cta.label', '{"hu":"Érdeklődöm","en":"I''m interested"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ertekbecsles-ertekmeghatrozas', 'service.title', '{"hu":"Értékbecslés és értékmeghatározás","en":"Appraisal & Valuation"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ertekbecsles-ertekmeghatrozas', 'service.subtitle', '{"hu":"Hivatalos értékbecslés és piaci értékmeghatározás","en":"Official appraisal and market valuation"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ertekbecsles-ertekmeghatrozas', 'service.paragraphs', '{"hu":["Két szintű szolgáltatást kínálunk az Ön igényeinek megfelelően:","Értékbecslés – a hivatalos, magasabb fokozat. Szükséges lehet banki hitelügyintézéshez, bírósági ügyekhez.","Értékmeghatározás – az egyszerűbb fokozat. Jellemzően eladáshoz kérik.","Tapasztalt, akkreditált szakértőkkel dolgozunk."],"en":["We offer two levels of service to match your needs:","Property Appraisal – the official, higher level. Required for bank mortgages, court cases.","Value Determination – the simpler level. Typically requested for sales.","We work with experienced, accredited experts."]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ertekbecsles-ertekmeghatrozas', 'service.benefits', '{"hu":["Hivatalos, akkreditált értékbecslők","Hiteligényléshez elfogadott","Piaci összehasonlító elemzés","Gyors és pontos értékelés"],"en":["Official, accredited appraisers","Accepted for mortgage applications","Market comparative analysis","Fast and accurate valuation"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/ertekbecsles-ertekmeghatrozas', 'service.cta.label', '{"hu":"Értékbecslést kérek","en":"Request appraisal"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/belsoepiteszet-latvanyterv', 'service.title', '{"hu":"Belsőépítészet és látványterv","en":"Interior Design & Visualization"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/belsoepiteszet-latvanyterv', 'service.subtitle', '{"hu":"3D látványtervezés és belsőépítészeti tanácsadás","en":"3D visualization and interior design consulting"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/belsoepiteszet-latvanyterv', 'service.paragraphs', '{"hu":["Belsőépítészeti tanácsadás és 3D látványtervezés – közvetített szolgáltatásként.","A tényleges munkát tapasztalt alvállalkozó belsőépítész végzi.","Segítünk megálmodni és megvalósítani az Ön ideális otthonát.","Kérjük, töltse ki az alábbi űrlapot!"],"en":["Interior design consulting and 3D visualization – provided as a brokered service.","The actual work is carried out by an experienced subcontractor.","We help you dream up and realize your ideal home.","Please fill out the form below!"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/belsoepiteszet-latvanyterv', 'service.benefits', '{"hu":["3D látványtervezés","Teljes belsőépítészeti koncepció","Referencia munkák bemutatása","Közvetített szolgáltatás"],"en":["3D visualization","Complete interior design concept","Reference work showcase","Brokered service"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/belsoepiteszet-latvanyterv', 'service.cta.label', '{"hu":"Ajánlatot kérek","en":"Request a quote"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/teljeskoru-jogi-hatter', 'service.title', '{"hu":"Teljeskörű jogi háttér","en":"Full Legal Support"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/teljeskoru-jogi-hatter', 'service.subtitle', '{"hu":"Ügyvédi közreműködés és jogi tanácsadás ingatlanügyletekhez","en":"Legal assistance and consulting for real estate transactions"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/teljeskoru-jogi-hatter', 'service.paragraphs', '{"hu":["Teljeskörű jogi háttér biztosítása minden ingatlanügylethez.","Ügyvédi közreműködés, szerződésírás, jogi tanácsadás.","Hagyatéki végzések és tulajdonjogi kérdések intézése.","Biztosítjuk, hogy minden tranzakció jogilag megalapozott legyen."],"en":["Full legal support for all real estate transactions.","Legal assistance, contract drafting, legal consulting.","Inheritance rulings and ownership issues.","We ensure every transaction is legally sound."]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/teljeskoru-jogi-hatter', 'service.benefits', '{"hu":["Tapasztalt ingatlan ügyvédek","Tulajdoni lap ellenőrzés","Teljes jogi háttér biztosítása","Hagyatéki ügyek intézése"],"en":["Experienced real estate lawyers","Title deed verification","Complete legal support","Inheritance proceedings"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/teljeskoru-jogi-hatter', 'service.cta.label', '{"hu":"Jogi tanácsadást kérek","en":"Request legal advice"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/hitel-allami-tamogatasok', 'service.title', '{"hu":"Hitel és állami támogatások","en":"Loans & Government Subsidies"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/hitel-allami-tamogatasok', 'service.subtitle', '{"hu":"Bankfüggetlen hitelközvetítés és támogatás ügyintézés","en":"Bank-independent loan brokering and subsidy processing"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/hitel-allami-tamogatasok', 'service.paragraphs', '{"hu":["Segítünk a banki hitelek és állami támogatások ügyintézésében.","Lakáshitel, személyi kölcsön tájékoztatás és bankfüggetlen tanácsadás.","Állami támogatások (CSOK, Babaváró) ügyintézése.","A szolgáltatást közvetítjük."],"en":["We help with bank loan and government subsidy applications.","Housing loan and personal loan information, independent advisory.","Government subsidies (CSOK, Babaváró) processing.","We broker the service."]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/hitel-allami-tamogatasok', 'service.benefits', '{"hu":["Bankfüggetlen tanácsadás","CSOK és Babaváró ügyintézés","Személyre szabott hitelajánlatok","Teljes ügyintézés"],"en":["Bank-independent advice","CSOK and Babaváró processing","Personalized loan offers","Full administrative support"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/hitel-allami-tamogatasok', 'service.cta.label', '{"hu":"Hitelügyintézést kérek","en":"Request loan assistance"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.title', '{"hu":"Energetikai tanúsítvány","en":"Energy Performance Certificate"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.subtitle', '{"hu":"Energetikai tanúsítvány készítése akkreditált szakértőkkel","en":"Energy performance certificates by accredited specialists"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.paragraphs', '{"hu":["Energetikai tanúsítvány készítése ingatlan adásvételhez, bérbeadáshoz.","A tanúsítvány az épület energiahatékonyságát minősíti.","Tapasztalt szakértőinkkel gyors ügyintézést biztosítunk.","Vegye fel velünk a kapcsolatot részletekért!"],"en":["Energy performance certificate for property sales and rentals.","The certificate rates the energy efficiency of the building.","Fast and reliable service with accredited specialists.","Contact us for details and a quote!"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.benefits', '{"hu":["Akkreditált szakértők","Gyors ügyintézés","Jogszabálynak megfelelő tanúsítvány","Adásvételhez és bérbeadáshoz egyaránt"],"en":["Accredited specialists","Fast processing","Legally compliant certificate","For both sales and rentals"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.cta.label', '{"hu":"Tanúsítványt kérek","en":"Request certificate"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/villamos-biztonsagi-felulvizsgalat', 'service.title', '{"hu":"Villamos biztonsági felülvizsgálat","en":"Electrical Safety Inspection"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/villamos-biztonsagi-felulvizsgalat', 'service.subtitle', '{"hu":"VBF ingatlanokhoz és ipari létesítményekhez","en":"VBF for residential and industrial properties"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/villamos-biztonsagi-felulvizsgalat', 'service.paragraphs', '{"hu":["Villamos Biztonsági Felülvizsgálat (VBF) ingatlanokhoz.","Az elektromos hálózat biztonságos állapotának ellenőrzése.","Szakképzett felülvizsgálókkal dolgozunk.","Kérjen árajánlatot!"],"en":["Electrical Safety Inspection (VBF) for properties.","Verifying safe condition of the electrical network.","We work with certified inspectors.","Request a quote!"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/villamos-biztonsagi-felulvizsgalat', 'service.benefits', '{"hu":["Szakképzett felülvizsgálók","Hivatalos jegyzőkönyv","Lakó- és ipari ingatlanokhoz","Jogszabályi megfelelőség"],"en":["Certified inspectors","Official report","Residential and industrial","Legal compliance"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/villamos-biztonsagi-felulvizsgalat', 'service.cta.label', '{"hu":"Árajánlatot kérek","en":"Request a quote"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/gyik', 'page.title', '{"hu":"Gyakran Ismételt Kérdések","en":"Frequently Asked Questions"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/gyik', 'page.subtitle', '{"hu":"Válaszok a leggyakrabban felmerülő kérdésekre","en":"Answers to the most common questions"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/gyik', 'faq.items', '{"hu":[{"q":"Mennyibe kerül az ingatlanközvetítés?","a":"Díjaink az ingatlan értékétől és a szolgáltatás típusától függnek. Kérjen személyre szabott árajánlatot!"},{"q":"Mennyi idő alatt lehet eladni egy ingatlant?","a":"Átlagosan 2-4 hónap, de ez függ az ingatlan típusától, állapotától és az árától."},{"q":"Szükséges-e energetikai tanúsítvány eladáskor?","a":"Igen, ingatlan eladásakor jogszabály írja elő az energetikai tanúsítvány meglétét."},{"q":"Milyen dokumentumok kellenek az eladáshoz?","a":"Tulajdoni lap, alaprajz, energetikai tanúsítvány, személyi igazolvány, lakcímkártya."},{"q":"Vállalnak bérbeadást is?","a":"Igen, segítünk a bérlő megtalálásában és a bérleti szerződés elkészítésében."}],"en":[{"q":"How much does real estate brokering cost?","a":"Our fees depend on property value and service type. Request a personalized quote!"},{"q":"How long does it take to sell a property?","a":"On average 2-4 months, depending on property type, condition, and price."},{"q":"Is an energy certificate required for selling?","a":"Yes, an energy performance certificate is legally required when selling property."},{"q":"What documents are needed for selling?","a":"Title deed, floor plan, energy certificate, ID card, address card."},{"q":"Do you handle rentals too?","a":"Yes, we help find tenants and prepare lease agreements."}]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/velemenyek', 'page.title', '{"hu":"Vélemények","en":"Testimonials"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/velemenyek', 'page.subtitle', '{"hu":"Ügyfeleink tapasztalatai és visszajelzései","en":"Experiences and feedback from our clients"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/velemenyek', 'testimonials.items', '{"hu":[{"name":"Kovács János","role":"Eladó","text":"El sem tudom mondani, mekkora segítség volt a csapat! Két hét alatt eladták – jobb áron, mint amire számítottam.","rating":5},{"name":"Nagy András","role":"Vásárló","text":"Nagyon örülök, hogy rájuk találtam! Segítettek hitelt intézni, és megvettük álmaink otthonát.","rating":5},{"name":"Laurinyecz Éva","role":"Eladó","text":"Az egész folyamat stresszmentes volt! Precízen, pontosan dolgoznak.","rating":5},{"name":"Szabó Beáta","role":"Vásárló","text":"Megbízhatóak, őszinték, és tényleg segíteni akarnak.","rating":5}],"en":[{"name":"János Kovács","role":"Seller","text":"I can''t express how much the team helped! They sold it in two weeks – at a better price than I expected.","rating":5},{"name":"András Nagy","role":"Buyer","text":"I''m so glad I found them! They helped arrange the mortgage, and we bought our dream home.","rating":5},{"name":"Éva Laurinyecz","role":"Seller","text":"The entire process was stress-free! They work precisely and accurately.","rating":5},{"name":"Beáta Szabó","role":"Buyer","text":"Reliable, honest, and they genuinely want to help.","rating":5}]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'intro.title', '{"hu":"Bemutatkozás","en":"About Us"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'intro.heroSubtitle', '{"hu":"Családias hangulatú, megbízható ingatlaniroda a Gerecse környékén","en":"A family-oriented, reliable real estate office in the Gerecse region"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'intro.text', '{"hu":"A Gerecse Ingatlan egy családias hangulatú, megbízható ingatlaniroda Tata és környékén. Célunk, hogy minden ügyfelünk számára megtaláljuk az ideális megoldást.","en":"Gerecse Ingatlan is a family-oriented, reliable real estate agency in Tata and surroundings. Our goal is to find the ideal solution for every client."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'intro.motto', '{"hu":"Az a jó üzlet, amikor mindenki elégedett!","en":"A good deal is when everyone is satisfied!"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'intro.valuesHeading', '{"hu":"Értékeink","en":"Our Values"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'intro.values', '{"hu":["Megbízhatóság","Szakértelem","Gondoskodás","Átláthatóság"],"en":["Reliability","Expertise","Care","Transparency"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'mission.title', '{"hu":"Küldetésünk","en":"Our Mission"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'mission.text', '{"hu":"Segítünk megtalálni az ideális otthont, és biztosítjuk, hogy az ingatlanügylet minden résztvevője elégedett legyen.","en":"We help you find your ideal home and ensure that everyone involved in the transaction is satisfied."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'intro.notRightFit.title', '{"hu":"Nem mi vagyunk a jó választás, ha...","en":"We''re not the right fit if..."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/bemutatkozas', 'intro.notRightFit.items', '{"hu":["Egy napon belül el akarja adni az ingatlanát","Ingyenes szolgáltatást keres","Nem érdekli a részletek megbeszélése","Nem bízik a szakemberekben","Irreális elképzelése van az ingatlan áráról","Nem kíván együttműködni a közvetítővel"],"en":["You want to sell your property within a day","You''re looking for a free service","You''re not interested in discussing details","You don''t trust professionals","You have unrealistic expectations about price","You''re not willing to cooperate with the agent"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'hero.title', '{"hu":"Megbízható partner az ingatlanpiacon","en":"Your Trusted Real Estate Partner"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'hero.subtitle', '{"hu":"Professzionális ingatlanközvetítés a Gerecse környékén","en":"Professional real estate services in the Gerecse region"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'hero.cta', '{"hu":"Ingatlanok böngészése","en":"Browse Properties"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'about.title', '{"hu":"Rólunk","en":"About Us"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'about.text', '{"hu":"Családias hangulatú, megbízható ingatlaniroda Tata és környékén. Több mint 10 éves tapasztalattal segítjük ügyfeleinket.","en":"A family-oriented, reliable real estate office in Tata and surroundings. We help our clients with over 10 years of experience."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'services.title', '{"hu":"Szolgáltatásaink","en":"Our Services"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'services.subtitle', '{"hu":"Átfogó ingatlanszolgáltatások az Ön igényeire szabva","en":"Comprehensive real estate services tailored to your needs"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'page.title', '{"hu":"Impresszum","en":"Legal Notice"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'page.subtitle', '{"hu":"Jogszabályi kötelezettség a 2001. évi CVIII. törvény (Ekertv.) alapján","en":"Legal obligation under Hungarian Act CVIII of 2001"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.heading', '{"hu":"Szolgáltató adatai","en":"Service Provider"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.nameLabel', '{"hu":"Cégnév","en":"Company name"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.name', 'Gerecse Ingatlan Kft.', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.addressLabel', '{"hu":"Székhely","en":"Registered office"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.address', '2890 Tata, Példa utca 1.', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.regLabel', '{"hu":"Cégjegyzékszám","en":"Company registration no."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.regNumber', '11-09-XXXXXX', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.taxLabel', '{"hu":"Adószám","en":"Tax number"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.taxNumber', 'XXXXXXXX-X-XX', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.courtLabel', '{"hu":"Nyilvántartó bíróság","en":"Court of registration"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.court', '{"hu":"Tatabányai Törvényszék Cégbírósága","en":"Company Court of Tatabánya"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.repLabel', '{"hu":"Képviselő","en":"Representative"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'company.rep', '{"hu":"Gerecse Ingatlan ügyvezető","en":"Managing Director"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'contact.heading', '{"hu":"Elérhetőségek","en":"Contact Information"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'contact.phone', '+36 70 613 2658', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'contact.email', 'info@gerecseingatlan.hu', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'contact.website', 'gerecseingatlan.hu', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'hosting.heading', '{"hu":"Tárhelyszolgáltató","en":"Hosting Provider"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'hosting.nameLabel', '{"hu":"Név","en":"Name"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'hosting.name', '[Tárhelyszolgáltató neve]', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'hosting.addressLabel', '{"hu":"Cím","en":"Address"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'hosting.address', '[Tárhelyszolgáltató címe]', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'hosting.webLabel', '{"hu":"Weboldal","en":"Website"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'hosting.website', '[Tárhelyszolgáltató weboldala]', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'copyright.heading', '{"hu":"Szerzői jogok","en":"Copyright"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/impresszum', 'copyright.text', '{"hu":"© 2026 Gerecse Ingatlan Kft. Minden jog fenntartva.","en":"© 2026 Gerecse Ingatlan Kft. All rights reserved."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'page.title', '{"hu":"Kapcsolat","en":"Contact"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'page.subtitle', '{"hu":"Vegye fel velünk a kapcsolatot","en":"Get in touch with us"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.phone', '{"hu":"+36 70 613 2658","en":"+36 70 613 2658"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.email', '{"hu":"info@gerecseingatlan.hu","en":"info@gerecseingatlan.hu"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.hours', '{"hu":"H-P: 9:00 - 17:00","en":"Mon-Fri: 9:00 AM - 5:00 PM"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.address', '{"hu":"2890 Tata, Példa utca 1.","en":"2890 Tata, Példa utca 1."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/footer', 'contact.title', '{"hu":"Kapcsolat","en":"Contact"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/footer', 'quickLinks.title', '{"hu":"Gyors linkek","en":"Quick Links"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/footer', 'services.title', '{"hu":"Szolgáltatások","en":"Services"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/footer', 'newsletter.title', '{"hu":"Hírlevél","en":"Newsletter"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/footer', 'newsletter.subtitle', '{"hu":"Értesüljön elsőként az új ingatlanokról!","en":"Be the first to know about new properties!"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/footer', 'copyright', '{"hu":"© 2026 Gerecse Ingatlan. Minden jog fenntartva.","en":"© 2026 Gerecse Ingatlan. All rights reserved."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- ============================================
-- Contact page — full content keys
-- ============================================

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.phone.label', '{"hu":"Telefon","en":"Phone"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.phone.value', '+36 70 613 2658', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.email.label', '{"hu":"E-mail","en":"Email"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.email.value', 'info@gerecseingatlan.hu', 'text')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.hours.label', '{"hu":"Nyitvatartás","en":"Opening Hours"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.hours.weekdays', '{"hu":"Hétfő - Péntek: 9:00 - 17:00","en":"Monday - Friday: 9:00 AM - 5:00 PM"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.hours.saturday', '{"hu":"Szombat: 10:00 - 13:00","en":"Saturday: 10:00 AM - 1:00 PM"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.hours.sunday', '{"hu":"Vasárnap: Zárva","en":"Sunday: Closed"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.info.facebook.label', '{"hu":"Facebook oldalunk","en":"Visit us on Facebook"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.title', '{"hu":"Vegye fel velünk a kapcsolatot","en":"Get in touch with us"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.name.label', '{"hu":"Név","en":"Name"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.email.label', '{"hu":"E-mail","en":"Email"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.phone.label', '{"hu":"Telefon","en":"Phone"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.subject.label', '{"hu":"Tárgy","en":"Subject"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.message.label', '{"hu":"Üzenet","en":"Message"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.gdpr', '{"hu":"Elfogadom az adatkezelési tájékoztatót és hozzájárulok személyes adataim kezeléséhez. *","en":"I accept the privacy policy and consent to the processing of my personal data. *"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.submit', '{"hu":"Küldés","en":"Send"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.submitting', '{"hu":"Küldés...","en":"Sending..."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.success', '{"hu":"Üzenetét sikeresen elküldtük! Hamarosan felvesszük Önnel a kapcsolatot.","en":"Your message has been sent successfully! We will contact you shortly."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/kapcsolat', 'contact.form.errorPrefix', '{"hu":"Hiba történt az üzenet küldésekor: ","en":"Error sending message: "}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- ============================================
-- Newsletter section (homepage)
-- ============================================

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.title', '{"hu":"Iratkozzon fel hírlevelünkre!","en":"Subscribe to our newsletter!"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.subtitle', '{"hu":"Értesüljön elsőként az új ingatlanokról és akcióinkról","en":"Be the first to know about new properties and promotions"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.success', '{"hu":"Sikeresen feliratkozott!","en":"Successfully subscribed!"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.placeholder', '{"hu":"E-mail cím","en":"Email address"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.button', '{"hu":"Feliratkozás","en":"Subscribe"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.emailInvalid', '{"hu":"Kérjük, adjon meg érvényes e-mail címet","en":"Please enter a valid email address"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.gdpr', '{"hu":"Elfogadom az adatkezelési tájékoztatót","en":"I accept the privacy policy"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.gdprInvalid', '{"hu":"Az adatkezelési tájékoztató elfogadása kötelező","en":"Accepting the privacy policy is required"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.networkError', '{"hu":"Hálózati hiba történt. Kérjük, próbálja újra.","en":"A network error occurred. Please try again."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'newsletter.genericError', '{"hu":"Hiba történt. Kérjük, próbálja újra később.","en":"An error occurred. Please try again later."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- ============================================
-- ÁSZF page (/aszf)
-- ============================================

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'page.title', '{"hu":"Általános Szerződési Feltételek","en":"Terms and Conditions"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'page.subtitle', '{"hu":"(ÁSZF)","en":"(T&C)"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section1.title', '{"hu":"Általános rendelkezések","en":"General Provisions"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section1.p1', '{"hu":"Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a Gerecse Ingatlan Kft. (székhely: 2890 Tata, Példa utca 1.; cégjegyzékszám: 11-09-XXXXXX; adószám: XXXXXXXX-X-XX; a továbbiakban: Szolgáltató) által üzemeltetett gerecseingatlan.hu weboldal (a továbbiakban: Weboldal) használatának feltételeit szabályozzák.","en":"These Terms and Conditions (hereinafter: T&C) govern the use of the gerecseingatlan.hu website (hereinafter: Website) operated by Gerecse Ingatlan Kft. (registered office: 2890 Tata, Példa utca 1.; company registration no.: 11-09-XXXXXX; tax no.: XXXXXXXX-X-XX; hereinafter: Provider)."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section1.p2', '{"hu":"A Weboldal használatával Ön elfogadja a jelen ÁSZF-ben foglalt feltételeket.","en":"By using the Website, you accept the terms set out in these T&C."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section2.title', '{"hu":"A Szolgáltató tevékenysége","en":"Services Provided"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section2.p1', '{"hu":"A Szolgáltató ingatlanközvetítői tevékenységet végez a Gerecse régióban és Komárom-Esztergom megyében. Szolgáltatásai közé tartozik:","en":"The Provider offers real estate brokerage services in the Gerecse region and Komárom-Esztergom county. Services include:"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section2.item1', '{"hu":"Ingatlanok adásvételének közvetítése","en":"Mediation of property sales"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section2.item2', '{"hu":"Ingatlanok bérbeadásának közvetítése","en":"Mediation of property rentals"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section2.item3', '{"hu":"Ingatlan értékbecslés","en":"Property valuation"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section2.item4', '{"hu":"Jogi háttér biztosítása","en":"Legal support"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section2.item5', '{"hu":"Hiteltanácsadás","en":"Mortgage consulting"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section2.item6', '{"hu":"Home staging és belsőépítészet","en":"Home staging and interior design"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section3.title', '{"hu":"A Weboldal használata","en":"Use of the Website"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section3.p1', '{"hu":"A Weboldalon közzétett ingatlaninformációk tájékoztató jellegűek, és nem minősülnek szerződéses ajánlatnak. A Szolgáltató fenntartja a jogot a tartalom bármikori módosítására.","en":"Property information published on the Website is for informational purposes only and does not constitute a contractual offer. The Provider reserves the right to modify content at any time."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section3.p2', '{"hu":"A felhasználó köteles a Weboldalt rendeltetésszerűen, jogszerűen és jóhiszeműen használni.","en":"The user is obliged to use the Website properly, lawfully and in good faith."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section4.title', '{"hu":"Szellemi tulajdon","en":"Intellectual Property"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section4.p1', '{"hu":"A Weboldalon megjelenő szövegek, képek, logók, grafikai elemek és egyéb tartalmak a Szolgáltató szellemi tulajdonát képezik, vagy felhasználási joggal rendelkezik felettük. A tartalmak engedély nélküli másolása, felhasználása vagy terjesztése tilos és jogkövetkezményeket von maga után.","en":"Texts, images, logos, graphics and other content on the Website are the intellectual property of the Provider or used under licence. Copying, using or distributing content without permission is prohibited and subject to legal consequences."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section5.title', '{"hu":"Felelősség","en":"Liability"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section5.p1', '{"hu":"A Szolgáltató törekszik a Weboldalon közölt információk pontosságára, de nem vállal felelősséget az esetleges pontatlanságokért vagy elírásokért. Az ingatlanokkal kapcsolatos végleges adatokat a személyes egyeztetés során pontosítjuk.","en":"The Provider strives for accuracy of information on the Website but accepts no liability for potential inaccuracies or typographical errors. Final property details are confirmed during personal consultation."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section5.p2', '{"hu":"A Szolgáltató nem felelős a Weboldalról elérhető külső linkek tartalmáért.","en":"The Provider is not responsible for the content of external links accessible from the Website."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section6.title', '{"hu":"Adatkezelés","en":"Data Protection"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section6.p1', '{"hu":"A személyes adatok kezelésére vonatkozó részletes tájékoztatást az Adatkezelési tájékoztató tartalmazza.","en":"Detailed information on personal data processing can be found in our Privacy Policy."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section7.title', '{"hu":"Irányadó jog és jogviták","en":"Governing Law & Disputes"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section7.p1', '{"hu":"Jelen ÁSZF-re a magyar jog az irányadó. A felek vitáikat elsősorban egyeztetés útján kísérlik meg rendezni. Ennek eredménytelensége esetén a Tatabányai Törvényszék, illetve a Tatabányai Járásbíróság illetékességét kötik ki.","en":"These T&C are governed by Hungarian law. The parties shall first attempt to settle disputes through negotiation. Failing that, the courts of Tatabánya shall have exclusive jurisdiction."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section8.title', '{"hu":"ÁSZF módosítása","en":"Amendments"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section8.p1', '{"hu":"A Szolgáltató fenntartja a jogot a jelen ÁSZF egyoldalú módosítására. A módosított ÁSZF a Weboldalon történő közzététellel lép hatályba. A Weboldal további használata a módosítások elfogadásának minősül.","en":"The Provider reserves the right to unilaterally amend these T&C. Amended T&C take effect upon publication on the Website. Continued use of the Website constitutes acceptance of the amendments."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section9.title', '{"hu":"Kapcsolat","en":"Contact"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'section9.p1', '{"hu":"Kérdéseivel forduljon hozzánk bizalommal:","en":"If you have any questions, please contact us:"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/aszf', 'effectiveDate', '{"hu":"Hatályba lépés: 2026. április 16.","en":"Effective date: 16 April 2026"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- ============================================
-- Adatkezelési tájékoztató (/adatkezelesi-tajekoztato)
-- ============================================

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'page.title', '{"hu":"Adatkezelési tájékoztató","en":"Privacy Policy"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'page.subtitle', '{"hu":"Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) alapján","en":"In accordance with EU Regulation 2016/679 (GDPR)"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section1.title', '{"hu":"Adatkezelő","en":"Data Controller"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section1.p1', '{"hu":"Az adatkezelő a Gerecse Ingatlan Kft. (székhely: 2890 Tata, Példa utca 1.; adószám: XXXXXXXX-X-XX; e-mail: info@gerecseingatlan.hu; telefon: +36 70 613 2658).","en":"The data controller is Gerecse Ingatlan Kft. (registered office: 2890 Tata, Példa utca 1.; tax number: XXXXXXXX-X-XX; e-mail: info@gerecseingatlan.hu; phone: +36 70 613 2658)."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section2.title', '{"hu":"A tájékoztató hatálya","en":"Scope of This Policy"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section2.p1', '{"hu":"Jelen tájékoztató a gerecseingatlan.hu weboldalon és az ahhoz kapcsolódó szolgáltatások során végzett személyesadat-kezelésre terjed ki.","en":"This policy covers the processing of personal data on the gerecseingatlan.hu website and related services."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section3.title', '{"hu":"Kezelt adatok, jogalapok és célok","en":"Data Processed, Legal Bases & Purposes"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.title', '{"hu":"Az érintett jogai","en":"Data Subject Rights"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.p1', '{"hu":"A GDPR alapján Ön az alábbi jogokkal rendelkezik:","en":"Under the GDPR, you have the following rights:"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.right1', '{"hu":"Hozzáférési jog (GDPR 15. cikk)","en":"Right of access (Art. 15)"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.right2', '{"hu":"Helyesbítéshez való jog (GDPR 16. cikk)","en":"Right to rectification (Art. 16)"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.right3', '{"hu":"Törléshez való jog – „elfeledtetéshez való jog" (GDPR 17. cikk)","en":"Right to erasure – ''right to be forgotten'' (Art. 17)"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.right4', '{"hu":"Adatkezelés korlátozásához való jog (GDPR 18. cikk)","en":"Right to restriction of processing (Art. 18)"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.right5', '{"hu":"Adathordozhatósághoz való jog (GDPR 20. cikk)","en":"Right to data portability (Art. 20)"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.right6', '{"hu":"Tiltakozáshoz való jog (GDPR 21. cikk)","en":"Right to object (Art. 21)"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.right7', '{"hu":"Hozzájárulás visszavonásának joga – a visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét","en":"Right to withdraw consent – withdrawal does not affect the lawfulness of processing before withdrawal"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section4.p2', '{"hu":"Jogai gyakorlásához kérjük, írjon az info@gerecseingatlan.hu e-mail címre.","en":"To exercise your rights, please contact info@gerecseingatlan.hu."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section5.title', '{"hu":"Adattovábbítás","en":"Data Transfers"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section5.p1', '{"hu":"Személyes adatait harmadik országba nem továbbítjuk. Az adatfeldolgozók (pl. tárhelyszolgáltató, e-mail szolgáltató) az Európai Gazdasági Térségen belül működnek, vagy megfelelő garanciákat biztosítanak (GDPR 46. cikk).","en":"We do not transfer your personal data to third countries. Our data processors (e.g., hosting provider, e-mail service) operate within the European Economic Area or provide appropriate safeguards (Art. 46 GDPR)."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section6.title', '{"hu":"Adatbiztonság","en":"Data Security"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section6.p1', '{"hu":"Az adatkezelő megfelelő technikai és szervezési intézkedéseket alkalmaz az adatok védelme érdekében, beleértve a HTTPS titkosítást, tűzfalvédelmet és rendszeres biztonsági mentéseket.","en":"The data controller implements appropriate technical and organisational measures to protect data, including HTTPS encryption, firewall protection and regular backups."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section7.title', '{"hu":"Jogorvoslat","en":"Complaints & Legal Remedies"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section7.p1', '{"hu":"Panaszával fordulhat a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH):","en":"You may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH):"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section7.p2', '{"hu":"Továbbá bírósághoz is fordulhat az Infotv. 22. § alapján.","en":"You also have the right to seek judicial remedy under Hungarian law."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section8.title', '{"hu":"Sütik (cookie-k)","en":"Cookies"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'section8.p1', '{"hu":"A weboldalon használt sütikről részletes tájékoztatást a Cookie tájékoztatóban talál.","en":"For detailed information about cookies used on this website, please see our Cookie Policy."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/adatkezelesi-tajekoztato', 'lastUpdated', '{"hu":"Utolsó frissítés: 2026. április 16.","en":"Last updated: 16 April 2026"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- ============================================
-- Cookie tájékoztató (/cookie-tajekoztato)
-- ============================================

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'page.title', '{"hu":"Cookie (süti) tájékoztató","en":"Cookie Policy"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'page.subtitle', '{"hu":"Információk a weboldalunkon használt sütikről","en":"Information about the cookies used on our website"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'intro.title', '{"hu":"Mi az a süti (cookie)?","en":"What Are Cookies?"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'intro.p1', '{"hu":"A sütik (cookie-k) kis szöveges fájlok, amelyeket a weboldal az Ön böngészőjében tárol. Segítenek a weboldal működésében, a felhasználói élmény javításában és a látogatottsági statisztikák gyűjtésében.","en":"Cookies are small text files stored in your browser by the website. They help the website function, improve user experience, and collect visitor statistics."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'intro.p2', '{"hu":"A gerecseingatlan.hu weboldalon Ön szabadon dönthet arról, hogy mely sütiket engedélyezi. Az alapvető funkciókhoz szükséges sütik nélkül is működik a weboldal.","en":"On gerecseingatlan.hu you can freely decide which cookies to allow. The website functions without optional cookies."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'necessary.title', '{"hu":"Szükséges sütik","en":"Necessary Cookies"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'necessary.desc', '{"hu":"Ezek a sütik elengedhetetlenek a weboldal alapvető működéséhez. Nem gyűjtenek személyes adatokat, és nem kapcsolhatók ki.","en":"These cookies are essential for the basic functionality of the website. They do not collect personal data and cannot be disabled."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'analytics.title', '{"hu":"Analitikai sütik","en":"Analytics Cookies"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'analytics.desc', '{"hu":"Ezek a sütik segítenek megérteni, hogyan használják a látogatók a weboldalt. Az adatgyűjtés anonim. Csak az Ön hozzájárulásával aktiválódnak.","en":"These cookies help us understand how visitors use the website. Data collection is anonymous. They are activated only with your consent."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'marketing.title', '{"hu":"Marketing sütik","en":"Marketing Cookies"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'marketing.desc', '{"hu":"A marketing sütik segítenek releváns hirdetések megjelenítésében. Jelenleg weboldalunk nem használ marketing sütiket, de a jövőben bevezethetjük őket. Ilyen esetben csak az Ön kifejezett hozzájárulásával aktiváljuk.","en":"Marketing cookies help display relevant advertisements. Currently our website does not use marketing cookies, but we may introduce them in the future. In that case, they will only be activated with your explicit consent."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'managing.title', '{"hu":"Sütik kezelése","en":"Managing Cookies"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'managing.p1', '{"hu":"A sütibeállításokat bármikor módosíthatja a weboldal cookie-sávjának „Beállítások” gombjával, vagy a böngészője beállításaiban.","en":"You can change your cookie preferences at any time using the cookie banner''s \"Settings\" button, or in your browser settings."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'managing.p2', '{"hu":"A legtöbb böngészőben a következő módon törölheti vagy letilthatja a sütiket:","en":"In most browsers, you can delete or disable cookies as follows:"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'managing.p3', '{"hu":"A sütik letiltása befolyásolhatja egyes funkciók működését.","en":"Disabling cookies may affect the functionality of some features."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/cookie-tajekoztato', 'lastUpdated', '{"hu":"Utolsó frissítés: 2026. április 16.","en":"Last updated: 16 April 2026"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();
