import Layout from "@/components/Layout";
import TeamSection from "@/components/TeamSection";
import { useLanguage } from "@/contexts/LanguageContext";

const TeamPage = () => {
  const { lang } = useLanguage();

  const seoTitle = lang === "hu"
    ? "Csapatunk – Gerecse Ingatlan"
    : "Our Team – Gerecse Ingatlan";
  const seoDescription = lang === "hu"
    ? "Ismerje meg a Gerecse Ingatlan csapatát – tapasztalt szakértők az Ön szolgálatában."
    : "Meet the Gerecse Ingatlan team – experienced experts at your service.";

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/munkatarsaink">
      <TeamSection />
    </Layout>
  );
};

export default TeamPage;
