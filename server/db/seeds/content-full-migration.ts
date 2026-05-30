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
blocks.push({ pagePath: "/", blockKey: "about.desc", content: bi("A Gerecse Ingatlan több mint egy évtizede segíti ügyfeleit otthonuk megtalálásában. Családias, személyes hozzáállásunkkal biztosítjuk, hogy minden ügyfelünk megtalálja számára tökéletes ingatlant.", "Gerecse Ingatlan has been helping clients find their homes for over a decade. With our family-like, personal approach, we ensure that every client finds their perfect property."), contentType: "json" });
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
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.hours.label", content: bi("Elérhetőség", "Availability"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.hours.weekdays", content: bi("9–19, hétfő–szombat", "9 AM – 7 PM, Monday–Saturday"), contentType: "json" });
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
  benefitsTitleHu: string;
  benefitsTitleEn: string;
  ctaTextHu: string;
  ctaTextEn: string;
  ctaLabelHu: string;
  ctaLabelEn: string;
  ctaUrlHu: string;
  ctaUrlEn: string;
  otherServicesTitleHu: string;
  otherServicesTitleEn: string;
}> = [
  {
    slug: "ingatlan-ertekesites",
    key: "sales",
    titleHu: "Ingatlan értékesítés",
    titleEn: "Property Sales",
    subtitleHu: "Lakossági és gazdasági ingatlanok értékesítése",
    subtitleEn: "Residential and commercial property sales",
    paragraphsHu: [
      "Lakossági ingatlanok (lakások, házak, telkek) és gazdasági, ipari, mezőgazdasági ingatlanok értékesítésében nyújtunk segítséget.",
      "Az értékesítési folyamat minden lépésében támogatjuk: az ingatlan felmérésétől, az árazáson és hirdetésen át a szerződéskötésig.",
      "Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!",
    ],
    paragraphsEn: [
      "We help with the sale of residential properties (apartments, houses, plots) as well as commercial, industrial, and agricultural properties.",
      "We support you at every step of the sales process: from property assessment, pricing, and advertising to contract signing.",
      "Contact us and let's find the best solution together!",
    ],
    benefitsHu: ["Ingyenes ingatlan értékelés", "Professzionális fotózás és hirdetés", "Teljes körű ügyintézés", "Szerződéskötés segítése"],
    benefitsEn: ["Free property evaluation", "Professional photography and advertising", "Full administrative support", "Contract assistance"],
    benefitsTitleHu: "Előnyeink",
    benefitsTitleEn: "Our Benefits",
    ctaTextHu: "Érdekli szolgáltatásunk? Vegye fel velünk a kapcsolatot!",
    ctaTextEn: "Interested in our service? Get in touch with us!",
    ctaLabelHu: "Érdeklődöm",
    ctaLabelEn: "I'm interested",
    ctaUrlHu: "/kapcsolat",
    ctaUrlEn: "/en/contact",
    otherServicesTitleHu: "További szolgáltatásaink",
    otherServicesTitleEn: "Our Other Services",
  },
  {
    slug: "ingatlan-berbeadas",
    key: "rental",
    titleHu: "Ingatlan bérbeadás",
    titleEn: "Property Letting",
    subtitleHu: "Lakossági és gazdasági ingatlanok bérbeadása",
    subtitleEn: "Residential and commercial property letting and rentals",
    paragraphsHu: [
      "Lakossági ingatlanok (lakások, házak) és gazdasági, ipari ingatlanok bérbeadásában nyújtunk segítséget.",
      "Segítünk a megfelelő bérlő megtalálásában, a bérleti szerződés elkészítésében és a jogi háttér biztosításában.",
      "Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!",
    ],
    paragraphsEn: [
      "We help with the letting of residential properties (apartments, houses) as well as commercial and industrial properties.",
      "We help find the right tenant, prepare the lease agreement, and ensure legal compliance.",
      "Contact us and let's find the best solution together!",
    ],
    benefitsHu: ["Bérlő kiválasztás", "Bérleti szerződés készítés", "Jogi háttér biztosítás", "Teljes körű ügyintézés"],
    benefitsEn: ["Tenant selection", "Lease agreement preparation", "Legal compliance", "Full administrative support"],
    benefitsTitleHu: "Előnyeink",
    benefitsTitleEn: "Our Benefits",
    ctaTextHu: "Érdekli szolgáltatásunk? Vegye fel velünk a kapcsolatot!",
    ctaTextEn: "Interested in our service? Get in touch with us!",
    ctaLabelHu: "Érdeklődöm",
    ctaLabelEn: "I'm interested",
    ctaUrlHu: "/kapcsolat",
    ctaUrlEn: "/en/contact",
    otherServicesTitleHu: "További szolgáltatásaink",
    otherServicesTitleEn: "Our Other Services",
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
    benefitsTitleHu: "Előnyeink",
    benefitsTitleEn: "Our Benefits",
    ctaTextHu: "Érdekli szolgáltatásunk? Kérjen értékbecslést most!",
    ctaTextEn: "Interested in our service? Request an appraisal now!",
    ctaLabelHu: "Értékbecslést kérek",
    ctaLabelEn: "Request appraisal",
    ctaUrlHu: "/kapcsolat",
    ctaUrlEn: "/en/contact",
    otherServicesTitleHu: "További szolgáltatásaink",
    otherServicesTitleEn: "Our Other Services",
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
    benefitsTitleHu: "Előnyeink",
    benefitsTitleEn: "Our Benefits",
    ctaTextHu: "Érdekli szolgáltatásunk? Kérjen ajánlatot!",
    ctaTextEn: "Interested in our service? Request a quote!",
    ctaLabelHu: "Ajánlatot kérek",
    ctaLabelEn: "Request a quote",
    ctaUrlHu: "/kapcsolat",
    ctaUrlEn: "/en/contact",
    otherServicesTitleHu: "További szolgáltatásaink",
    otherServicesTitleEn: "Our Other Services",
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
    benefitsTitleHu: "Előnyeink",
    benefitsTitleEn: "Our Benefits",
    ctaTextHu: "Érdekli szolgáltatásunk? Kérjen jogi tanácsadást!",
    ctaTextEn: "Interested in our service? Request legal advice!",
    ctaLabelHu: "Jogi tanácsadást kérek",
    ctaLabelEn: "Request legal advice",
    ctaUrlHu: "/kapcsolat",
    ctaUrlEn: "/en/contact",
    otherServicesTitleHu: "További szolgáltatásaink",
    otherServicesTitleEn: "Our Other Services",
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
    benefitsTitleHu: "Előnyeink",
    benefitsTitleEn: "Our Benefits",
    ctaTextHu: "Érdekli szolgáltatásunk? Kérjen hitelügyintézést!",
    ctaTextEn: "Interested in our service? Request loan assistance!",
    ctaLabelHu: "Hitelügyintézést kérek",
    ctaLabelEn: "Request loan assistance",
    ctaUrlHu: "/kapcsolat",
    ctaUrlEn: "/en/contact",
    otherServicesTitleHu: "További szolgáltatásaink",
    otherServicesTitleEn: "Our Other Services",
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
    benefitsTitleHu: "Előnyeink",
    benefitsTitleEn: "Our Benefits",
    ctaTextHu: "Érdekli szolgáltatásunk? Kérjen tanúsítványt!",
    ctaTextEn: "Interested in our service? Request a certificate!",
    ctaLabelHu: "Tanúsítványt kérek",
    ctaLabelEn: "Request certificate",
    ctaUrlHu: "/kapcsolat",
    ctaUrlEn: "/en/contact",
    otherServicesTitleHu: "További szolgáltatásaink",
    otherServicesTitleEn: "Our Other Services",
  },
  {
    slug: "villamos-biztonsagi-felulvizsgalat",
    key: "electrical",
    titleHu: "Érintésvédelmi felülvizsgálat",
    titleEn: "Touch Protection Inspection",
    subtitleHu: "Érintésvédelmi felülvizsgálat ingatlanokhoz, üzlethelyiségekhez és ipari létesítményekhez",
    subtitleEn: "Touch protection inspection for residential, commercial, and industrial properties",
    paragraphsHu: [
      "Sokan nincsenek tisztában vele, de ingatlan eladásakor vagy bérbeadásakor a villamos biztonsági felülvizsgálat – VBF – nem választható, hanem kötelező. A kötelezettség alapja a 40/2017. (XII. 4.) NGM rendelet, amely egyértelműen szabályozza, milyen esetekben kell VBF jegyzőkönyvvel rendelkezni.",
      "Az időszakos felülvizsgálat elmaradhat, ha a hálózat fázisonként 32 A-nál kisebb névleges áramú túláramvédelemmel rendelkezik, és minden áramkört 30 mA-nél kisebb érzékenységű áram-védőkapcsoló (FI-relé) véd. Ez azonban csak az időszakos vizsgálatra vonatkozik! Eladáskor vagy bérbeadáskor a VBF akkor is kötelező, ha a fenti két műszaki feltétel teljesül. A kivétel csak akkor érvényes, ha már van 6 évnél nem régebbi, érvényes VBF jegyzőkönyv az ingatlanról.",
      "Ez azt jelenti, hogy frissen felújított vagy jó állapotúnak tűnő lakás esetén is kötelező lehet a felülvizsgálat – különösen, ha nincs hivatalos dokumentáció a meglévő hálózatról.",
      "Miért fontos ez, ha eladó vagy bérbeadó vagy? Jogszabályi megfelelés biztosítása, a saját jogi védelmed – ha baj történik és nincs jegyzőkönyv, téged terhelhet a felelősség. A vevő vagy bérlő szemében bizalmat ébreszt, tisztán látható az elektromos hálózat valódi állapota, és egy jól dokumentált ingatlan értékesebb és gyorsabban eladható.",
      "Mit tartalmaz egy VBF? Műszeres vizsgálat és szemrevételezés, hivatalos jegyzőkönyv a hatályos előírások alapján, valamint a hibák és hiányosságok feltárása.",
      "Ha ingatlan eladását vagy bérbeadását tervezed, érdemes időben elvégeztetni a felülvizsgálatot, hogy ne az utolsó pillanatban derüljön ki a hiányzó dokumentáció! Ingatlan eladás és bérbeadás esetén mi ebben is segítséget nyújtunk! Keress bizalommal: +36 70 613 2658",
    ],
    paragraphsEn: [
      "Many people are unaware that when selling or renting out a property, the electrical safety inspection — VBF — is not optional but mandatory. The obligation is based on NGM Decree 40/2017 (XII. 4.), which clearly regulates in which cases a VBF report is required.",
      "The periodic inspection may be waived if the network has overcurrent protection below 32A per phase and every circuit is protected by a residual current device (RCD) below 30mA. However, this only applies to periodic inspections! When selling or renting, the VBF is mandatory even if these two technical conditions are met. The exception only applies if there is already a valid VBF report less than 6 years old for the property.",
      "This means that even a recently renovated or apparently well-maintained property may require inspection — especially if there is no official documentation of the existing electrical network.",
      "Why does this matter if you are selling or renting out? It ensures legal compliance, protects you legally — if something goes wrong and there is no report, you may be held liable. It builds trust with buyers or tenants, provides a clear picture of the actual condition of the electrical network, and a well-documented property is more valuable and sells faster.",
      "What does a VBF include? Instrumental testing and visual inspection, an official report based on current regulations, and identification of faults and deficiencies.",
      "If you are planning to sell or rent out a property, it is worth arranging the inspection in advance so that missing documentation does not become an issue at the last moment. We can help with this too! Contact us: +36 70 613 2658",
    ],
    benefitsHu: ["Tulajdonosváltás (adásvétel) esetén kötelező", "Bérbeadáskor kötelező", "Első használatbavételkor szükséges (újonnan létesített hálózat)", "Felújítás, átalakítás, javítás vagy bővítés után előírt", "Rendkívüli esemény után elvégzendő (beázás, tűzeset, zárlat)", "Lakóingatlan esetén 6 évente időszakos vizsgálat szükséges", "Munkahelyként is szolgáló ingatlan esetén 3 évente kötelező"],
    benefitsEn: ["Mandatory on change of ownership (sale)", "Required when renting out", "Required on first use of newly installed networks", "Required after renovation, modification, repair or extension", "Required after extraordinary events (flooding, fire, short circuit)", "Periodic inspection every 6 years for residential properties", "Every 3 years if the property also serves as a workplace"],
    benefitsTitleHu: "Előnyeink",
    benefitsTitleEn: "Our Benefits",
    ctaTextHu: "Érdekli szolgáltatásunk? Kérjen árajánlatot!",
    ctaTextEn: "Interested in our service? Request a quote!",
    ctaLabelHu: "Árajánlatot kérek",
    ctaLabelEn: "Request a quote",
    ctaUrlHu: "/kapcsolat",
    ctaUrlEn: "/en/contact",
    otherServicesTitleHu: "További szolgáltatásaink",
    otherServicesTitleEn: "Our Other Services",
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

  blocks.push({ pagePath, blockKey: "service.benefits.title", content: bi(svc.benefitsTitleHu, svc.benefitsTitleEn), contentType: "json" });
  blocks.push({ pagePath, blockKey: "service.cta.text", content: bi(svc.ctaTextHu, svc.ctaTextEn), contentType: "json" });
  blocks.push({ pagePath, blockKey: "service.cta.label", content: bi(svc.ctaLabelHu, svc.ctaLabelEn), contentType: "json" });
  blocks.push({ pagePath, blockKey: "service.cta.url", content: bi(svc.ctaUrlHu, svc.ctaUrlEn), contentType: "json" });
  blocks.push({ pagePath, blockKey: "service.otherServices", content: bi(svc.otherServicesTitleHu, svc.otherServicesTitleEn), contentType: "json" });
  blocks.push({ pagePath, blockKey: "service.moreLink", content: bi("Részletek", "More"), contentType: "json" });
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
  blockKey: "intro.heroSubtitle",
  content: bi("Megbízható partner az ingatlanpiacon", "Your trusted partner in real estate"),
  contentType: "json",
});

