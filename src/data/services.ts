import { Home, FileText, Scale, Banknote, Sofa, Zap, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Metadata for a service page — content is loaded from the CMS database. */
export interface Service {
  slug: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

export const services: Service[] = [
  {
    slug: "ingatlan-ertekesites-berbeadas",
    icon: Home,
    titleKey: "salesTitle",
    descKey: "salesDesc",
  },
  {
    slug: "ertekbecsles-ertekmeghatrozas",
    icon: FileText,
    titleKey: "appraisalTitle",
    descKey: "appraisalDesc",
  },
  {
    slug: "belsoepiteszet-latvanyterv",
    icon: Sofa,
    titleKey: "interiorTitle",
    descKey: "interiorDesc",
  },
  {
    slug: "teljeskoru-jogi-hatter",
    icon: Scale,
    titleKey: "legalTitle",
    descKey: "legalDesc",
  },
  {
    slug: "hitel-allami-tamogatasok",
    icon: Banknote,
    titleKey: "loanTitle",
    descKey: "loanDesc",
  },
  {
    slug: "energetikai-tanusitvany",
    icon: Zap,
    titleKey: "energyTitle",
    descKey: "energyDesc",
  },
  {
    slug: "villamos-biztonsagi-felulvizsgalat",
    icon: ShieldCheck,
    titleKey: "electricalTitle",
    descKey: "electricalDesc",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(s => s.slug === slug);
}
