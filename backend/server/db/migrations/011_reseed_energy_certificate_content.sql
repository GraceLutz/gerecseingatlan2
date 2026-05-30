-- Re-seed /energetikai-tanusitvany content blocks with proper bilingual content
-- Fixes: page showing English content when visited in Hungarian

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.title', '{"hu":"Energetikai tanúsítvány","en":"Energy Performance Certificate"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.subtitle', '{"hu":"Energetikai tanúsítvány készítése akkreditált szakértőkkel","en":"Energy performance certificates by accredited specialists"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.paragraphs', '{"hu":["Energetikai tanúsítvány készítése ingatlan adásvételhez, bérbeadáshoz és pályázatokhoz.","A tanúsítvány az épület energiahatékonyságát minősíti, és jogszabály által előírt dokumentum az ingatlan értékesítésénél.","Tapasztalt, akkreditált szakértőinkkel gyors és megbízható ügyintézést biztosítunk.","Vegye fel velünk a kapcsolatot részletekért és árajánlatért!"],"en":["Energy performance certificate for property sales, rentals, and grant applications.","The certificate rates the energy efficiency of the building and is a legally required document when selling a property.","With our experienced, accredited specialists we provide fast and reliable service.","Contact us for details and a quote!"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.benefits', '{"hu":["Akkreditált szakértők","Gyors ügyintézés","Jogszabálynak megfelelő tanúsítvány","Adásvételhez és bérbeadáshoz egyaránt"],"en":["Accredited specialists","Fast processing","Legally compliant certificate","For both sales and rentals"]}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.benefits.title', '{"hu":"Előnyeink","en":"Our Benefits"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.cta.text', '{"hu":"Érdekli szolgáltatásunk? Kérjen tanúsítványt!","en":"Interested in our service? Request a certificate!"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.cta.label', '{"hu":"Tanúsítványt kérek","en":"Request certificate"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.cta.url', '{"hu":"/kapcsolat","en":"/en/contact"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.otherServices', '{"hu":"További szolgáltatásaink","en":"Our Other Services"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();

INSERT INTO content_blocks (page_path, block_key, content, content_type)
  VALUES ('/energetikai-tanusitvany', 'service.moreLink', '{"hu":"Részletek","en":"More"}', 'json')
  ON CONFLICT (page_path, block_key) DO UPDATE SET content = EXCLUDED.content, content_type = EXCLUDED.content_type, updated_at = NOW();
