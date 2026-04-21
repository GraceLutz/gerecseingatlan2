/**
 * Full content migration — seeds ALL hardcoded content into the CMS database.
 * Run once: npx tsx server/db/seeds/content-full-migration.ts
 */
import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function bi(hu: string, en: string): string {
  return JSON.stringify({ hu, en });
}

interface Block {
  pagePath: string;
  blockKey: string;
  content: string;
  contentType: string;
}

const blocks: Block[] = [];

// ═══════════════════════════════════════════════════════
// HOMEPAGE — hero, about, services section
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/", blockKey: "hero.title", content: bi("Gerecse Ingatlan", "Gerecse Ingatlan"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "hero.subtitle", content: bi("Professzionális ingatlanszolgáltatások a Gerecse régióban", "Professional real estate services in the Gerecse region"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "hero.cta", content: bi("Ingatlanok böngészése", "Browse Properties"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "about.title", content: bi("Rólunk", "About Us"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "about.subtitle", content: bi("Megbízható partner az ingatlanpiacon", "Your trusted partner in real estate"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "about.desc", content: bi("A Gerecse Ingatlan elkötelezett csapata több éves tapasztalattal segíti ügyfeleit az ingatlanpiacon. Legyen szó vásárlásról, eladásról vagy bérbeadásról, professzionális szolgáltatásainkkal biztosítjuk a sikeres ügyleteket.", "The dedicated team at Gerecse Ingatlan brings years of experience to help clients navigate the real estate market. Whether buying, selling, or renting, our professional services ensure successful transactions."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.title", content: bi("Szolgáltatásaink", "Our Services"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.subtitle", content: bi("Átfogó ingatlanszolgáltatások az Ön igényeire szabva", "Comprehensive real estate services tailored to your needs"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// CONTACT PAGE — info cards, form labels
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/kapcsolat", blockKey: "page.title", content: bi("Kapcsolat", "Contact"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "page.subtitle", content: bi("Vegye fel velünk a kapcsolatot", "Get in touch with us"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.phone.label", content: bi("Telefon", "Phone"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.phone.value", content: "+36 70 613 2658", contentType: "text" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.email.label", content: bi("E-mail", "Email"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.email.value", content: "info@gerecseingatlan.hu", contentType: "text" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.hours.label", content: bi("Nyitvatartás", "Opening Hours"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.hours.weekdays", content: bi("Hétfő - Péntek: 9:00 - 17:00", "Monday - Friday: 9:00 AM - 5:00 PM"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.hours.saturday", content: bi("Szombat: 10:00 - 13:00", "Saturday: 10:00 AM - 1:00 PM"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.hours.sunday", content: bi("Vasárnap: Zárva", "Sunday: Closed"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.title", content: bi("Vegye fel velünk a kapcsolatot", "Get in touch with us"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.name.label", content: bi("Név", "Name"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.email.label", content: bi("E-mail", "Email"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.phone.label", content: bi("Telefon", "Phone"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.subject.label", content: bi("Tárgy", "Subject"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.message.label", content: bi("Üzenet", "Message"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.gdpr", content: bi("Elfogadom az adatkezelési tájékoztatót és hozzájárulok személyes adataim kezeléséhez. *", "I accept the privacy policy and consent to the processing of my personal data. *"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.submit", content: bi("Küldés", "Send"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.success", content: bi("Üzenetét sikeresen elküldtük! Hamarosan felvesszük Önnel a kapcsolatot.", "Your message has been sent successfully! We will contact you shortly."), contentType: "json" });

// ═══════════════════════════════════════════════════════
// SERVICE PAGES — 7 services, each with paragraphs + benefits + CTA
// ═══════════════════════════════════════════════════════

const serviceData: Array<{
  slug: string;
  key: string;
  titleHu: string;
  titleEn: string;
  subtitleHu: string;
  subtitleEn: string;
  paragraphsHu: string[];
  paragraphsEn: string[];
  benefitsHu: string[];
  benefitsEn: string[];
  ctaLabelHu: string;
  ctaLabelEn: string;
}> = [
  {
    slug: "ingatlan-ertekesites-berbeadas",
    key: "sales",
    titleHu: "Ingatlan értékesítés és bérbeadás",
    titleEn: "Property Sales & Rentals",
    subtitleHu: "Lakossági és gazdasági ingatlanok értékesítése, bérbeadása",
    subtitleEn: "Residential and commercial property sales and rentals",
    paragraphsHu: [
      "Lakossági ingatlanok (lakások, házak, telkek) és gazdasági, ipari, mezőgazdasági ingatlanok értékesítésében és bérbeadásában nyújtunk segítséget.",
      "Az értékesítési folyamat minden lépésében támogatjuk: az ingatlan felmérésétől, az árazáson és hirdetésen át a szerződéskötésig.",
      "Bérbeadás esetén segítünk a megfelelő bérlő megtalálásában, a bérleti szerződés elkészítésében és a jogi háttér biztosításában.",
      "Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!",
    ],
    paragraphsEn: [
      "We help with the sale and rental of residential properties (apartments, houses, plots) as well as commercial, industrial, and agricultural properties.",
      "We support you at every step of the sales process: from property assessment, pricing, and advertising to contract signing.",
      "For rentals, we help find the right tenant, prepare the lease agreement, and ensure legal compliance.",
      "Contact us and let's find the best solution together!",
    ],
    benefitsHu: ["Ingyenes ingatlan értékelés", "Professzionális fotózás és hirdetés", "Teljes körű ügyintézés", "Szerződéskötés segítése"],
    benefitsEn: ["Free property evaluation", "Professional photography and advertising", "Full administrative support", "Contract assistance"],
    ctaLabelHu: "Érdeklődöm",
    ctaLabelEn: "I'm interested",
  },
  {
    slug: "ertekbecsles-ertekmeghatrozas",
    key: "appraisal",
    titleHu: "Értékbecslés és értékmeghatározás",
    titleEn: "Appraisal & Valuation",
    subtitleHu: "Hivatalos értékbecslés és piaci értékmeghatározás",
    subtitleEn: "Official appraisal and market valuation",
    paragraphsHu: [
      "Két szintű szolgáltatást kínálunk az Ön igényeinek megfelelően:",
      "Értékbecslés – a hivatalos, magasabb fokozat. Szükséges lehet banki hitelügyintézéshez, bírósági ügyekhez és jogi peres vitákhoz, hagyatéki eljáráshoz, válás esetén vagyonmegosztáshoz, valamint ingatlanértékesítés esetén.",
      "Értékmeghatározás – az egyszerűbb fokozat. Jellemzően akkor kérik, ha valaki el szeretné adni az ingatlanát és szeretné tudni annak piaci értékét.",
      "Tapasztalt, akkreditált szakértőkkel dolgozunk, akik pontos és megbízható értékelést készítenek.",
    ],
    paragraphsEn: [
      "We offer two levels of service to match your needs:",
      "Property Appraisal – the official, higher level. May be required for bank mortgage processing, court cases and legal disputes, inheritance proceedings, property division in divorce, and property sales.",
      "Value Determination – the simpler level. Typically requested when someone wants to sell their property and needs to know its market value.",
      "We work with experienced, accredited experts who provide accurate and reliable assessments.",
    ],
    benefitsHu: ["Hivatalos, akkreditált értékbecslők", "Hiteligényléshez elfogadott", "Piaci összehasonlító elemzés", "Gyors és pontos értékelés"],
    benefitsEn: ["Official, accredited appraisers", "Accepted for mortgage applications", "Market comparative analysis", "Fast and accurate valuation"],
    ctaLabelHu: "Értékbecslést kérek",
    ctaLabelEn: "Request appraisal",
  },
  {
    slug: "belsoepiteszet-latvanyterv",
    key: "interior",
    titleHu: "Belsőépítészet és látványterv",
    titleEn: "Interior Design & Visualization",
    subtitleHu: "3D látványtervezés és belsőépítészeti tanácsadás",
    subtitleEn: "3D visualization and interior design consulting",
    paragraphsHu: [
      "Belsőépítészeti tanácsadás és 3D látványtervezés – közvetített szolgáltatásként.",
      "A tényleges munkát tapasztalt alvállalkozó belsőépítész végzi, mi a közvetítést és koordinációt biztosítjuk.",
      "Segítünk megálmodni és megvalósítani az Ön ideális otthonát, referencia munkáinkkal és 3D tervezéssel mutatjuk be az elképzelt végeredményt.",
      "Kérjük, töltse ki az alábbi űrlapot, és felvesszük Önnel a kapcsolatot!",
    ],
    paragraphsEn: [
      "Interior design consulting and 3D visualization – provided as a brokered service.",
      "The actual work is carried out by an experienced subcontractor interior designer; we provide the brokering and coordination.",
      "We help you dream up and realize your ideal home, showcasing the envisioned result with our reference works and 3D design.",
      "Please fill out the form below and we will contact you!",
    ],
    benefitsHu: ["3D látványtervezés", "Teljes belsőépítészeti koncepció", "Referencia munkák bemutatása", "Közvetített szolgáltatás"],
    benefitsEn: ["3D visualization", "Complete interior design concept", "Reference work showcase", "Brokered service"],
    ctaLabelHu: "Ajánlatot kérek",
    ctaLabelEn: "Request a quote",
  },
  {
    slug: "teljeskoru-jogi-hatter",
    key: "legal",
    titleHu: "Teljeskörű jogi háttér",
    titleEn: "Full Legal Support",
    subtitleHu: "Ügyvédi közreműködés és jogi tanácsadás ingatlanügyletekhez",
    subtitleEn: "Legal assistance and consulting for real estate transactions",
    paragraphsHu: [
      "Teljeskörű jogi háttér biztosítása minden ingatlanügylethez.",
      "Ügyvédi közreműködés, szerződésírás, jogi tanácsadás, tulajdoni lap ellenőrzés és tehermentesítés segítése.",
      "Hagyatéki végzések, tulajdonjogi kérdések és egyéb jogi ügyletek intézésében is segítünk.",
      "Biztosítjuk, hogy minden tranzakció jogilag megalapozott és biztonságos legyen.",
    ],
    paragraphsEn: [
      "Full legal support for all real estate transactions.",
      "Legal assistance, contract drafting, legal consulting, title deed verification, and encumbrance removal.",
      "We also help with inheritance rulings, ownership issues, and other legal proceedings.",
      "We ensure that every transaction is legally sound and secure.",
    ],
    benefitsHu: ["Tapasztalt ingatlan ügyvédek", "Tulajdoni lap ellenőrzés", "Teljes jogi háttér biztosítása", "Hagyatéki ügyek intézése"],
    benefitsEn: ["Experienced real estate lawyers", "Title deed verification", "Complete legal support", "Inheritance proceedings"],
    ctaLabelHu: "Jogi tanácsadást kérek",
    ctaLabelEn: "Request legal advice",
  },
  {
    slug: "hitel-allami-tamogatasok",
    key: "loans",
    titleHu: "Hitel és állami támogatások",
    titleEn: "Loans & Government Subsidies",
    subtitleHu: "Bankfüggetlen hitelközvetítés és támogatás ügyintézés",
    subtitleEn: "Bank-independent loan brokering and subsidy processing",
    paragraphsHu: [
      "Segítünk ügyfeleinknek a banki hitelek és állami támogatások ügyintézésében, közvetítő szerepben.",
      "Lakáshitel, személyi kölcsön tájékoztatás és bankfüggetlen tanácsadás közvetítése.",
      "Állami támogatások (CSOK, Babaváró stb.) ügyintézésében segítségnyújtás.",
      "Fontos: A hiteligénylést a Gerecse Ingatlan nem intézi közvetlenül — a szolgáltatást közvetítjük.",
    ],
    paragraphsEn: [
      "We help our clients with bank loan and government subsidy applications in a brokering role.",
      "We provide information on housing loans, personal loans, and broker independent advisory services.",
      "Assistance with government subsidies (CSOK, Babaváró, etc.) application processes.",
      "Important: Gerecse Ingatlan does not process loan applications directly — we broker the service.",
    ],
    benefitsHu: ["Bankfüggetlen tanácsadás", "CSOK és Babaváró ügyintézés", "Személyre szabott hitelajánlatok", "Teljes ügyintézés"],
    benefitsEn: ["Bank-independent advice", "CSOK and Babaváró processing", "Personalized loan offers", "Full administrative support"],
    ctaLabelHu: "Hitelügyintézést kérek",
    ctaLabelEn: "Request loan assistance",
  },
  {
    slug: "energetikai-tanusitvany",
    key: "energy",
    titleHu: "Energetikai tanúsítvány",
    titleEn: "Energy Performance Certificate",
    subtitleHu: "Energetikai tanúsítvány készítése akkreditált szakértőkkel",
    subtitleEn: "Energy performance certificates by accredited specialists",
    paragraphsHu: [
      "Energetikai tanúsítvány készítése ingatlan adásvételhez, bérbeadáshoz és pályázatokhoz.",
      "A tanúsítvány az épület energiahatékonyságát minősíti, és jogszabály által előírt dokumentum az ingatlan értékesítésénél.",
      "Tapasztalt, akkreditált szakértőinkkel gyors és megbízható ügyintézést biztosítunk.",
      "Vegye fel velünk a kapcsolatot részletekért és árajánlatért!",
    ],
    paragraphsEn: [
      "Energy performance certificate for property sales, rentals, and grant applications.",
      "The certificate rates the energy efficiency of the building and is a legally required document when selling a property.",
      "With our experienced, accredited specialists we provide fast and reliable service.",
      "Contact us for details and a quote!",
    ],
    benefitsHu: ["Akkreditált szakértők", "Gyors ügyintézés", "Jogszabálynak megfelelő tanúsítvány", "Adásvételhez és bérbeadáshoz egyaránt"],
    benefitsEn: ["Accredited specialists", "Fast processing", "Legally compliant certificate", "For both sales and rentals"],
    ctaLabelHu: "Tanúsítványt kérek",
    ctaLabelEn: "Request certificate",
  },
  {
    slug: "villamos-biztonsagi-felulvizsgalat",
    key: "electrical",
    titleHu: "Villamos biztonsági felülvizsgálat",
    titleEn: "Electrical Safety Inspection",
    subtitleHu: "VBF ingatlanokhoz, üzlethelyiségekhez és ipari létesítményekhez",
    subtitleEn: "VBF for residential, commercial, and industrial properties",
    paragraphsHu: [
      "Villamos Biztonsági Felülvizsgálat (VBF) ingatlanokhoz, üzlethelyiségekhez és ipari létesítményekhez.",
      "A felülvizsgálat célja az elektromos hálózat biztonságos állapotának ellenőrzése és a jogszabályi előírások teljesítése.",
      "Szakképzett villamos biztonságtechnikai felülvizsgálókkal dolgozunk, akik hivatalos jegyzőkönyvet állítanak ki.",
      "Kérjen árajánlatot a részletekért és az időpont egyeztetésért!",
    ],
    paragraphsEn: [
      "Electrical Safety Inspection (VBF) for residential, commercial, and industrial properties.",
      "The inspection verifies the safe condition of the electrical network and compliance with legal requirements.",
      "We work with certified electrical safety inspectors who issue an official report.",
      "Request a quote for details and to schedule an appointment!",
    ],
    benefitsHu: ["Szakképzett felülvizsgálók", "Hivatalos jegyzőkönyv", "Lakó- és ipari ingatlanokhoz", "Jogszabályi megfelelőség"],
    benefitsEn: ["Certified inspectors", "Official report", "For residential and industrial properties", "Legal compliance"],
    ctaLabelHu: "Árajánlatot kérek",
    ctaLabelEn: "Request a quote",
  },
];

for (const svc of serviceData) {
  const pagePath = `/${svc.slug}`;
  blocks.push({ pagePath, blockKey: "service.title", content: bi(svc.titleHu, svc.titleEn), contentType: "json" });
  blocks.push({ pagePath, blockKey: "service.subtitle", content: bi(svc.subtitleHu, svc.subtitleEn), contentType: "json" });

  // Paragraphs as a JSON array
  blocks.push({
    pagePath,
    blockKey: "service.paragraphs",
    content: JSON.stringify({ hu: svc.paragraphsHu, en: svc.paragraphsEn }),
    contentType: "json",
  });

  // Benefits as a JSON array
  blocks.push({
    pagePath,
    blockKey: "service.benefits",
    content: JSON.stringify({ hu: svc.benefitsHu, en: svc.benefitsEn }),
    contentType: "json",
  });

  blocks.push({ pagePath, blockKey: "service.cta.label", content: bi(svc.ctaLabelHu, svc.ctaLabelEn), contentType: "json" });
}

// ═══════════════════════════════════════════════════════
// FAQ — 10 Q&A pairs
// ═══════════════════════════════════════════════════════

const faqItems: Array<{ qHu: string; qEn: string; aHu: string; aEn: string }> = [
  { qHu: "Hogyan adhatok el az ingatlanom a Gerecse Ingatlan segítségével?", qEn: "How can I sell my property with Gerecse Ingatlan?", aHu: "Vegye fel velünk a kapcsolatot telefonon vagy az űrlapunkon keresztül. Munkatársunk felméri az ingatlant, elkészíti az értékbecslést, majd professzionális fotókkal és leírással hirdetjük meg az ingatlant. A teljes értékesítési folyamatot végigkísérjük.", aEn: "Contact us by phone or through our form. Our colleague will assess the property, prepare a valuation, then advertise it with professional photos and descriptions. We guide you through the entire sales process." },
  { qHu: "Mennyi ideig tart egy ingatlan eladása?", qEn: "How long does it take to sell a property?", aHu: "Az eladási idő függ az ingatlan típusától, állapotától, elhelyezkedésétől és az árától. Átlagosan 2-6 hónap között mozog, de a megfelelő árazással és marketinggel ez jelentősen lerövidíthető.", aEn: "Sales time depends on the property type, condition, location, and price. On average it takes 2-6 months, but with proper pricing and marketing this can be significantly shortened." },
  { qHu: "Milyen költségekkel kell számolnom eladáskor?", qEn: "What costs should I expect when selling?", aHu: "Az eladónak általában az ingatlanközvetítői jutalékkal, az ügyvédi díjjal és az esetleges energetikai tanúsítvány költségével kell számolnia. Pontos tájékoztatást személyes konzultáció során adunk.", aEn: "Sellers typically need to account for real estate agent commission, legal fees, and potential energy certificate costs. We provide detailed information during a personal consultation." },
  { qHu: "Segítenek-e a hiteligénylésben?", qEn: "Do you help with mortgage applications?", aHu: "Igen, közvetítői szolgáltatásként segítünk a hitel- és állami támogatások (CSOK, Babaváró stb.) ügyintézésében. Bankfüggetlen tanácsadóinkkal a legjobb ajánlatot keressük meg Önnek.", aEn: "Yes, as an intermediary service we help with mortgage and government subsidy applications (CSOK, Babaváró, etc.). Our independent advisors find the best offer for you." },
  { qHu: "Mi az a home staging és miért érdemes igénybe venni?", qEn: "What is home staging and why should I use it?", aHu: "A home staging az ingatlan felkészítése az eladásra: bútorozás, dekoráció, világítás optimalizálása. Egy jól felkészített ingatlan gyorsabban és magasabb áron kelhet el. Igény esetén biztosítjuk ezt a szolgáltatást.", aEn: "Home staging is preparing a property for sale: furnishing, decoration, lighting optimization. A well-prepared property sells faster and at a higher price. We provide this service on demand." },
  { qHu: "Vállalnak-e ingatlan értékbecslést?", qEn: "Do you offer property valuation?", aHu: "Igen, közvetítjük az értékbecslési szolgáltatást szakemberekhez. Az értékbecslés fontos az eladási ár meghatározásánál, hitelkérelemnél vagy örökösödési ügyben.", aEn: "Yes, we broker property valuation services to certified experts. Valuation is important for setting the sale price, mortgage applications, or inheritance matters." },
  { qHu: "Milyen típusú ingatlanokat közvetítenek?", qEn: "What types of properties do you handle?", aHu: "Családi házak, lakások (tégla és panel), ikerházak, sorházak, nyaralók, építési telkek és ipari ingatlanok (csarnokok, raktárak, irodák) egyaránt szerepelnek kínálatunkban.", aEn: "Family houses, apartments (brick and panel), semi-detached houses, row houses, holiday homes, building plots, and industrial properties (halls, warehouses, offices) are all in our portfolio." },
  { qHu: "Tudnak-e segíteni jogi kérdésekben?", qEn: "Can you help with legal matters?", aHu: "Igen, biztosítjuk az ügyvédi közreműködést az ingatlanügyletekhez: szerződésírás, tulajdoni lap ellenőrzés, tehermentesítés és jogi tanácsadás.", aEn: "Yes, we provide legal support for real estate transactions: contract writing, title deed verification, encumbrance removal, and legal consultation." },
  { qHu: "Hogyan működik a CSOK PLUSZ támogatás?", qEn: "How does the CSOK PLUS subsidy work?", aHu: "A CSOK PLUSZ egy állami támogatási forma, amely kedvezményes hitelt biztosít családok számára lakásvásárláshoz. Munkatársaink segítenek eligazodni a feltételekben és az igénylési folyamatban.", aEn: "CSOK PLUS is a government support program that provides preferential loans for families to purchase homes. Our colleagues help you navigate the requirements and application process." },
  { qHu: "Külföldi vásárlóként is igénybe vehetem a szolgáltatásaikat?", qEn: "Can I use your services as a foreign buyer?", aHu: "Természetesen! Weboldalunk angol nyelven is elérhető, és munkatársaink angol nyelven is segítséget nyújtanak az ingatlanvásárlás teljes folyamatában.", aEn: "Of course! Our website is available in English, and our colleagues provide assistance in English throughout the entire property purchasing process." },
];

// Store FAQ as a single JSON array block
blocks.push({
  pagePath: "/gyik",
  blockKey: "faq.items",
  content: JSON.stringify({
    hu: faqItems.map((f) => ({ q: f.qHu, a: f.aHu })),
    en: faqItems.map((f) => ({ q: f.qEn, a: f.aEn })),
  }),
  contentType: "json",
});

// ═══════════════════════════════════════════════════════
// TESTIMONIALS — 4 items
// ═══════════════════════════════════════════════════════

const testimonials = [
  { nameHu: "Kovács János", nameEn: "János Kovács", roleHu: "Eladó", roleEn: "Seller", textHu: "El sem tudom mondani, mekkora segítség volt a csapat! Az ingatlanom hónapokig nem mozdult, amíg egyedül hirdettem, ők pedig két hét alatt eladták – ráadásul jobb áron, mint amire számítottam.", textEn: "I can't express how much the team helped! My property wasn't moving for months while I was advertising alone, but they sold it in two weeks – at a better price than I expected.", rating: 5 },
  { nameHu: "Nagy András", nameEn: "András Nagy", roleHu: "Vásárló", roleEn: "Buyer", textHu: "Nagyon örülök, hogy rájuk találtam! Segítettek hitelt intézni, eligazítottak a támogatások között, és végül megvettük álmaink otthonát. Végig ott voltak, minden kérdésemre válaszoltak.", textEn: "I'm so glad I found them! They helped arrange the mortgage, guided me through the subsidies, and we finally bought our dream home. They were there every step of the way.", rating: 5 },
  { nameHu: "Laurinyecz Éva", nameEn: "Éva Laurinyecz", roleHu: "Eladó", roleEn: "Seller", textHu: "Az egész folyamat stresszmentes volt, ami nálam nagy szó! Nem csak az ingatlan eladását bíztam rájuk, hanem az értékbecslést, fotózást, hirdetést is. Precízen, pontosan dolgoznak.", textEn: "The entire process was stress-free, which is a big deal for me! I entrusted them not just with selling the property, but also with the appraisal, photography, and advertising. They work precisely and accurately.", rating: 5 },
  { nameHu: "Szabó Beáta", nameEn: "Beáta Szabó", roleHu: "Vásárló", roleEn: "Buyer", textHu: "Ami nekem napokig tartott volna, nekik pár óra volt. Olyan lakásokat mutattak, amik valóban passzoltak hozzánk – nem futottunk felesleges köröket. Megbízhatóak, őszinték, és tényleg segíteni akarnak.", textEn: "What would have taken me days, took them just a few hours. They showed apartments that truly matched our needs – no wasted time. Reliable, honest, and they genuinely want to help.", rating: 5 },
];

blocks.push({
  pagePath: "/velemenyek",
  blockKey: "testimonials.items",
  content: JSON.stringify({
    hu: testimonials.map((t) => ({ name: t.nameHu, role: t.roleHu, text: t.textHu, rating: t.rating })),
    en: testimonials.map((t) => ({ name: t.nameEn, role: t.roleEn, text: t.textEn, rating: t.rating })),
  }),
  contentType: "json",
});

// ═══════════════════════════════════════════════════════
// INTRODUCTION PAGE — motto, values, notRightFit
// ═══════════════════════════════════════════════════════

blocks.push({
  pagePath: "/bemutatkozas",
  blockKey: "intro.motto",
  content: bi("Az a jó üzlet, amikor mindenki elégedett!", "A good deal is when everyone is satisfied!"),
  contentType: "json",
});

blocks.push({
  pagePath: "/bemutatkozas",
  blockKey: "intro.values",
  content: JSON.stringify({
    hu: ["Megbízhatóság", "Szakértelem", "Gondoskodás", "Átláthatóság"],
    en: ["Reliability", "Expertise", "Care", "Transparency"],
  }),
  contentType: "json",
});

blocks.push({
  pagePath: "/bemutatkozas",
  blockKey: "intro.notRightFit.title",
  content: bi("Nem mi vagyunk a jó választás, ha...", "We're not the right fit if..."),
  contentType: "json",
});

blocks.push({
  pagePath: "/bemutatkozas",
  blockKey: "intro.notRightFit.items",
  content: JSON.stringify({
    hu: [
      "Egy napon belül el akarja adni az ingatlanát",
      "Ingyenes szolgáltatást keres",
      "Nem érdekli a részletek megbeszélése",
      "Nem bízik a szakemberekben",
      "Irreális elképzelése van az ingatlan áráról",
      "Nem kíván együttműködni a közvetítővel",
    ],
    en: [
      "You want to sell your property within a day",
      "You're looking for a free service",
      "You're not interested in discussing details",
      "You don't trust professionals",
      "You have unrealistic expectations about your property's price",
      "You're not willing to cooperate with the agent",
    ],
  }),
  contentType: "json",
});

// ═══════════════════════════════════════════════════════
// RUN MIGRATION
// ═══════════════════════════════════════════════════════

async function run() {
  console.log(`Migrating ${blocks.length} content blocks...`);

  for (const b of blocks) {
    await pool.query(
      `INSERT INTO content_blocks (page_path, block_key, content, content_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (page_path, block_key) DO UPDATE SET content = $3, content_type = $4, updated_at = NOW()`,
      [b.pagePath, b.blockKey, b.content, b.contentType]
    );
  }

  const total = await pool.query("SELECT count(*) FROM content_blocks");
  console.log(`Done. Total blocks in DB: ${total.rows[0].count}`);
  await pool.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
