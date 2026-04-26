import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock, useContentArray } from "@/contexts/ContentContext";
import { buildBreadcrumbJsonLd } from "@/components/SEOHead";
import { useMemo } from "react";
import { Award, Users, Heart, Eye, XCircle, Quote } from "lucide-react";
import RichText from "@/components/RichText";

const ORIGIN = "https://gerecseingatlan.hu";

const IntroductionPage = () => {
  const { t, lang } = useLanguage();
  const { content: introTitle } = useContentBlock("/bemutatkozas", "intro.title", "");
  const { content: aboutHeading } = useContentBlock("/bemutatkozas", "intro.aboutHeading", "");
  const { content: introText } = useContentBlock("/bemutatkozas", "intro.text", "");
  const { content: missionTitle } = useContentBlock("/bemutatkozas", "mission.title", "");
  const { content: missionText } = useContentBlock("/bemutatkozas", "mission.text", "");
  const { content: heroSubtitle } = useContentBlock("/bemutatkozas", "intro.heroSubtitle", "");
  const { content: motto } = useContentBlock("/bemutatkozas", "intro.motto", "");
  const { content: notRightFitTitle } = useContentBlock("/bemutatkozas", "intro.notRightFit.title", "");
  const { items: values } = useContentArray("/bemutatkozas", "intro.values", []);
  const { items: notRightFitItems } = useContentArray("/bemutatkozas", "intro.notRightFit.items", []);
  const { content: valuesHeading } = useContentBlock("/bemutatkozas", "intro.valuesHeading", "");

  const valueIcons = [Award, Users, Heart, Eye] as const;

  const jsonLd = useMemo(() => buildBreadcrumbJsonLd([
    { name: t.nav.home, url: ORIGIN },
    { name: t.seo.introductionTitle, url: `${ORIGIN}/bemutatkozas` },
  ]), [t.nav.home, t.seo.introductionTitle]);

  return (
    <Layout title={t.seo.introductionTitle} description={t.seo.introductionDescription} canonicalPath="/bemutatkozas" jsonLd={jsonLd}>
      {/* Hero */}
      <section className="bg-dark-green py-20 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 data-editable="intro.title" data-page="/bemutatkozas" className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-6">
            {introTitle}
          </h1>
          <p data-editable="intro.heroSubtitle" data-page="/bemutatkozas" className="text-lg md:text-xl text-primary-foreground/90 font-body leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          <div>
            <h2 data-editable="intro.aboutHeading" data-page="/bemutatkozas" className="text-2xl font-heading font-bold text-dark-green mb-4">
              {aboutHeading}
            </h2>
            <RichText
              content={introText}
              data-editable="intro.text"
              data-page="/bemutatkozas"
              className="text-muted-foreground font-body leading-relaxed text-lg"
            />
          </div>

          <div>
            <h2 data-editable="mission.title" data-page="/bemutatkozas" className="text-2xl font-heading font-bold text-dark-green mb-4">
              {missionTitle}
            </h2>
            <RichText
              content={missionText}
              data-editable="mission.text"
              data-page="/bemutatkozas"
              className="text-muted-foreground font-body leading-relaxed text-lg"
            />
          </div>
        </div>
      </section>

      {/* Motto */}
      <section className="py-12 bg-gold/10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Quote size={40} className="mx-auto mb-4 text-gold" aria-hidden="true" />
          <p className="text-2xl md:text-3xl font-heading font-semibold text-dark-green mb-2">{t.introduction.mottoLabel}</p>
          <blockquote
            className="text-2xl md:text-3xl font-heading font-bold text-dark-green italic"
            data-editable="intro.motto"
            data-page="/bemutatkozas"
          >
            &ldquo;{motto}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 bg-light-bg" aria-labelledby="values-heading">
        <div className="container mx-auto px-4">
          <h2 id="values-heading" data-editable="intro.valuesHeading" data-page="/bemutatkozas" className="text-2xl font-heading font-bold text-dark-green text-center mb-8">
            {valuesHeading}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto" data-editable="intro.values" data-page="/bemutatkozas">
            {values.map((label, i) => {
              const Icon = valueIcons[i] ?? Award;
              return (
                <div key={i} className="text-center">
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
          <h2
            className="text-2xl font-heading font-bold text-dark-green mb-2 text-center"
            data-editable="intro.notRightFit.title"
            data-page="/bemutatkozas"
          >
            {notRightFitTitle}
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            😉
          </p>
          <ul className="space-y-4" data-editable="intro.notRightFit.items" data-page="/bemutatkozas">
            {notRightFitItems.map((item, i) => (
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
