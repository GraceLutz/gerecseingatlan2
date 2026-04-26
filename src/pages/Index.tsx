import { useMemo } from "react";
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

  const jsonLd = useMemo(() => [
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
  ], [t.nav.home]);

  return (
    <Layout title={t.seo.homeTitle} description={t.seo.homeDescription} canonicalPath="/" jsonLd={jsonLd}>
      <HeroSection />
      <SearchSection />
      <FeaturedProperties />
      <NewsletterSection />
    </Layout>
  );
};

export default Index;
