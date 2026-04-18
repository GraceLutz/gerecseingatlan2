import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, CheckCircle, Send } from "lucide-react";
import { services, getServiceBySlug } from "@/data/services";

/** EN slug → HU slug mapping for service pages */
const enToHuServiceSlug: Record<string, string> = {
  "property-sales-and-rentals": "ingatlan-ertekesites-berbeadas",
  "appraisal-and-valuation": "ertekbecsles-ertekmeghatrozas",
  "interior-design": "belsoepiteszet-latvanyterv",
  "full-legal-support": "teljeskoru-jogi-hatter",
  "loans-and-subsidies": "hitel-allami-tamogatasok",
};

/** Benefits data per service slug (not in shared data since only used here) */
const benefitsMap: Record<string, { hu: string[]; en: string[] }> = {
  "ingatlan-ertekesites-berbeadas": {
    hu: ["Ingyenes ingatlan értékelés", "Professzionális fotózás és hirdetés", "Teljes körű ügyintézés", "Szerződéskötés segítése"],
    en: ["Free property evaluation", "Professional photography and advertising", "Full administrative support", "Contract assistance"],
  },
  "ertekbecsles-ertekmeghatrozas": {
    hu: ["Hivatalos, akkreditált értékbecslők", "Hiteligényléshez elfogadott", "Piaci összehasonlító elemzés", "Gyors és pontos értékelés"],
    en: ["Official, accredited appraisers", "Accepted for mortgage applications", "Market comparative analysis", "Fast and accurate valuation"],
  },
  "belsoepiteszet-latvanyterv": {
    hu: ["3D látványtervezés", "Teljes belsőépítészeti koncepció", "Referencia munkák bemutatása", "Közvetített szolgáltatás"],
    en: ["3D visualization", "Complete interior design concept", "Reference work showcase", "Brokered service"],
  },
  "teljeskoru-jogi-hatter": {
    hu: ["Tapasztalt ingatlan ügyvédek", "Tulajdoni lap ellenőrzés", "Teljes jogi háttér biztosítása", "Hagyatéki ügyek intézése"],
    en: ["Experienced real estate lawyers", "Title deed verification", "Complete legal support", "Inheritance proceedings"],
  },
  "hitel-allami-tamogatasok": {
    hu: ["Bankfüggetlen tanácsadás", "CSOK és Babaváró ügyintézés", "Személyre szabott hitelajánlatok"],
    en: ["Bank-independent advice", "CSOK and Babaváró processing", "Personalized loan offers"],
  },
};

