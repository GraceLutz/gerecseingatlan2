import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Award, Heart, Eye } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import Testimonials from "@/components/Testimonials";
import TeamSection from "@/components/TeamSection";
import PartnerLogos from "@/components/PartnerLogos";

const AboutPage = () => {
  const { t, lang } = useLanguage();

  const values = [
    { icon: Award, labelHu: "Megbízhatóság", labelEn: "Reliability" },
    { icon: Users, labelHu: "Szakértelem", labelEn: "Expertise" },
    { icon: Heart, labelHu: "Odafigyelés", labelEn: "Personal care" },
    { icon: Eye, labelHu: "Átláthatóság", labelEn: "Transparency" },
  ];

  const seoTitle = lang === "hu"
    ? "Rólunk – Gerecse Ingatlan"
    : "About Us – Gerecse Ingatlan";
  const seoDescription = lang === "hu"
    ? "Ismerje meg a Gerecse Ingatlan csapatát, történetünket, küldetésünket és értékeinket."
    : "Learn about the Gerecse Ingatlan team, our history, mission and values.";

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/rolunk">
      {/* Hero */}
      <section className="bg-dark-green py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-3">
          {t.about.title}
        </h1>
        <p className="text-lg text-primary-foreground/70 font-body">
          {t.about.subtitle}
        </p>
      </section>

      {/* History & Mission */}
      <section id="bemutatkozas" className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          <div>
            <h2 className="text-2xl font-heading font-bold text-dark-green mb-4">
              {t.about.history}
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed">
              {t.about.historyText}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-dark-green mb-4">
              {t.about.mission}
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed">
              {t.about.missionText}
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-dark-green mb-4">
              {t.about.values}
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed">
              {t.about.valuesText}
            </p>
          </div>
        </div>
      </section>

      {/* Animated Counters */}
      <section className="py-12 bg-dark-green">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <AnimatedCounter target={10} label={t.about.years} />
            <AnimatedCounter target={350} label={t.about.sold} />
            <AnimatedCounter target={500} label={t.about.clients} />
          </div>
        </div>
      </section>

      {/* Values icons */}
      <section className="py-12 bg-gold/10" aria-labelledby="values-heading">
        <div className="container mx-auto px-4">
          <h2 id="values-heading" className="sr-only">
            {t.about.values}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {values.map(({ icon: Icon, labelHu, labelEn }) => {
              const label = lang === "hu" ? labelHu : labelEn;
              return (
                <div key={label} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center">
                    <Icon size={28} className="text-gold" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <TeamSection />

      {/* Testimonials */}
      <Testimonials />

      {/* Partners */}
      <PartnerLogos />
    </Layout>
  );
};

export default AboutPage;
