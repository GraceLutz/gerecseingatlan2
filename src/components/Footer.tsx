import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Footer = () => {
  const { t, localePath } = useLanguage();
  const [footerEmail, setFooterEmail] = useState("");
  const [footerGdpr, setFooterGdpr] = useState(false);
  const [footerSubmitted, setFooterSubmitted] = useState(false);
  const [footerError, setFooterError] = useState<string | null>(null);

  const handleFooterNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setFooterError(null);
    if (!EMAIL_REGEX.test(footerEmail) || !footerGdpr) return;
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: footerEmail.trim(), gdprConsent: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFooterError(data.error ?? t.newsletter.genericError);
        return;
      }
      setFooterEmail("");
      setFooterGdpr(false);
      setFooterSubmitted(true);
    } catch {
      setFooterError(t.newsletter.networkError);
    }
  };

  return (
    <footer role="contentinfo" className="bg-[#4682B4] text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact */}
          <div>
            <h3 className="text-lg font-heading font-bold text-gold mb-4">{t.contact.title}</h3>
            <address className="not-italic space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" aria-hidden="true" />
                <a href="tel:+36706132658" className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">+36 70 613 2658</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" aria-hidden="true" />
                <a href="mailto:info@gerecseingatlan.hu" className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">info@gerecseingatlan.hu</a>
              </div>
            </address>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-heading font-bold text-gold mb-4">{t.footer.quickLinks}</h3>
            <nav aria-label={t.footer.quickLinks} className="space-y-2 text-sm">
              <Link to={localePath("/")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.nav.home}</Link>
              <Link to={localePath("/bemutatkozas")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.nav.about}</Link>
              <Link to={localePath("/ingatlanok")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.nav.properties}</Link>
              <Link to={localePath("/kapcsolat")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.nav.contact}</Link>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-heading font-bold text-gold mb-4">{t.footer.services}</h3>
            <nav aria-label={t.footer.services} className="space-y-2 text-sm">
              <Link to={localePath("/ingatlan-ertekesites-berbeadas")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.services.salesTitle}</Link>
              <Link to={localePath("/ertekbecsles-ertekmeghatrozas")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.services.appraisalTitle}</Link>
              <Link to={localePath("/teljeskoru-jogi-hatter")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.services.legalTitle}</Link>
              <Link to={localePath("/hitel-allami-tamogatasok")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.services.loanTitle}</Link>
              <Link to={localePath("/energetikai-tanusitvany")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.services.energyTitle}</Link>
              <Link to={localePath("/belsoepiteszet-latvanyterv")} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.services.interiorTitle}</Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h3 id="footer-newsletter-heading" className="text-lg font-heading font-bold text-gold mb-4">{t.footer.newsletter}</h3>
            <p className="text-sm text-primary-foreground/80 mb-3">{t.newsletter.subtitle}</p>
            {footerSubmitted ? (
              <p className="text-sm text-gold font-semibold" role="status" aria-live="polite">
                ✓ {t.newsletter.success}
              </p>
            ) : (
              <form
                aria-labelledby="footer-newsletter-heading"
                onSubmit={handleFooterNewsletter}
                className="space-y-2"
                noValidate
              >
                <div className="flex gap-2">
                  <label htmlFor="footer-email" className="sr-only">{t.newsletter.placeholder}</label>
                  <input
                    id="footer-email"
                    type="email"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    placeholder={t.newsletter.placeholder}
                    required
                    autoComplete="email"
                    className="flex-1 px-3 py-2 text-sm rounded bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                  <button
                    type="submit"
                    aria-label={t.footer.subscribeLabel}
                    className="px-4 py-2 bg-gold text-accent-foreground font-semibold text-sm rounded hover:bg-gold/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4]"
                  >
                    OK
                  </button>
                </div>
                <label htmlFor="footer-gdpr" className="flex items-start gap-2 text-xs text-primary-foreground/70 cursor-pointer">
                  <input
                    id="footer-gdpr"
                    type="checkbox"
                    checked={footerGdpr}
                    onChange={(e) => setFooterGdpr(e.target.checked)}
                    aria-required="true"
                    className="mt-0.5 rounded accent-gold"
                  />
                  <span>{t.newsletter.gdpr}</span>
                </label>
                {footerError && (
                  <p role="alert" className="text-xs text-red-300">{footerError}</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/60">
          <p>{t.footer.copyright}</p>
          <nav aria-label={t.footer.legalInfo} className="flex flex-wrap gap-4">
            <Link to={localePath("/impresszum")} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.footer.imprint}</Link>
            <Link to={localePath("/adatkezelesi-tajekoztato")} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.footer.privacy}</Link>
            <Link to={localePath("/cookie-tajekoztato")} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.footer.cookies}</Link>
            <Link to={localePath("/aszf")} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{t.footer.terms}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