const ServiceDetailPage = () => {
  const { lang, t, localePath } = useLanguage();
  const { slug } = useParams();

  // Resolve EN slugs to HU slugs for lookup
  const resolvedSlug = slug ? (enToHuServiceSlug[slug] || slug) : undefined;
  const service = resolvedSlug ? getServiceBySlug(resolvedSlug) : undefined;

  if (!service) {
    return (
      <Layout>
        <div className="py-32 text-center text-muted-foreground">
          {lang === "hu" ? "Az oldal nem található." : "Page not found."}
        </div>
      </Layout>
    );
  }

  const title = t.services[service.titleKey];
  const seoTitle = `${title} – Gerecse Ingatlan`;
  const seoDescription = lang === "hu"
    ? `${title} – professzionális ingatlanszolgáltatás a Gerecse régióban. Kérjen ajánlatot!`
    : `${title} – professional real estate service in the Gerecse region. Request a quote!`;
  const content = lang === "hu" ? service.contentHu : service.contentEn;
  const benefitData = resolvedSlug ? benefitsMap[resolvedSlug] : undefined;
  const benefits = benefitData ? (lang === "hu" ? benefitData.hu : benefitData.en) : [];
  const Icon = service.icon;

  const relatedServices = services.filter((s) => s.slug !== resolvedSlug).slice(0, 3);

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath={`/${resolvedSlug}`}>
      <section className="bg-dark-green py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <Icon size={28} className="text-gold" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">
          {title}
        </h1>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to={localePath("/")}
            className="inline-flex items-center gap-2 text-primary hover:text-gold mb-8 font-semibold text-sm transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t.nav.home}
          </Link>

          <div className="space-y-4 mb-12">
            {content.map((paragraph, i) => (
              <p
                key={i}
                className="text-muted-foreground font-body leading-relaxed text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="mb-12 p-6 bg-light-bg rounded-xl">
              <h2 className="text-lg font-heading font-bold text-dark-green mb-4">
                {lang === "hu" ? "Előnyök" : "Benefits"}
              </h2>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className="text-gold shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground font-body">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact CTA / Interior Design Form */}
          {resolvedSlug === "belsoepiteszet-latvanyterv" ? (
            <InteriorContactForm lang={lang} />
          ) : (
            <div className="p-8 bg-dark-green rounded-xl text-center">
              <p className="text-lg font-heading font-semibold text-primary-foreground mb-4">
                {lang === "hu"
                  ? "Érdekli a szolgáltatásunk?"
                  : "Interested in our service?"}
              </p>
              <Link
                to={localePath("/kapcsolat")}
                className="inline-block px-8 py-3 bg-gold text-white font-semibold rounded-lg hover:bg-gold/90 transition-colors"
              >
                {t.contact.title}
              </Link>
            </div>
          )}

          {/* Related services */}
          {relatedServices.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-heading font-bold text-dark-green mb-6">
                {lang === "hu"
                  ? "További szolgáltatásaink"
                  : "Our other services"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedServices.map((rel) => {
                  const RelIcon = rel.icon;
                  return (
                    <Link
                      key={rel.slug}
                      to={localePath(`/${rel.slug}`)}
                      className="group bg-card rounded-lg p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <RelIcon
                          size={20}
                          className="text-primary"
                          aria-hidden="true"
                        />
                        <h3 className="text-sm font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                          {t.services[rel.titleKey]}
                        </h3>
                      </div>
                      <span className="text-xs text-primary font-semibold group-hover:text-gold transition-colors">
                        {t.services.more} →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

/** Dedicated contact form for Interior Design service — data goes to Gerecse Ingatlan for tracking */
const InteriorContactForm: React.FC<{ lang: string }> = ({ lang }) => {
  const [submitted, setSubmitted] = useState(false);
  const isHu = lang === "hu";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: connect to backend/email endpoint
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 bg-light-bg rounded-xl text-center">
        <p className="text-lg font-heading font-semibold text-dark-green">
          {isHu
            ? "Köszönjük megkeresését! Hamarosan felvesszük Önnel a kapcsolatot."
            : "Thank you for your inquiry! We will contact you shortly."}
        </p>
      </div>
    );
  }

  const fieldClass = "w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors";

  return (
    <div className="p-8 bg-light-bg rounded-xl">
      <h2 className="text-xl font-heading font-bold text-dark-green mb-2">
        {isHu ? "Belsőépítészeti ajánlatkérés" : "Interior Design Inquiry"}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {isHu
          ? "Töltse ki az alábbi űrlapot, és felvesszük Önnel a kapcsolatot a részletekkel kapcsolatban."
          : "Fill out the form below and we will contact you with details."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="interior-name" className="block text-sm font-semibold text-foreground mb-1">
            {isHu ? "Név" : "Name"} *
          </label>
          <input id="interior-name" type="text" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="interior-email" className="block text-sm font-semibold text-foreground mb-1">
            E-mail *
          </label>
          <input id="interior-email" type="email" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="interior-phone" className="block text-sm font-semibold text-foreground mb-1">
            {isHu ? "Telefonszám" : "Phone"}
          </label>
          <input id="interior-phone" type="tel" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="interior-address" className="block text-sm font-semibold text-foreground mb-1">
            {isHu ? "Ingatlan címe / helyszín" : "Property address / location"}
          </label>
          <input id="interior-address" type="text" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="interior-message" className="block text-sm font-semibold text-foreground mb-1">
            {isHu ? "Üzenet, elképzelések" : "Message, ideas"} *
          </label>
          <textarea id="interior-message" required rows={4} className={fieldClass} />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
        >
          <Send size={16} aria-hidden="true" />
          {isHu ? "Ajánlatkérés küldése" : "Send inquiry"}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          {isHu
            ? "Az adatokat a Gerecse Ingatlan kezeli, és továbbítja a belsőépítész partnernek."
            : "Data is managed by Gerecse Ingatlan and forwarded to the interior design partner."}
        </p>
      </form>
    </div>
  );
};

export default ServiceDetailPage;