blocks.push({
  pagePath: "/bemutatkozas",
  blockKey: "intro.motto",
  content: bi("Az a jó üzlet amikor mindenki elégedett😊", "A good deal is when everyone is satisfied😊"),
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
  content: bi("Mikor NEM mi vagyunk a megoldás az Ön élethelyzetére, ingatlant érintő problémájára?", "When are we NOT the solution for your situation or property problem?"),
  contentType: "json",
});

blocks.push({
  pagePath: "/bemutatkozas",
  blockKey: "intro.notRightFit.items",
  content: JSON.stringify({
    hu: [
      "Ha nem szeretne őszinte, reális véleményt hallani",
      "Ha nem hajlandó kihasználni általunk biztosított kedvezményeket",
      "Ha zavarja az, hogy mindent elintézünk Ön helyett (érintésvédelem, energetika, földhivatali ügyintézés, ügyvédi egyeztetések az adásvétellel és az ingatlant érintő tennivalókkal kapcsolatban)",
      "Ha azt várja, hogy rábeszéljük vagy támogassuk egy rossz döntésben",
      "Ha nem szeretne első kézből hitelezési tanácsokat, információkat kapni",
    ],
    en: [
      "If you don't want to hear honest, realistic opinions",
      "If you're unwilling to take advantage of the discounts we provide",
      "If it bothers you that we handle everything for you (contact protection, energy certification, land registry, legal consultations regarding the sale and property-related tasks)",
      "If you expect us to talk you into or support a bad decision",
      "If you don't want first-hand mortgage advice and information",
    ],
  }),
  contentType: "json",
});

