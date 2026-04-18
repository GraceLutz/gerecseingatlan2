import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import NewsletterSection from "@/components/NewsletterSection";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { lang } = useLanguage();

  const title = lang === "hu"
    ? "Gerecse Ingatlan – Ingatlanközvetítés a Gerecse régióban"
    : "Gerecse Ingatlan – Real Estate in the Gerecse Region";
  const description = lang === "hu"
    ? "Professzionális ingatlanszolgáltatások a Gerecse régióban. Eladó és kiadó ingatlanok, értékbecslés, jogi háttér, hiteltanácsadás."
    : "Professional real estate services in the Gerecse region. Properties for sale and rent, valuation, legal support, mortgage consulting.";

  return (
    <Layout title={title} description={description} canonicalPath="/">
      <HeroSection />
      <SearchSection />
      <FeaturedProperties />
      <NewsletterSection />
    </Layout>
  );
};

export default Index;
