import Layout from "@/components/Layout";
import Testimonials from "@/components/Testimonials";
import { useLanguage } from "@/contexts/LanguageContext";

const TestimonialsPage = () => {
  const { lang } = useLanguage();

  const seoTitle = lang === "hu"
    ? "Vélemények – Gerecse Ingatlan"
    : "Testimonials – Gerecse Ingatlan";
  const seoDescription = lang === "hu"
    ? "Ügyfeleink véleményei a Gerecse Ingatlan szolgáltatásairól."
    : "What our clients say about Gerecse Ingatlan services.";

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/velemenyek">
      <Testimonials />
    </Layout>
  );
};

export default TestimonialsPage;
