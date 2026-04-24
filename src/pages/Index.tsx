import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import NewsletterSection from "@/components/NewsletterSection";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

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
