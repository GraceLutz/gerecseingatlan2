import { Home, FileText, Scale, Banknote, Sofa, Zap, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Service {
  slug: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  contentHu: string[];
  contentEn: string[];
}

export const services: Service[] = [
  {
    slug: "ingatlan-ertekesites-berbeadas",
    icon: Home,
    titleKey: "salesTitle",
    descKey: "salesDesc",
    contentHu: [
      "Lakossági ingatlanok (lakások, házak, telkek) és gazdasági, ipari, mezőgazdasági ingatlanok értékesítésében és bérbeadásában nyújtunk segítséget.",
      "Az értékesítési folyamat minden lépésében támogatjuk: az ingatlan felmérésétől, az árazáson és hirdetésen át a szerződéskötésig.",
      "Bérbeadás esetén segítünk a megfelelő bérlő megtalálásában, a bérleti szerződés elkészítésében és a jogi háttér biztosításában.",
      "Vegye fel velünk a kapcsolatot, és találjuk meg együtt a legjobb megoldást!",
    ],
    contentEn: [
      "We help with the sale and rental of residential properties (apartments, houses, plots) as well as commercial, industrial, and agricultural properties.",
      "We support you at every step of the sales process: from property assessment, pricing, and advertising to contract signing.",
      "For rentals, we help find the right tenant, prepare the lease agreement, and ensure legal compliance.",
      "Contact us and let's find the best solution together!",
    ],
  },
  {
    slug: "ertekbecsles-ertekmeghatrozas",
    icon: FileText,
    titleKey: "appraisalTitle",
    descKey: "appraisalDesc",
    contentHu: [
      "Két szintű szolgáltatást kínálunk az Ön igényeinek megfelelően:",
      "Értékbecslés – a hivatalos, magasabb fokozat. Szükséges lehet banki hitelügyintézéshez, bírósági ügyekhez és jogi peres vitákhoz, hagyatéki eljáráshoz, válás esetén vagyonmegosztáshoz, valamint ingatlanértékesítés esetén.",
      "Értékmeghatározás – az egyszerűbb fokozat. Jellemzően akkor kérik, ha valaki el szeretné adni az ingatlanát és szeretné tudni annak piaci értékét.",
      "Tapasztalt, akkreditált szakértőkkel dolgozunk, akik pontos és megbízható értékelést készítenek.",
    ],
    contentEn: [
      "We offer two levels of service to match your needs:",
      "Property Appraisal – the official, higher level. May be required for bank mortgage processing, court cases and legal disputes, inheritance proceedings, property division in divorce, and property sales.",
      "Value Determination – the simpler level. Typically requested when someone wants to sell their property and needs to know its market value.",
      "We work with experienced, accredited experts who provide accurate and reliable assessments.",
    ],
  },
  {
    slug: "belsoepiteszet-latvanyterv",
    icon: Sofa,
    titleKey: "interiorTitle",
    descKey: "interiorDesc",
    contentHu: [
      "Belsőépítészeti tanácsadás és 3D látványtervezés – közvetített szolgáltatásként.",
      "A tényleges munkát tapasztalt alvállalkozó belsőépítész végzi, mi a közvetítést és koordinációt biztosítjuk.",
      "Segítünk megálmodni és megvalósítani az Ön ideális otthonát, referencia munkáinkkal és 3D tervezéssel mutatjuk be az elképzelt végeredményt.",
      "Kérjük, töltse ki az alábbi űrlapot, és felvesszük Önnel a kapcsolatot!",
    ],
    contentEn: [
      "Interior design consulting and 3D visualization – provided as a brokered service.",
      "The actual work is carried out by an experienced subcontractor interior designer; we provide the brokering and coordination.",
      "We help you dream up and realize your ideal home, showcasing the envisioned result with our reference works and 3D design.",
      "Please fill out the form below and we will contact you!",
    ],
  },
  {
    slug: "teljeskoru-jogi-hatter",
    icon: Scale,
    titleKey: "legalTitle",
    descKey: "legalDesc",
    contentHu: [
      "Teljeskörű jogi háttér biztosítása minden ingatlanügylethez.",
      "Ügyvédi közreműködés, szerződésírás, jogi tanácsadás, tulajdoni lap ellenőrzés és tehermentesítés segítése.",
      "Hagyatéki végzések, tulajdonjogi kérdések és egyéb jogi ügyletek intézésében is segítünk.",
      "Biztosítjuk, hogy minden tranzakció jogilag megalapozott és biztonságos legyen.",
    ],
    contentEn: [
      "Full legal support for all real estate transactions.",
      "Legal assistance, contract drafting, legal consulting, title deed verification, and encumbrance removal.",
      "We also help with inheritance rulings, ownership issues, and other legal proceedings.",
      "We ensure that every transaction is legally sound and secure.",
    ],
  },
  {
    slug: "hitel-allami-tamogatasok",
    icon: Banknote,
    titleKey: "loanTitle",
    descKey: "loanDesc",
    contentHu: [
      "Segítünk ügyfeleinknek a banki hitelek és állami támogatások ügyintézésében, közvetítő szerepben.",
      "Lakáshitel, személyi kölcsön tájékoztatás és bankfüggetlen tanácsadás közvetítése.",
      "Állami támogatások (CSOK, Babaváró stb.) ügyintézésében segítségnyújtás.",
      "Fontos: A hiteligénylést a Gerecse Ingatlan nem intézi közvetlenül — a szolgáltatást közvetítjük.",
    ],
    contentEn: [
      "We help our clients with bank loan and government subsidy applications in a brokering role.",
      "We provide information on housing loans, personal loans, and broker independent advisory services.",
      "Assistance with government subsidies (CSOK, Babaváró, etc.) application processes.",
      "Important: Gerecse Ingatlan does not process loan applications directly — we broker the service.",
    ],
  },
  {
    slug: "energetikai-tanusitvany",
    icon: Zap,
    titleKey: "energyTitle",
    descKey: "energyDesc",
    contentHu: [
      "Energetikai tanúsítvány készítése ingatlan adásvételhez, bérbeadáshoz és pályázatokhoz.",
      "A tanúsítvány az épület energiahatékonyságát minősíti, és jogszabály által előírt dokumentum az ingatlan értékesítésénél.",
      "Tapasztalt, akkreditált szakértőinkkel gyors és megbízható ügyintézést biztosítunk.",
      "Vegye fel velünk a kapcsolatot részletekért és árajánlatért!",
    ],
    contentEn: [
      "Energy performance certificate for property sales, rentals, and grant applications.",
      "The certificate rates the energy efficiency of the building and is a legally required document when selling a property.",
      "With our experienced, accredited specialists we provide fast and reliable service.",
      "Contact us for details and a quote!",
    ],
  },
  {
    slug: "villamos-biztonsagi-felulvizsgalat",
    icon: ShieldCheck,
    titleKey: "electricalTitle",
    descKey: "electricalDesc",
    contentHu: [
      "Villamos Biztonsági Felülvizsgálat (VBF) ingatlanokhoz, üzlethelyiségekhez és ipari létesítményekhez.",
      "A felülvizsgálat célja az elektromos hálózat biztonságos állapotának ellenőrzése és a jogszabályi előírások teljesítése.",
      "Szakképzett villamos biztonságtechnikai felülvizsgálókkal dolgozunk, akik hivatalos jegyzőkönyvet állítanak ki.",
      "Kérjen árajánlatot a részletekért és az időpont egyeztetésért!",
    ],
    contentEn: [
      "Electrical Safety Inspection (VBF) for residential, commercial, and industrial properties.",
      "The inspection verifies the safe condition of the electrical network and compliance with legal requirements.",
      "We work with certified electrical safety inspectors who issue an official report.",
      "Request a quote for details and to schedule an appointment!",
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(s => s.slug === slug);
}
