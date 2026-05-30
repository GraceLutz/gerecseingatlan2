import Layout from "@/components/Layout";
import Testimonials from "@/components/Testimonials";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildBreadcrumbJsonLd } from "@/components/SEOHead";
import { useEffect } from "react";

const ORIGIN = "https://gerecseingatlan.hu";

const TestimonialsPage = () => {
  const { t } = useLanguage();

  const seoTitle = t.seo.testimonialsTitle;
  const seoDescription = t.seo.testimonialsDescription;

  useEffect(() => {
    const schema = buildBreadcrumbJsonLd([
      { name: t.nav.home, url: ORIGIN },
      { name: seoTitle, url: `${ORIGIN}/velemenyek` },
    ]);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-page-jsonld", "true");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [t.nav.home, seoTitle]);

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/velemenyek">
      <Testimonials />
    </Layout>
  );
};

export default TestimonialsPage;
