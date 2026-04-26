import Layout from "@/components/Layout";
import TeamSection from "@/components/TeamSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildBreadcrumbJsonLd } from "@/components/SEOHead";
import { useMemo } from "react";

const ORIGIN = "https://gerecseingatlan.hu";

const TeamPage = () => {
  const { t } = useLanguage();

  const seoTitle = t.seo.teamTitle;
  const seoDescription = t.seo.teamDescription;

  const jsonLd = useMemo(() => buildBreadcrumbJsonLd([
    { name: t.nav.home, url: ORIGIN },
    { name: seoTitle, url: `${ORIGIN}/munkatarsaink` },
  ]), [t.nav.home, seoTitle]);

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/munkatarsaink" jsonLd={jsonLd}>
      <TeamSection />
    </Layout>
  );
};

export default TeamPage;
