export interface BlockDefinition {
  key: string;
  label: string;
  type: "text" | "html" | "markdown" | "json";
  bilingual: boolean;
}

export interface PageDefinition {
  path: string;
  nameHu: string;
  icon: string;
  expectedBlocks: BlockDefinition[];
}

const SERVICE_BLOCK_TEMPLATE: BlockDefinition[] = [
  { key: "service.title", label: "Szolgáltatás cím", type: "json", bilingual: true },
  { key: "service.subtitle", label: "Alcím", type: "json", bilingual: true },
  { key: "service.paragraphs", label: "Leírás bekezdések", type: "json", bilingual: true },
  { key: "service.benefits.title", label: "Előnyök cím", type: "json", bilingual: true },
  { key: "service.benefits", label: "Előnyök lista", type: "json", bilingual: true },
  { key: "service.cta.label", label: "CTA gomb szöveg", type: "json", bilingual: true },
  { key: "service.cta.url", label: "CTA gomb link", type: "text", bilingual: false },
];

const SERVICE_PAGES: PageDefinition[] = [
  {
    path: "/ingatlan-ertekesites-berbeadas",
    nameHu: "Ingatlan értékesítés",
    icon: "Home",
    expectedBlocks: SERVICE_BLOCK_TEMPLATE,
  },
  {
    path: "/ertekbecsles-ertekmeghatrozas",
    nameHu: "Értékbecslés",
    icon: "FileText",
    expectedBlocks: SERVICE_BLOCK_TEMPLATE,
  },
  {
    path: "/belsoepiteszet-latvanyterv",
    nameHu: "Belsőépítészet",
    icon: "Briefcase",
    expectedBlocks: SERVICE_BLOCK_TEMPLATE,
  },
  {
    path: "/teljeskoru-jogi-hatter",
    nameHu: "Jogi háttér",
    icon: "FileText",
    expectedBlocks: SERVICE_BLOCK_TEMPLATE,
  },
  {
    path: "/hitel-allami-tamogatasok",
    nameHu: "Hitel & támogatások",
    icon: "Briefcase",
    expectedBlocks: SERVICE_BLOCK_TEMPLATE,
  },
  {
    path: "/energetikai-tanusitvany",
    nameHu: "Energetikai tanúsítvány",
    icon: "FileText",
    expectedBlocks: SERVICE_BLOCK_TEMPLATE,
  },
  {
    path: "/villamos-biztonsagi-felulvizsgalat",
    nameHu: "Villamos biztonsági felülvizsgálat",
    icon: "FileText",
    expectedBlocks: SERVICE_BLOCK_TEMPLATE,
  },
];

