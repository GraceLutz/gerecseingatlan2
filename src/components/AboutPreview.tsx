import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import AnimatedCounter from "./AnimatedCounter";

const AboutPreview = () => {
  const { t, localePath } = useLanguage();

  return (
    <section className="py-16 bg-background" aria-labelledby="about-preview-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 id="about-preview-heading" className="text-3xl md:text-4xl font-heading font-bold text-dark-green mb-4">{t.about.title}</h2>
          <p className="text-base text-muted-foreground font-body leading-relaxed">{t.about.desc}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-10">
          <AnimatedCounter target={10} label={t.about.years} />
          <AnimatedCounter target={350} label={t.about.sold} />
          <AnimatedCounter target={500} label={t.about.clients} />
        </div>

        <div className="text-center">
          <Link
            to={localePath("/bemutatkozas")}
            className="inline-block px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {t.about.more}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