// ═══════════════════════════════════════════════════════
// HOMEPAGE — additional blocks (about preview, services overview, newsletter)
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/", blockKey: "about.text", content: bi("A Gerecse Ingatlan több mint egy évtizede segíti ügyfeleit otthonuk megtalálásában. Családias, személyes hozzáállásunkkal biztosítjuk, hogy minden ügyfelünk megtalálja számára tökéletes ingatlant.", "Gerecse Ingatlan has been helping clients find their homes for over a decade. With our family-like, personal approach, we ensure that every client finds their perfect property."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "about.counter.years", content: bi("Év tapasztalat", "Years of experience"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "about.counter.sold", content: bi("Eladott ingatlan", "Properties sold"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "about.counter.clients", content: bi("Elégedett ügyfél", "Satisfied clients"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "about.cta.label", content: bi("Tovább a teljes bemutatáshoz", "Read our full story"), contentType: "json" });

blocks.push({ pagePath: "/", blockKey: "services.salesTitle", content: bi("Ingatlan értékesítés", "Property Sales"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.salesDesc", content: bi("Lakossági, gazdasági és ipari ingatlanok értékesítése.", "Residential, commercial, and industrial property sales."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.rentalTitle", content: bi("Ingatlan bérbeadás", "Property Letting"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.rentalDesc", content: bi("Lakossági, gazdasági és ipari ingatlanok bérbeadása.", "Residential, commercial, and industrial property letting and rentals."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.appraisalTitle", content: bi("Értékbecslés és értékmeghatározás készítése", "Appraisal & Value Determination"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.appraisalDesc", content: bi("Hivatalos értékbecslés és piaci értékmeghatározás szakértői közreműködéssel.", "Official property appraisal and market value determination with expert involvement."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.legalTitle", content: bi("Teljeskörű jogi háttér", "Full Legal Support"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.legalDesc", content: bi("Ügyvédi közreműködés, szerződésírás, jogi tanácsadás ingatlanügyekhez.", "Legal assistance, contract drafting, and advisory for property transactions."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.loanTitle", content: bi("Hitel- és állami támogatások ügyintézése", "Loan & State Subsidy Administration"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.loanDesc", content: bi("Segítségnyújtás banki hitelek és állami támogatások ügyintézésében.", "Assistance with bank loans and government subsidy applications."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.energyTitle", content: bi("Energetikai tanúsítvány", "Energy Performance Certificate"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.energyDesc", content: bi("Energetikai tanúsítvány készítése ingatlan adásvételhez és bérbeadáshoz akkreditált szakértőkkel.", "Energy performance certificates for property sales and rentals, issued by accredited specialists."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.interiorTitle", content: bi("Belsőépítészet, látványtervezés", "Interior Design & Visualization"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.interiorDesc", content: bi("Belsőépítészeti tanácsadás és 3D látványtervezés közvetítése.", "Interior design consulting and 3D visualization brokering."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.electricalTitle", content: bi("Érintésvédelmi felülvizsgálat", "Touch Protection Inspection"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.electricalDesc", content: bi("Érintésvédelmi felülvizsgálat lakó-, üzlet- és ipari ingatlanokhoz hivatalos jegyzőkönyvvel.", "Touch protection inspection for residential, commercial, and industrial properties with official reports."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "services.more", content: bi("Tovább", "Learn more"), contentType: "json" });

// Newsletter on homepage
blocks.push({ pagePath: "/", blockKey: "newsletter.title", content: bi("Iratkozzon fel hírlevelünkre", "Subscribe to our newsletter"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "newsletter.subtitle", content: bi("Értesüljön elsőként az új ingatlanokról és akciókról!", "Be the first to hear about new properties and offers!"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "newsletter.success", content: bi("Sikeres feliratkozás!", "Successfully subscribed!"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "newsletter.successConfirm", content: bi("Sikeres feliratkozás! Kérjük, erősítse meg e-mail címét a kapott levélben.", "Successfully subscribed! Please confirm your email address in the message you received."), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "newsletter.button", content: bi("Feliratkozás", "Subscribe"), contentType: "json" });
blocks.push({ pagePath: "/", blockKey: "newsletter.gdpr", content: bi("Elfogadom az adatkezelési tájékoztatót", "I accept the privacy policy"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// FOOTER (/footer)
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/footer", blockKey: "contact.title", content: bi("Kapcsolat", "Contact"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "contact.phone", content: "+36 70 613 2658", contentType: "text" });
blocks.push({ pagePath: "/footer", blockKey: "contact.email", content: "info@gerecseingatlan.hu", contentType: "text" });
blocks.push({ pagePath: "/footer", blockKey: "quickLinks.title", content: bi("Gyors linkek", "Quick Links"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.home", content: bi("Kezdőlap", "Home"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.about", content: bi("Rólunk", "About Us"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.properties", content: bi("Ingatlanok", "Properties"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.contact", content: bi("Kapcsolat", "Contact"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "services.title", content: bi("Szolgáltatások", "Services"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.sales", content: bi("Ingatlan értékesítés", "Property Sales"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.rental", content: bi("Ingatlan bérbeadás", "Property Letting"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.appraisal", content: bi("Értékbecslés és értékmeghatározás készítése", "Appraisal & Value Determination"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.legal", content: bi("Teljeskörű jogi háttér", "Full Legal Support"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.loan", content: bi("Hitel- és állami támogatások ügyintézése", "Loan & State Subsidy Administration"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.energy", content: bi("Energetikai tanúsítvány", "Energy Performance Certificate"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.interior", content: bi("Belsőépítészet, látványtervezés", "Interior Design & Visualization"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "links.electrical", content: bi("Érintésvédelmi felülvizsgálat", "Touch Protection Inspection"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "newsletter.title", content: bi("Hírlevél", "Newsletter"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "newsletter.subtitle", content: bi("Értesüljön elsőként az új ingatlanokról és akciókról!", "Be the first to hear about new properties and offers!"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "newsletter.gdpr", content: bi("Elfogadom az adatkezelési tájékoztatót", "I accept the privacy policy"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "copyright", content: bi("© 2026 Gerecse Ingatlan. Minden jog fenntartva.", "© 2026 Gerecse Ingatlan. All rights reserved."), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "imprint", content: bi("Impresszum", "Imprint"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "privacy", content: bi("Adatvédelem", "Privacy Policy"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "cookies", content: bi("Sütik kezelése", "Cookie Settings"), contentType: "json" });
blocks.push({ pagePath: "/footer", blockKey: "terms", content: bi("ÁSZF", "Terms"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// FAQ PAGE — title, subtitle
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/gyik", blockKey: "page.title", content: bi("Gyakori Kérdések", "Frequently Asked Questions"), contentType: "json" });
blocks.push({ pagePath: "/gyik", blockKey: "page.subtitle", content: bi("Válaszok a leggyakrabban felmerülő kérdésekre az ingatlanügyletekkel kapcsolatban.", "Answers to common questions about real estate transactions."), contentType: "json" });

// ═══════════════════════════════════════════════════════
// TESTIMONIALS PAGE — title, subtitle
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/velemenyek", blockKey: "page.title", content: bi("Ügyfeleink mondták", "What Our Clients Say"), contentType: "json" });
blocks.push({ pagePath: "/velemenyek", blockKey: "page.subtitle", content: bi("Ügyfeleink tapasztalatai és visszajelzései", "Experiences and feedback from our clients"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// TEAM PAGE — title, subtitle
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/munkatarsaink", blockKey: "page.title", content: bi("Csapatunk", "Our Team"), contentType: "json" });
blocks.push({ pagePath: "/munkatarsaink", blockKey: "page.subtitle", content: bi("Tapasztalt szakembereink személyre szabott segítséget nyújtanak", "Our experienced professionals provide personalized assistance"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// PROPERTIES PAGE — title, subtitle
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/ingatlanok", blockKey: "page.title", content: bi("Ingatlanok", "Properties"), contentType: "json" });
blocks.push({ pagePath: "/ingatlanok", blockKey: "page.subtitle", content: bi("Böngésszen kínálatunkban", "Browse our listings"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// INTRODUCTION PAGE — remaining blocks
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/bemutatkozas", blockKey: "intro.title", content: bi("Bemutatkozás", "Introduction"), contentType: "json" });
blocks.push({ pagePath: "/bemutatkozas", blockKey: "intro.aboutHeading", content: bi("Rólunk", "About us"), contentType: "json" });
blocks.push({ pagePath: "/bemutatkozas", blockKey: "intro.text", content: bi("Családias hangulatú, ügyfélközpontú szemléletünk különböztet meg minket a piacon szereplő konkurenciáinktól. Tatától-Esztergomig és elsősorban a Duna menti településeken foglalkozunk eladó és kiadó ingatlanokkal, de egyedi, az ország távolabbi részén található ingatlanok értékesítését is segítjük. Legyen szó minigarzonról vagy több száz millió értékű ipari ingatlanról, mindenkinek megtaláljuk a számára ideális lehetőséget. Természetesen új otthonukat, első lakásukat, vagy akár befektetést kereső ügyfeleinkről is gondoskodunk, igyekszünk mindenki igényeit kielégíteni.", "Our family-like, client-focused approach sets us apart from our competitors. We deal with properties for sale and rent from Tata to Esztergom, primarily in settlements along the Danube, but we also help with the sale of unique properties in more distant parts of the country. Whether it's a small studio or an industrial property worth hundreds of millions, we find the ideal opportunity for everyone. Of course, we also take care of clients looking for new homes, first apartments, or investments, striving to satisfy everyone's needs."), contentType: "json" });
blocks.push({ pagePath: "/bemutatkozas", blockKey: "mission.title", content: bi("Küldetésünk", "Our Mission"), contentType: "json" });
blocks.push({ pagePath: "/bemutatkozas", blockKey: "mission.text", content: bi("Számunkra az a fontos, hogy valódi segítséget nyújtsunk. Küldetésünk, hogy olyan átfogó és egyben minőségi szolgáltatást nyújtsunk, melyben a szakértelem és az ügyfélközpontúság egyszerre van jelen, ennek köszönhetően tulajdonosok és vevőink egyaránt elégedetten és sikeresen zárhatják le az adásvételt vagy bérbeadást. Legyen szó akár első lakás vásárlásról, családi ház eladásáról, befektetési célú ingatlanról vagy agglomerációba költözésről, végig kísérjük és segítjük a teljes folyamatot.", "What matters to us is providing real help. Our mission is to provide comprehensive, quality service where expertise and client focus go hand in hand, allowing both owners and buyers to close sales or rentals with satisfaction and success. Whether it's buying a first home, selling a family house, investing in property, or moving to the suburbs, we accompany and support you through the entire process."), contentType: "json" });
blocks.push({ pagePath: "/bemutatkozas", blockKey: "intro.valuesHeading", content: bi("Értékeink", "Our Values"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// CONTACT PAGE — remaining blocks
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.hours.saturday", content: bi("", ""), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.hours.sunday", content: bi("", ""), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.info.facebook.label", content: bi("Facebook", "Facebook"), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.submitting", content: bi("Küldés...", "Sending..."), contentType: "json" });
blocks.push({ pagePath: "/kapcsolat", blockKey: "contact.form.errorPrefix", content: bi("Hiba: ", "Error: "), contentType: "json" });

// ═══════════════════════════════════════════════════════
// IMPRESSZUM PAGE
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/impresszum", blockKey: "page.title", content: bi("Impresszum", "Legal Notice"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "page.subtitle", content: bi("Jogszabályi kötelezettség a 2001. évi CVIII. törvény (Ekertv.) alapján", "Legal obligation under Hungarian Act CVIII of 2001"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.heading", content: bi("Szolgáltató adatai", "Service Provider"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.nameLabel", content: bi("Cégnév", "Company name"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.name", content: "Gerecse Ingatlan Kft.", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.addressLabel", content: bi("Székhely", "Registered office"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.address", content: "2890 Tata, Példa utca 1.", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.regLabel", content: bi("Cégjegyzékszám", "Company registration no."), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.regNumber", content: "11-09-XXXXXX", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.taxLabel", content: bi("Adószám", "Tax number"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.taxNumber", content: "XXXXXXXX-X-XX", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.courtLabel", content: bi("Nyilvántartó bíróság", "Court of registration"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.court", content: bi("Tatabányai Törvényszék Cégbírósága", "Company Court of Tatabánya"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.repLabel", content: bi("Képviselő", "Representative"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "company.rep", content: bi("Gerecse Ingatlan ügyvezető", "Managing Director"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "contact.heading", content: bi("Elérhetőségek", "Contact Information"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "contact.phone", content: "+36 70 613 2658", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "contact.email", content: "info@gerecseingatlan.hu", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "contact.website", content: "gerecseingatlan.hu", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "hosting.heading", content: bi("Tárhelyszolgáltató", "Hosting Provider"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "hosting.nameLabel", content: bi("Név", "Name"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "hosting.name", content: "[Tárhelyszolgáltató neve]", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "hosting.addressLabel", content: bi("Cím", "Address"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "hosting.address", content: "[Tárhelyszolgáltató címe]", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "hosting.webLabel", content: bi("Weboldal", "Website"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "hosting.website", content: "[Tárhelyszolgáltató weboldala]", contentType: "text" });
blocks.push({ pagePath: "/impresszum", blockKey: "copyright.heading", content: bi("Szerzői jogok", "Copyright"), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "copyright.text", content: bi("A weboldalon megjelenő tartalmak (szövegek, képek, grafikák, logók) a Gerecse Ingatlan Kft. szellemi tulajdonát képezik. Ezek másolása, terjesztése vagy bármilyen felhasználása kizárólag a Gerecse Ingatlan Kft. előzetes írásos engedélyével lehetséges.", "All content on this website (texts, images, graphics, logos) is the intellectual property of Gerecse Ingatlan Kft. Copying, distribution or any use of these materials is only permitted with prior written consent of Gerecse Ingatlan Kft."), contentType: "json" });
blocks.push({ pagePath: "/impresszum", blockKey: "page.lastUpdated", content: bi("Utolsó frissítés: 2026. április 16.", "Last updated: 16 April 2026"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// ÁSZF PAGE
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/aszf", blockKey: "page.title", content: bi("Általános Szerződési Feltételek", "Terms and Conditions"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "page.subtitle", content: bi("(ÁSZF)", "(T&C)"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section1.title", content: bi("Általános rendelkezések", "General Provisions"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section1.p1", content: bi("Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a Gerecse Ingatlan Kft. (székhely: 2890 Tata, Példa utca 1.; cégjegyzékszám: 11-09-XXXXXX; adószám: XXXXXXXX-X-XX; a továbbiakban: Szolgáltató) által üzemeltetett gerecseingatlan.hu weboldal (a továbbiakban: Weboldal) használatának feltételeit szabályozzák.", "These Terms and Conditions (hereinafter: T&C) govern the use of the gerecseingatlan.hu website (hereinafter: Website) operated by Gerecse Ingatlan Kft. (registered office: 2890 Tata, Példa utca 1.; company registration no.: 11-09-XXXXXX; tax no.: XXXXXXXX-X-XX; hereinafter: Provider)."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section1.p2", content: bi("A Weboldal használatával Ön elfogadja a jelen ÁSZF-ben foglalt feltételeket.", "By using the Website, you accept the terms set out in these T&C."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section2.title", content: bi("A Szolgáltató tevékenysége", "Services Provided"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section2.p1", content: bi("A Szolgáltató ingatlanközvetítői tevékenységet végez a Gerecse régióban és Komárom-Esztergom megyében. Szolgáltatásai közé tartozik:", "The Provider offers real estate brokerage services in the Gerecse region and Komárom-Esztergom county. Services include:"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section2.item1", content: bi("Ingatlanok adásvételének közvetítése", "Mediation of property sales"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section2.item2", content: bi("Ingatlanok bérbeadásának közvetítése", "Mediation of property rentals"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section2.item3", content: bi("Ingatlan értékbecslés", "Property valuation"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section2.item4", content: bi("Jogi háttér biztosítása", "Legal support"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section2.item5", content: bi("Hiteltanácsadás", "Mortgage consulting"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section2.item6", content: bi("Home staging és belsőépítészet", "Home staging and interior design"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section3.title", content: bi("A Weboldal használata", "Use of the Website"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section3.p1", content: bi("A Weboldalon közzétett ingatlaninformációk tájékoztató jellegűek, és nem minősülnek szerződéses ajánlatnak. A Szolgáltató fenntartja a jogot a tartalom bármikori módosítására.", "Property information published on the Website is for informational purposes only and does not constitute a contractual offer. The Provider reserves the right to modify content at any time."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section3.p2", content: bi("A felhasználó köteles a Weboldalt rendeltetésszerűen, jogszerűen és jóhiszeműen használni.", "The user is obliged to use the Website properly, lawfully and in good faith."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section4.title", content: bi("Szellemi tulajdon", "Intellectual Property"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section4.p1", content: bi("A Weboldalon megjelenő szövegek, képek, logók, grafikai elemek és egyéb tartalmak a Szolgáltató szellemi tulajdonát képezik, vagy felhasználási joggal rendelkezik felettük. A tartalmak engedély nélküli másolása, felhasználása vagy terjesztése tilos és jogkövetkezményeket von maga után.", "Texts, images, logos, graphics and other content on the Website are the intellectual property of the Provider or used under licence. Copying, using or distributing content without permission is prohibited and subject to legal consequences."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section5.title", content: bi("Felelősség", "Liability"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section5.p1", content: bi("A Szolgáltató törekszik a Weboldalon közölt információk pontosságára, de nem vállal felelősséget az esetleges pontatlanságokért vagy elírásokért. Az ingatlanokkal kapcsolatos végleges adatokat a személyes egyeztetés során pontosítjuk.", "The Provider strives for accuracy of information on the Website but accepts no liability for potential inaccuracies or typographical errors. Final property details are confirmed during personal consultation."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section5.p2", content: bi("A Szolgáltató nem felelős a Weboldalról elérhető külső linkek tartalmáért.", "The Provider is not responsible for the content of external links accessible from the Website."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section6.title", content: bi("Adatkezelés", "Data Protection"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section6.p1", content: bi("A személyes adatok kezelésére vonatkozó részletes tájékoztatást az Adatkezelési tájékoztató tartalmazza.", "Detailed information on personal data processing can be found in our Privacy Policy."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section7.title", content: bi("Irányadó jog és jogviták", "Governing Law & Disputes"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section7.p1", content: bi("Jelen ÁSZF-re a magyar jog az irányadó. A felek vitáikat elsősorban egyeztetés útján kísérlik meg rendezni. Ennek eredménytelensége esetén a Tatabányai Törvényszék, illetve a Tatabányai Járásbíróság illetékességét kötik ki.", "These T&C are governed by Hungarian law. The parties shall first attempt to settle disputes through negotiation. Failing that, the courts of Tatabánya shall have exclusive jurisdiction."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section8.title", content: bi("ÁSZF módosítása", "Amendments"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section8.p1", content: bi("A Szolgáltató fenntartja a jogot a jelen ÁSZF egyoldalú módosítására. A módosított ÁSZF a Weboldalon történő közzététellel lép hatályba. A Weboldal további használata a módosítások elfogadásának minősül.", "The Provider reserves the right to unilaterally amend these T&C. Amended T&C take effect upon publication on the Website. Continued use of the Website constitutes acceptance of the amendments."), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section9.title", content: bi("Kapcsolat", "Contact"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "section9.p1", content: bi("Kérdéseivel forduljon hozzánk bizalommal:", "If you have any questions, please contact us:"), contentType: "json" });
blocks.push({ pagePath: "/aszf", blockKey: "effectiveDate", content: bi("Hatályba lépés: 2026. április 16.", "Effective date: 16 April 2026"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// ADATKEZELÉSI TÁJÉKOZTATÓ PAGE
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "page.title", content: bi("Adatkezelési tájékoztató", "Privacy Policy"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "page.subtitle", content: bi("Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) alapján", "In accordance with EU Regulation 2016/679 (GDPR)"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section1.title", content: bi("Adatkezelő", "Data Controller"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section1.p1", content: bi("Az adatkezelő a Gerecse Ingatlan Kft. (székhely: 2890 Tata, Példa utca 1.; adószám: XXXXXXXX-X-XX; e-mail: info@gerecseingatlan.hu; telefon: +36 70 613 2658).", "The data controller is Gerecse Ingatlan Kft. (registered office: 2890 Tata, Példa utca 1.; tax number: XXXXXXXX-X-XX; e-mail: info@gerecseingatlan.hu; phone: +36 70 613 2658)."), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section2.title", content: bi("A tájékoztató hatálya", "Scope of This Policy"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section2.p1", content: bi("Jelen tájékoztató a gerecseingatlan.hu weboldalon és az ahhoz kapcsolódó szolgáltatások során végzett személyesadat-kezelésre terjed ki.", "This policy covers the processing of personal data on the gerecseingatlan.hu website and related services."), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section3.title", content: bi("Kezelt adatok, jogalapok és célok", "Data Processed, Legal Bases & Purposes"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.title", content: bi("Az érintett jogai", "Data Subject Rights"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.p1", content: bi("A GDPR alapján Ön az alábbi jogokkal rendelkezik:", "Under the GDPR, you have the following rights:"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.right1", content: bi("Hozzáférési jog (GDPR 15. cikk)", "Right of access (Art. 15)"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.right2", content: bi("Helyesbítéshez való jog (GDPR 16. cikk)", "Right to rectification (Art. 16)"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.right3", content: bi("Törléshez való jog – „elfeledtetéshez való jog\" (GDPR 17. cikk)", "Right to erasure – 'right to be forgotten' (Art. 17)"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.right4", content: bi("Adatkezelés korlátozásához való jog (GDPR 18. cikk)", "Right to restriction of processing (Art. 18)"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.right5", content: bi("Adathordozhatósághoz való jog (GDPR 20. cikk)", "Right to data portability (Art. 20)"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.right6", content: bi("Tiltakozáshoz való jog (GDPR 21. cikk)", "Right to object (Art. 21)"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.right7", content: bi("Hozzájárulás visszavonásának joga – a visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét", "Right to withdraw consent – withdrawal does not affect the lawfulness of processing before withdrawal"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section4.p2", content: bi("Jogai gyakorlásához kérjük, írjon az info@gerecseingatlan.hu e-mail címre.", "To exercise your rights, please contact info@gerecseingatlan.hu."), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section5.title", content: bi("Adattovábbítás", "Data Transfers"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section5.p1", content: bi("Személyes adatait harmadik országba nem továbbítjuk. Az adatfeldolgozók (pl. tárhelyszolgáltató, e-mail szolgáltató) az Európai Gazdasági Térségen belül működnek, vagy megfelelő garanciákat biztosítanak (GDPR 46. cikk).", "We do not transfer your personal data to third countries. Our data processors (e.g., hosting provider, e-mail service) operate within the European Economic Area or provide appropriate safeguards (Art. 46 GDPR)."), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section6.title", content: bi("Adatbiztonság", "Data Security"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section6.p1", content: bi("Az adatkezelő megfelelő technikai és szervezési intézkedéseket alkalmaz az adatok védelme érdekében, beleértve a HTTPS titkosítást, tűzfalvédelmet és rendszeres biztonsági mentéseket.", "The data controller implements appropriate technical and organisational measures to protect data, including HTTPS encryption, firewall protection and regular backups."), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section7.title", content: bi("Jogorvoslat", "Complaints & Legal Remedies"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section7.p1", content: bi("Panaszával fordulhat a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH):", "You may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH):"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section7.p2", content: bi("Továbbá bírósághoz is fordulhat az Infotv. 22. § alapján.", "You also have the right to seek judicial remedy under Hungarian law."), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section8.title", content: bi("Sütik (cookie-k)", "Cookies"), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "section8.p1", content: bi("A weboldalon használt sütikről részletes tájékoztatást a Cookie tájékoztatóban talál.", "For detailed information about cookies used on this website, please see our Cookie Policy."), contentType: "json" });
blocks.push({ pagePath: "/adatkezelesi-tajekoztato", blockKey: "lastUpdated", content: bi("Utolsó frissítés: 2026. április 16.", "Last updated: 16 April 2026"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// COOKIE TÁJÉKOZTATÓ PAGE
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "page.title", content: bi("Cookie (süti) tájékoztató", "Cookie Policy"), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "page.subtitle", content: bi("Információk a weboldalunkon használt sütikről", "Information about the cookies used on our website"), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "intro.title", content: bi("Mi az a süti (cookie)?", "What Are Cookies?"), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "intro.p1", content: bi("A sütik (cookie-k) kis szöveges fájlok, amelyeket a weboldal az Ön böngészőjében tárol. Segítenek a weboldal működésében, a felhasználói élmény javításában és a látogatottsági statisztikák gyűjtésében.", "Cookies are small text files stored in your browser by the website. They help the website function, improve user experience, and collect visitor statistics."), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "intro.p2", content: bi("A gerecseingatlan.hu weboldalon Ön szabadon dönthet arról, hogy mely sütiket engedélyezi. Az alapvető funkciókhoz szükséges sütik nélkül is működik a weboldal.", "On gerecseingatlan.hu you can freely decide which cookies to allow. The website functions without optional cookies."), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "necessary.title", content: bi("Szükséges sütik", "Necessary Cookies"), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "necessary.desc", content: bi("Ezek a sütik elengedhetetlenek a weboldal alapvető működéséhez. Nem gyűjtenek személyes adatokat, és nem kapcsolhatók ki.", "These cookies are essential for the basic functionality of the website. They do not collect personal data and cannot be disabled."), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "analytics.title", content: bi("Analitikai sütik", "Analytics Cookies"), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "analytics.desc", content: bi("Ezek a sütik segítenek megérteni, hogyan használják a látogatók a weboldalt. Az adatgyűjtés anonim. Csak az Ön hozzájárulásával aktiválódnak.", "These cookies help us understand how visitors use the website. Data collection is anonymous. They are activated only with your consent."), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "marketing.title", content: bi("Marketing sütik", "Marketing Cookies"), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "marketing.desc", content: bi("A marketing sütik segítenek releváns hirdetések megjelenítésében. Jelenleg weboldalunk nem használ marketing sütiket, de a jövőben bevezethetjük őket. Ilyen esetben csak az Ön kifejezett hozzájárulásával aktiváljuk.", "Marketing cookies help display relevant advertisements. Currently our website does not use marketing cookies, but we may introduce them in the future. In that case, they will only be activated with your explicit consent."), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "managing.title", content: bi("Sütik kezelése", "Managing Cookies"), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "managing.p1", content: bi("A sütibeállításokat bármikor módosíthatja a weboldal cookie-sávjának „Beállítások\" gombjával, vagy a böngészője beállításaiban.", "You can change your cookie preferences at any time using the cookie banner's \"Settings\" button, or in your browser settings."), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "managing.p2", content: bi("A legtöbb böngészőben a következő módon törölheti vagy letilthatja a sütiket:", "In most browsers, you can delete or disable cookies as follows:"), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "managing.p3", content: bi("A sütik letiltása befolyásolhatja egyes funkciók működését.", "Disabling cookies may affect the functionality of some features."), contentType: "json" });
blocks.push({ pagePath: "/cookie-tajekoztato", blockKey: "lastUpdated", content: bi("Utolsó frissítés: 2026. április 16.", "Last updated: 16 April 2026"), contentType: "json" });

// ═══════════════════════════════════════════════════════
// INTERIOR DESIGN FORM (on /belsoepiteszet-latvanyterv)
// ═══════════════════════════════════════════════════════

blocks.push({ pagePath: "/belsoepiteszet-latvanyterv", blockKey: "service.interior.form.title", content: bi("Belsőépítészeti ajánlatkérés", "Interior Design Inquiry"), contentType: "json" });
blocks.push({ pagePath: "/belsoepiteszet-latvanyterv", blockKey: "service.interior.form.subtitle", content: bi("Töltse ki az alábbi űrlapot, és felvesszük Önnel a kapcsolatot a részletekkel kapcsolatban.", "Fill out the form below and we will contact you with details."), contentType: "json" });
blocks.push({ pagePath: "/belsoepiteszet-latvanyterv", blockKey: "service.interior.form.nameLabel", content: bi("Név", "Name"), contentType: "json" });
blocks.push({ pagePath: "/belsoepiteszet-latvanyterv", blockKey: "service.interior.form.emailLabel", content: bi("E-mail", "E-mail"), contentType: "json" });
blocks.push({ pagePath: "/belsoepiteszet-latvanyterv", blockKey: "service.interior.form.phoneLabel", content: bi("Telefonszám", "Phone"), contentType: "json" });
blocks.push({ pagePath: "/belsoepiteszet-latvanyterv", blockKey: "service.interior.form.addressLabel", content: bi("Ingatlan címe / helyszín", "Property address / location"), contentType: "json" });
blocks.push({ pagePath: "/belsoepiteszet-latvanyterv", blockKey: "service.interior.form.messageLabel", content: bi("Üzenet, elképzelések", "Message, ideas"), contentType: "json" });
blocks.push({ pagePath: "/belsoepiteszet-latvanyterv", blockKey: "service.interior.form.submitButton", content: bi("Ajánlatkérés küldése", "Send inquiry"), contentType: "json" });
blocks.push({ pagePath: "/belsoepiteszet-latvanyterv", blockKey: "service.interior.form.dataNotice", content: bi("Az adatokat a Gerecse Ingatlan kezeli, és továbbítja a belsőépítész partnernek.", "Data is managed by Gerecse Ingatlan and forwarded to the interior design partner."), contentType: "json" });

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
