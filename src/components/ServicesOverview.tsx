import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Home, FileText, Scale, Banknote, Paintbrush, Sofa } from "lucide-react";

const services = [
  { icon: Home, titleKey: "salesTitle" as const, descKey: "salesDesc" as const, path: "/adas-vetel-berbeadas" },
  { icon: FileText, titleKey: "valuationTitle" as const, descKey: "valuationDesc" as const, path: "/ertekbecsles" },
  { icon: Scale, titleKey: "legalTitle" as const, descKey: "legalDesc" as const, path: "/jogi-hatter" },
  { icon: Banknote, titleKey: "loanTitle" as const, descKey: "loanDesc" as const, path: "/hitel-tamogatasok" },
  { icon: Paintbrush, titleKey: "stagingTitle" as const, descKey: "stagingDesc" as const, path: "/home-staging" },
  { icon: Sofa, titleKey: "interiorTitle" as const, descKey: "interiorDesc" as const, path: "/belsoepiteszet" },
];

const ServicesOverview = () => {
  const { t, localePath } = useLanguage();

  return (
    <section className="py-16 bg-light-bg" aria-labelledby="services-heading">
      <div className="container mx-auto px-4">
        <h2 id="services-heading" className="text-3xl md:text-4xl font-heading font-bold text-dark-green text-center mb-3">
          {t.services.title}
        </h2>
        <p className="text-center text-muted-foreground font-body mb-10 max-w-2xl mx-auto">
          {t.services.subtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => {
            const Icon = service.icon;
            return (
              <Link
                key={service.path}
                to={localePath(service.path)}
                className="group bg-card rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div
                  className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                  aria-hidden="true"
                >
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {t.services[service.titleKey]}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-3">
                  {t.services[service.descKey]}
                </p>
                <span className="text-sm font-semibold text-primary group-hover:text-gold transition-colors">
                  {t.services.more} →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
