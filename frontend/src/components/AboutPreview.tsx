import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import { Link } from "react-router-dom";
import AnimatedCounter from "./AnimatedCounter";
import RichText from "./RichText";

const AboutPreview = () => {
  const { t, localePath } = useLanguage();
  const { content: aboutTitle } = useContentBlock("/", "about.title", t.about.title);
  const { content: aboutText } = useContentBlock("/", "about.text", t.about.desc);
  const { content: yearsLabel } = useContentBlock("/", "about.counter.years", t.about.years);
  const { content: soldLabel } = useContentBlock("/", "about.counter.sold", t.about.sold);
  const { content: clientsLabel } = useContentBlock("/", "about.counter.clients", t.about.clients);
  const { content: ctaLabel } = useContentBlock("/", "about.cta.label", t.about.more);

  return (
    <section className="py-16 bg-background" aria-labelledby="about-preview-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 id="about-preview-heading" data-editable="about.title" data-page="/" className="text-3xl md:text-4xl font-heading font-bold text-dark-green mb-4">{aboutTitle}</h2>
          <RichText content={aboutText} data-editable="about.text" data-page="/" className="text-base text-muted-foreground font-body leading-relaxed" />
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-10">
          <div data-editable="about.counter.years" data-page="/">
            <AnimatedCounter target={10} label={yearsLabel} />
          </div>
          <div data-editable="about.counter.sold" data-page="/">
            <AnimatedCounter target={350} label={soldLabel} />
          </div>
          <div data-editable="about.counter.clients" data-page="/">
            <AnimatedCounter target={500} label={clientsLabel} />
          </div>
        </div>

        <div className="text-center">
          <Link
            to={localePath("/bemutatkozas")}
            className="inline-block px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            data-editable="about.cta.label"
            data-page="/"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
