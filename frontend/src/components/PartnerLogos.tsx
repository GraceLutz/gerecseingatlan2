import { useLanguage } from "@/contexts/LanguageContext";

interface Partner {
  nameHu: string;
  nameEn: string;
  /** Short abbreviation shown when no logo image is available */
  abbrev: string;
}

const partners: Partner[] = [
  { nameHu: "Ingatlan Forrás 9", nameEn: "Ingatlan Forrás 9", abbrev: "IF9" },
  { nameHu: "OTP Bank", nameEn: "OTP Bank", abbrev: "OTP" },
  { nameHu: "K&H Bank", nameEn: "K&H Bank", abbrev: "K&H" },
  { nameHu: "Erste Bank", nameEn: "Erste Bank", abbrev: "EB" },
  { nameHu: "MNB", nameEn: "MNB", abbrev: "MNB" },
];

/**
 * Partner logos section with placeholder branding blocks.
 * When real logos become available, replace the placeholder divs with img elements.
 */
const PartnerLogos = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-12 bg-background" aria-labelledby="partners-heading">
      <div className="container mx-auto px-4">
        <h2
          id="partners-heading"
          className="text-xl font-heading font-semibold text-dark-green text-center mb-8"
        >
          {lang === "hu" ? "Partnereink" : "Our Partners"}
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 max-w-3xl mx-auto">
          {partners.map((partner) => (
            <div
              key={partner.abbrev}
              className="w-24 h-16 rounded-lg bg-muted flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
              title={lang === "hu" ? partner.nameHu : partner.nameEn}
              role="img"
              aria-label={lang === "hu" ? partner.nameHu : partner.nameEn}
            >
              <span className="text-sm font-heading font-bold text-muted-foreground">
                {partner.abbrev}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;