export const PAGE_REGISTRY: PageDefinition[] = [
  {
    path: "/",
    nameHu: "Kezdőlap",
    icon: "Home",
    expectedBlocks: [
      { key: "hero.title", label: "Hero cím", type: "json", bilingual: true },
      { key: "hero.subtitle", label: "Hero alcím", type: "json", bilingual: true },
      { key: "hero.cta", label: "Hero gomb szöveg", type: "json", bilingual: true },
      { key: "about.title", label: "Rólunk cím", type: "json", bilingual: true },
      { key: "about.text", label: "Rólunk szöveg", type: "json", bilingual: true },
      { key: "about.stats", label: "Statisztikák", type: "json", bilingual: true },
      { key: "services.title", label: "Szolgáltatások cím", type: "json", bilingual: true },
      { key: "services.subtitle", label: "Szolgáltatások alcím", type: "json", bilingual: true },
      { key: "testimonials.title", label: "Vélemények cím", type: "json", bilingual: true },
      { key: "newsletter.title", label: "Hírlevél cím", type: "json", bilingual: true },
      { key: "newsletter.subtitle", label: "Hírlevél alcím", type: "json", bilingual: true },
      { key: "newsletter.button", label: "Feliratkozás gomb", type: "json", bilingual: true },
      { key: "newsletter.placeholder", label: "Email placeholder", type: "json", bilingual: true },
      { key: "newsletter.emailPlaceholder", label: "Email mező placeholder", type: "json", bilingual: true },
      { key: "newsletter.nameLabel", label: "Név mező címke", type: "json", bilingual: true },
      { key: "newsletter.namePlaceholder", label: "Név mező placeholder", type: "json", bilingual: true },
      { key: "newsletter.gdpr", label: "GDPR szöveg", type: "json", bilingual: true },
      { key: "newsletter.gdprConsentPrefix", label: "GDPR hozzájárulás előtag", type: "json", bilingual: true },
      { key: "newsletter.gdprLinkText", label: "GDPR link szöveg", type: "json", bilingual: true },
      { key: "newsletter.gdprConsentSuffix", label: "GDPR hozzájárulás utótag", type: "json", bilingual: true },
      { key: "newsletter.success", label: "Sikeres feliratkozás üzenet", type: "json", bilingual: true },
      { key: "newsletter.successConfirm", label: "Megerősítés üzenet", type: "json", bilingual: true },
      { key: "newsletter.emailInvalid", label: "Érvénytelen email hiba", type: "json", bilingual: true },
      { key: "newsletter.gdprInvalid", label: "GDPR hiba", type: "json", bilingual: true },
      { key: "newsletter.networkError", label: "Hálózati hiba", type: "json", bilingual: true },
      { key: "newsletter.genericError", label: "Általános hiba", type: "json", bilingual: true },
    ],
  },
  {
    path: "/bemutatkozas",
    nameHu: "Bemutatkozás",
    icon: "Info",
    expectedBlocks: [
      { key: "intro.title", label: "Oldal cím", type: "json", bilingual: true },
      { key: "intro.heroSubtitle", label: "Hero alcím", type: "json", bilingual: true },
      { key: "intro.text", label: "Bemutatkozó szöveg", type: "json", bilingual: true },
      { key: "intro.motto", label: "Mottó", type: "json", bilingual: true },
      { key: "intro.valuesHeading", label: "Értékek fejléc", type: "json", bilingual: true },
      { key: "intro.values", label: "Értékek lista", type: "json", bilingual: true },
      { key: "mission.title", label: "Küldetés cím", type: "json", bilingual: true },
      { key: "mission.text", label: "Küldetés szöveg", type: "json", bilingual: true },
      { key: "intro.notRightFit.title", label: "Nem vagyunk jó választás cím", type: "json", bilingual: true },
      { key: "intro.notRightFit.items", label: "Nem vagyunk jó választás lista", type: "json", bilingual: true },
    ],
  },
  {
    path: "/ingatlanok",
    nameHu: "Ingatlanok",
    icon: "Building2",
    expectedBlocks: [
      { key: "page.title", label: "Oldal cím", type: "json", bilingual: true },
      { key: "page.subtitle", label: "Alcím", type: "json", bilingual: true },
      { key: "filters.placeholder", label: "Szűrő placeholder", type: "json", bilingual: true },
    ],
  },
  {
    path: "/munkatarsaink",
    nameHu: "Csapatunk",
    icon: "Users",
    expectedBlocks: [
      { key: "page.title", label: "Oldal cím", type: "json", bilingual: true },
      { key: "page.subtitle", label: "Alcím", type: "json", bilingual: true },
    ],
  },
  {
    path: "/kapcsolat",
    nameHu: "Kapcsolat",
    icon: "Mail",
    expectedBlocks: [
      { key: "page.title", label: "Oldal cím", type: "json", bilingual: true },
      { key: "page.subtitle", label: "Alcím", type: "json", bilingual: true },
      { key: "contact.info.phone", label: "Telefon", type: "json", bilingual: true },
      { key: "contact.info.email", label: "Email cím", type: "json", bilingual: true },
      { key: "contact.info.hours", label: "Nyitvatartás", type: "json", bilingual: true },
      { key: "contact.info.address", label: "Cím", type: "json", bilingual: true },
      { key: "contact.form.name.label", label: "Név mező", type: "json", bilingual: true },
      { key: "contact.form.email.label", label: "Email mező", type: "json", bilingual: true },
      { key: "contact.form.phone.label", label: "Telefon mező", type: "json", bilingual: true },
      { key: "contact.form.subject.label", label: "Tárgy mező", type: "json", bilingual: true },
      { key: "contact.form.message.label", label: "Üzenet mező", type: "json", bilingual: true },
      { key: "contact.form.submit", label: "Küldés gomb", type: "json", bilingual: true },
    ],
  },
  {
    path: "/gyik",
    nameHu: "GYIK",
    icon: "HelpCircle",
    expectedBlocks: [
      { key: "page.title", label: "Oldal cím", type: "json", bilingual: true },
      { key: "page.subtitle", label: "Alcím", type: "json", bilingual: true },
      { key: "faq.items", label: "Kérdés-válasz párok", type: "json", bilingual: true },
    ],
  },
  {
    path: "/velemenyek",
    nameHu: "Vélemények",
    icon: "MessageSquare",
    expectedBlocks: [
      { key: "page.title", label: "Oldal cím", type: "json", bilingual: true },
      { key: "page.subtitle", label: "Alcím", type: "json", bilingual: true },
      { key: "testimonials.items", label: "Vélemények lista", type: "json", bilingual: true },
    ],
  },
  {
    path: "/impresszum",
    nameHu: "Impresszum",
    icon: "FileText",
    expectedBlocks: [
      { key: "page.title", label: "Oldal cím", type: "json", bilingual: true },
      { key: "page.subtitle", label: "Alcím", type: "json", bilingual: true },
      { key: "company.heading", label: "Cégadatok fejléc", type: "json", bilingual: true },
      { key: "company.nameLabel", label: "Cégnév címke", type: "json", bilingual: true },
      { key: "company.name", label: "Cégnév", type: "json", bilingual: true },
      { key: "company.addressLabel", label: "Székhely címke", type: "json", bilingual: true },
      { key: "company.address", label: "Székhely", type: "json", bilingual: true },
      { key: "company.regLabel", label: "Cégjegyzékszám címke", type: "json", bilingual: true },
      { key: "company.regNumber", label: "Cégjegyzékszám", type: "json", bilingual: true },
      { key: "company.taxLabel", label: "Adószám címke", type: "json", bilingual: true },
      { key: "company.taxNumber", label: "Adószám", type: "json", bilingual: true },
      { key: "company.courtLabel", label: "Bíróság címke", type: "json", bilingual: true },
      { key: "company.court", label: "Nyilvántartó bíróság", type: "json", bilingual: true },
      { key: "company.repLabel", label: "Képviselő címke", type: "json", bilingual: true },
      { key: "company.rep", label: "Képviselő", type: "json", bilingual: true },
      { key: "contact.heading", label: "Kapcsolat fejléc", type: "json", bilingual: true },
      { key: "contact.phone", label: "Telefon", type: "json", bilingual: true },
      { key: "contact.email", label: "Email", type: "json", bilingual: true },
      { key: "contact.website", label: "Weboldal", type: "json", bilingual: true },
      { key: "hosting.heading", label: "Tárhely fejléc", type: "json", bilingual: true },
      { key: "hosting.nameLabel", label: "Tárhely név címke", type: "json", bilingual: true },
      { key: "hosting.name", label: "Tárhelyszolgáltató neve", type: "json", bilingual: true },
      { key: "hosting.addressLabel", label: "Tárhely cím címke", type: "json", bilingual: true },
      { key: "hosting.address", label: "Tárhelyszolgáltató címe", type: "json", bilingual: true },
      { key: "hosting.webLabel", label: "Tárhely web címke", type: "json", bilingual: true },
      { key: "hosting.website", label: "Tárhelyszolgáltató weboldal", type: "json", bilingual: true },
      { key: "copyright.heading", label: "Szerzői jog fejléc", type: "json", bilingual: true },
      { key: "copyright.text", label: "Szerzői jog szöveg", type: "json", bilingual: true },
      { key: "page.lastUpdated", label: "Utolsó frissítés", type: "json", bilingual: true },
    ],
  },
  ...SERVICE_PAGES,
];
