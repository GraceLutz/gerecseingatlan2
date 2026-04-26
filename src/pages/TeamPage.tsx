import Layout from "@/components/Layout";
import TeamSection from "@/components/TeamSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildBreadcrumbJsonLd } from "@/components/SEOHead";
import { useEffect } from "react";

const ORIGIN = "https://gerecseingatlan.hu";

const TeamPage = () => {
  const { t } = useLanguage();

  const seoTitle = t.seo.teamTitle;
  const seoDescription = t.seo.teamDescription;

  useEffect(() => {
    const schema = buildBreadcrumbJsonLd([
      { name: t.nav.home, url: ORIGIN },
      { name: seoTitle, url: `${ORIGIN}/munkatarsaink` },
    ]);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-page-jsonld", "true");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [t.nav.home, seoTitle]);

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/munkatarsaink">
      <TeamSection />
    </Layout>
  );
};

export default TeamPage;
