import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import { Link } from "react-router-dom";
import { Home, FileText, Scale, Banknote, Zap, Sofa } from "lucide-react";

const services = [
  { icon: Home, titleKey: "salesTitle" as const, descKey: "salesDesc" as const, path: "/ingatlan-ertekesites-berbeadas" },
  { icon: FileText, titleKey: "appraisalTitle" as const, descKey: "appraisalDesc" as const, path: "/ertekbecsles-ertekmeghatrozas" },
  { icon: Scale, titleKey: "legalTitle" as const, descKey: "legalDesc" as const, path: "/teljeskoru-jogi-hatter" },
  { icon: Banknote, titleKey: "loanTitle" as const, descKey: "loanDesc" as const, path: "/hitel-allami-tamogatasok" },
  { icon: Zap, titleKey: "energyTitle" as const, descKey: "energyDesc" as const, path: "/energetikai-tanusitvany" },
  { icon: Sofa, titleKey: "interiorTitle" as const, descKey: "interiorDesc" as const, path: "/belsoepiteszet-latvanyterv" },
];

function ServiceCard({ service }: { service: typeof services[number] }) {
  const { t, localePath } = useLanguage();
  const Icon = service.icon;
  const { content: title } = useContentBlock("/", `services.${service.titleKey}`, t.services[service.titleKey]);
  const { content: desc } = useContentBlock("/", `services.${service.descKey}`, t.services[service.descKey]);
  const { content: moreText } = useContentBlock("/", "services.more", t.services.more);

  return (
    <Link
      to={localePath(service.path)}
      className="group bg-card rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <div
        className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
        aria-hidden="true"
      >
        <Icon size={24} className="text-primary" />
      </div>
      <h3 data-editable={`services.${service.titleKey}`} data-page="/" className="text-lg font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p data-editable={`services.${service.descKey}`} data-page="/" className="text-sm text-muted-foreground font-body leading-relaxed mb-3">
        {desc}
      </p>
      <span data-editable="services.more" data-page="/" className="text-sm font-semibold text-primary group-hover:text-gold transition-colors">
        {moreText} →
      </span>
    </Link>
  );
}

const ServicesOverview = () => {
  const { t } = useLanguage();
  const { content: servicesTitle } = useContentBlock("/", "services.title", t.services.title);
  const { content: servicesSubtitle } = useContentBlock("/", "services.subtitle", t.services.subtitle);

  return (
    <section className="py-16 bg-light-bg" aria-labelledby="services-heading">
      <div className="container mx-auto px-4">
        <h2 id="services-heading" data-editable="services.title" data-page="/" className="text-3xl md:text-4xl font-heading font-bold text-dark-green text-center mb-3">
          {servicesTitle}
        </h2>
        <p data-editable="services.subtitle" data-page="/" className="text-center text-muted-foreground font-body mb-10 max-w-2xl mx-auto">
          {servicesSubtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard key={service.path} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
