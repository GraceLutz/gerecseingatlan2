import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import SearchSection from "@/components/SearchSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import NewsletterSection from "@/components/NewsletterSection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <SearchSection />
      <FeaturedProperties />
      <NewsletterSection />
    </Layout>
  );
};

export default Index;
