import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { services } from "@/data/services";

const ServicesPage = () => {
  const { t, lang, localePath } = useLanguage();

  const whyUs = [
    {
      hu: "Személyre szabott tanácsadás minden ügyfélnek",
      en: "Personalized advice for every client",
    },
    {
      hu: "Helyi piaci szakértelem a Gerecse régióban",
      en: "Local market expertise in the Gerecse region",
    },
    {
      hu: "Átfogó szolgáltatások egy helyen",
      en: "Comprehensive services in one place",
    },
    {
      hu: "Átlátható díjak, nincsenek rejtett költségek",
      en: "Transparent fees, no hidden costs",
    },
  ];

  const seoTitle = lang === "hu"
    ? "Szolgáltatásaink – Gerecse Ingatlan"
    : "Our Services – Gerecse Ingatlan";
  const seoDescription = lang === "hu"
    ? "Ingatlan adásvétel, értékbecslés, jogi háttér, hiteltanácsadás, belsőépítészet és energetika – teljes körű szolgáltatások."
    : "Property sales, valuation, legal support, mortgage consulting, interior design and energy certification – comprehensive services.";

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/szolgaltatasok">
      <section className="bg-dark-green py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">
          {t.services.title}
        </h1>
        <p className="text-primary-foreground/70 font-body mt-2">
          {t.services.subtitle}
        </p>
      </section>

      <section className="py-16 bg-background" aria-labelledby="services-grid-heading">
        <div className="container mx-auto px-4">
          <h2 id="services-grid-heading" className="sr-only">
            {t.services.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.slug}
                  to={localePath(`/${service.slug}`)}
                  className="group bg-card rounded-xl p-8 shadow-sm hover:shadow-lg transition-all border border-border hover:border-primary/30 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon
                      size={30}
                      className="text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {t.services[service.titleKey]}
                  </h3>
                  <p className="text-muted-foreground font-body leading-relaxed mb-4">
                    {t.services[service.descKey]}
                  </p>
                  <span className="text-primary font-semibold group-hover:text-gold transition-colors">
                    {t.services.more} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 bg-light-bg" aria-labelledby="why-us-heading">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2
            id="why-us-heading"
            className="text-2xl md:text-3xl font-heading font-bold text-dark-green text-center mb-8"
          >
            {lang === "hu" ? "Miért minket válasszon?" : "Why choose us?"}
          </h2>
          <ul className="space-y-4">
            {whyUs.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle
                  size={20}
                  className="text-gold shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground font-body">
                  {lang === "hu" ? item.hu : item.en}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-dark-green text-center">
        <div className="container mx-auto px-4">
          <p className="text-xl font-heading font-semibold text-primary-foreground mb-4">
            {lang === "hu"
              ? "Kérdése van szolgáltatásainkkal kapcsolatban?"
              : "Have questions about our services?"}
          </p>
          <Link
            to={localePath("/kapcsolat")}
            className="inline-block px-8 py-3 bg-gold text-white font-semibold rounded-lg hover:bg-gold/90 transition-colors"
          >
            {t.contact.title}
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
