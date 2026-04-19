import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Award, Users, Heart, Eye, XCircle, Quote } from "lucide-react";

const IntroductionPage = () => {
  const { t } = useLanguage();

  const valueIcons = [Award, Users, Heart, Eye] as const;
  const valueKeys = ["reliability", "expertise", "care", "transparency"] as const;

  return (
    <Layout title={t.seo.introductionTitle} description={t.seo.introductionDescription} canonicalPath="/bemutatkozas">
      {/* Hero */}
      <section className="bg-dark-green py-20 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-6">
            {t.introduction.heading}
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 font-body leading-relaxed">
            {t.introduction.heroSubtitle}
          </p>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          <div>
            <h2 className="text-2xl font-heading font-bold text-dark-green mb-4">
              {t.introduction.aboutTitle}
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg">
              {t.introduction.aboutText}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold text-dark-green mb-4">
              {t.introduction.missionTitle}
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg">
              {t.introduction.missionText}
            </p>
          </div>
        </div>
      </section>

      {/* Motto */}
      <section className="py-12 bg-gold/10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Quote size={40} className="mx-auto mb-4 text-gold" aria-hidden="true" />
          <blockquote className="text-2xl md:text-3xl font-heading font-bold text-dark-green italic">
            &ldquo;{t.introduction.motto}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 bg-gold/10" aria-labelledby="values-heading">
        <div className="container mx-auto px-4">
          <h2 id="values-heading" className="text-2xl font-heading font-bold text-dark-green text-center mb-8">
            {t.about.values}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {valueKeys.map((key, i) => {
              const Icon = valueIcons[i];
              const label = t.introduction.values[key];
              return (
                <div key={key} className="text-center">
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

      {/* When We're Not the Right Fit */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-heading font-bold text-dark-green mb-2 text-center">
            {t.introduction.notRightFitTitle}
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            😉
          </p>
          <ul className="space-y-4">
            {t.introduction.notRightFitItems.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 bg-card rounded-lg p-4 shadow-sm">
                <XCircle size={22} className="text-gold shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-foreground font-body leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

    </Layout>
  );
};

export default IntroductionPage;
