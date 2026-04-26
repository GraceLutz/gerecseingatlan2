import { useEffect } from "react";
import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import NewsletterSection from "@/components/NewsletterSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildBreadcrumbJsonLd } from "@/components/SEOHead";

const ORIGIN = "https://gerecseingatlan.hu";

const Index = () => {
  const { t } = useLanguage();

  useEffect(() => {
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Gerecse Ingatlan",
        url: ORIGIN,
        inLanguage: ["hu", "en"],
        potentialAction: {
          "@type": "SearchAction",
          target: `${ORIGIN}/ingatlanok?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      buildBreadcrumbJsonLd([{ name: t.nav.home, url: ORIGIN }]),
    ];
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-page-jsonld", "true");
    script.textContent = JSON.stringify(schemas);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [t.nav.home]);

  return (
    <Layout title={t.seo.homeTitle} description={t.seo.homeDescription} canonicalPath="/">
      <HeroSection />
      <SearchSection />
      <FeaturedProperties />
      <NewsletterSection />
    </Layout>
  );
};

export default Index;
