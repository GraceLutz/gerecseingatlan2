-- Rename "Villamos biztonsági felülvizsgálat" → "Érintésvédelmi felülvizsgálat" and update content

-- Service page title
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/villamos-biztonsagi-felulvizsgalat', 'service.title', '{"hu":"Érintésvédelmi felülvizsgálat","en":"Touch Protection Inspection"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- Service page subtitle
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/villamos-biztonsagi-felulvizsgalat', 'service.subtitle', '{"hu":"Érintésvédelmi felülvizsgálat ingatlanokhoz, üzlethelyiségekhez és ipari létesítményekhez","en":"Touch protection inspection for residential, commercial, and industrial properties"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- Paragraphs (expanded detailed content)
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/villamos-biztonsagi-felulvizsgalat', 'service.paragraphs', '{"hu":["Sokan nincsenek tisztában vele, de ingatlan eladásakor vagy bérbeadásakor a villamos biztonsági felülvizsgálat – VBF – nem választható, hanem kötelező. A kötelezettség alapja a 40/2017. (XII. 4.) NGM rendelet, amely egyértelműen szabályozza, milyen esetekben kell VBF jegyzőkönyvvel rendelkezni.","Az időszakos felülvizsgálat elmaradhat, ha a hálózat fázisonként 32 A-nál kisebb névleges áramú túláramvédelemmel rendelkezik, és minden áramkört 30 mA-nél kisebb érzékenységű áram-védőkapcsoló (FI-relé) véd. Ez azonban csak az időszakos vizsgálatra vonatkozik! Eladáskor vagy bérbeadáskor a VBF akkor is kötelező, ha a fenti két műszaki feltétel teljesül. A kivétel csak akkor érvényes, ha már van 6 évnél nem régebbi, érvényes VBF jegyzőkönyv az ingatlanról.","Ez azt jelenti, hogy frissen felújított vagy jó állapotúnak tűnő lakás esetén is kötelező lehet a felülvizsgálat – különösen, ha nincs hivatalos dokumentáció a meglévő hálózatról.","Miért fontos ez, ha eladó vagy bérbeadó vagy? Jogszabályi megfelelés biztosítása, a saját jogi védelmed – ha baj történik és nincs jegyzőkönyv, téged terhelhet a felelősség. A vevő vagy bérlő szemében bizalmat ébreszt, tisztán látható az elektromos hálózat valódi állapota, és egy jól dokumentált ingatlan értékesebb és gyorsabban eladható.","Mit tartalmaz egy VBF? Műszeres vizsgálat és szemrevételezés, hivatalos jegyzőkönyv a hatályos előírások alapján, valamint a hibák és hiányosságok feltárása.","Ha ingatlan eladását vagy bérbeadását tervezed, érdemes időben elvégeztetni a felülvizsgálatot, hogy ne az utolsó pillanatban derüljön ki a hiányzó dokumentáció! Ingatlan eladás és bérbeadás esetén mi ebben is segítséget nyújtunk! Keress bizalommal: +36 70 613 2658"],"en":["Many people are unaware that when selling or renting out a property, the electrical safety inspection — VBF — is not optional but mandatory. The obligation is based on NGM Decree 40/2017 (XII. 4.), which clearly regulates in which cases a VBF report is required.","The periodic inspection may be waived if the network has overcurrent protection below 32A per phase and every circuit is protected by a residual current device (RCD) below 30mA. However, this only applies to periodic inspections! When selling or renting, the VBF is mandatory even if these two technical conditions are met. The exception only applies if there is already a valid VBF report less than 6 years old for the property.","This means that even a recently renovated or apparently well-maintained property may require inspection — especially if there is no official documentation of the existing electrical network.","Why does this matter if you are selling or renting out? It ensures legal compliance, protects you legally — if something goes wrong and there is no report, you may be held liable. It builds trust with buyers or tenants, provides a clear picture of the actual condition of the electrical network, and a well-documented property is more valuable and sells faster.","What does a VBF include? Instrumental testing and visual inspection, an official report based on current regulations, and identification of faults and deficiencies.","If you are planning to sell or rent out a property, it is worth arranging the inspection in advance so that missing documentation does not become an issue at the last moment. We can help with this too! Contact us: +36 70 613 2658"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- Benefits (expanded with 7 items including workplace rule)
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/villamos-biztonsagi-felulvizsgalat', 'service.benefits', '{"hu":["Tulajdonosváltás (adásvétel) esetén kötelező","Bérbeadáskor kötelező","Első használatbavételkor szükséges (újonnan létesített hálózat)","Felújítás, átalakítás, javítás vagy bővítés után előírt","Rendkívüli esemény után elvégzendő (beázás, tűzeset, zárlat)","Lakóingatlan esetén 6 évente időszakos vizsgálat szükséges","Munkahelyként is szolgáló ingatlan esetén 3 évente kötelező"],"en":["Mandatory on change of ownership (sale)","Required when renting out","Required on first use of newly installed networks","Required after renovation, modification, repair or extension","Required after extraordinary events (flooding, fire, short circuit)","Periodic inspection every 6 years for residential properties","Every 3 years if the property also serves as a workplace"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- Homepage service card title
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'services.electricalTitle', '{"hu":"Érintésvédelmi felülvizsgálat","en":"Touch Protection Inspection"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- Homepage service card description
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/', 'services.electricalDesc', '{"hu":"Érintésvédelmi felülvizsgálat lakó-, üzlet- és ipari ingatlanokhoz hivatalos jegyzőkönyvvel.","en":"Touch protection inspection for residential, commercial, and industrial properties with official reports."}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

-- Footer service link
INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/footer', 'links.electrical', '{"hu":"Érintésvédelmi felülvizsgálat","en":"Touch Protection Inspection"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();
