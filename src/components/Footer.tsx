import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import { Mail, Phone } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PAGE = "/footer";

const Footer = () => {
  const { t, localePath } = useLanguage();
  const [footerEmail, setFooterEmail] = useState("");
  const [footerGdpr, setFooterGdpr] = useState(false);
  const [footerSubmitted, setFooterSubmitted] = useState(false);
  const [footerError, setFooterError] = useState<string | null>(null);

  const { content: contactTitle } = useContentBlock(PAGE, "contact.title", t.contact.title);
  const { content: contactPhone } = useContentBlock(PAGE, "contact.phone", "+36 70 613 2658");
  const { content: contactEmail } = useContentBlock(PAGE, "contact.email", "info@gerecseingatlan.hu");
  const { content: quickLinksTitle } = useContentBlock(PAGE, "quickLinks.title", t.footer.quickLinks);
  const { content: linkHome } = useContentBlock(PAGE, "links.home", t.nav.home);
  const { content: linkAbout } = useContentBlock(PAGE, "links.about", t.nav.about);
  const { content: linkProperties } = useContentBlock(PAGE, "links.properties", t.nav.properties);
  const { content: linkContact } = useContentBlock(PAGE, "links.contact", t.nav.contact);
  const { content: servicesTitle } = useContentBlock(PAGE, "services.title", t.footer.services);
  const { content: linkSales } = useContentBlock(PAGE, "links.sales", t.services.salesTitle);
  const { content: linkAppraisal } = useContentBlock(PAGE, "links.appraisal", t.services.appraisalTitle);
  const { content: linkLegal } = useContentBlock(PAGE, "links.legal", t.services.legalTitle);
  const { content: linkLoan } = useContentBlock(PAGE, "links.loan", t.services.loanTitle);
  const { content: linkEnergy } = useContentBlock(PAGE, "links.energy", t.services.energyTitle);
  const { content: linkInterior } = useContentBlock(PAGE, "links.interior", t.services.interiorTitle);
  const { content: linkElectrical } = useContentBlock(PAGE, "links.electrical", t.services.electricalTitle);
  const { content: newsletterTitle } = useContentBlock(PAGE, "newsletter.title", t.footer.newsletter);
  const { content: newsletterSubtitle } = useContentBlock(PAGE, "newsletter.subtitle", t.newsletter.subtitle);
  const { content: newsletterPlaceholder } = useContentBlock(PAGE, "newsletter.placeholder", t.newsletter.placeholder);
  const { content: newsletterButton } = useContentBlock(PAGE, "newsletter.button", "OK");
  const { content: newsletterGdpr } = useContentBlock(PAGE, "newsletter.gdpr", t.newsletter.gdpr);
  const { content: copyright } = useContentBlock(PAGE, "copyright", t.footer.copyright);
  const { content: imprintLabel } = useContentBlock(PAGE, "imprint", t.footer.imprint);
  const { content: privacyLabel } = useContentBlock(PAGE, "privacy", t.footer.privacy);
  const { content: cookiesLabel } = useContentBlock(PAGE, "cookies", t.footer.cookies);
  const { content: termsLabel } = useContentBlock(PAGE, "terms", t.footer.terms);

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
            <h3 data-editable="contact.title" data-page={PAGE} className="text-lg font-heading font-bold text-gold mb-4">{contactTitle}</h3>
            <address className="not-italic space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" aria-hidden="true" />
                <a href={`tel:${contactPhone.replace(/\s/g, "")}`} data-editable="contact.phone" data-page={PAGE} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{contactPhone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" aria-hidden="true" />
                <a href={`mailto:${contactEmail}`} data-editable="contact.email" data-page={PAGE} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{contactEmail}</a>
              </div>
            </address>
          </div>

          {/* Quick Links */}
          <div>
            <h3 data-editable="quickLinks.title" data-page={PAGE} className="text-lg font-heading font-bold text-gold mb-4">{quickLinksTitle}</h3>
            <nav aria-label={quickLinksTitle} className="space-y-2 text-sm">
              <Link to={localePath("/")} data-editable="links.home" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkHome}</Link>
              <Link to={localePath("/bemutatkozas")} data-editable="links.about" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkAbout}</Link>
              <Link to={localePath("/ingatlanok")} data-editable="links.properties" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkProperties}</Link>
              <Link to={localePath("/kapcsolat")} data-editable="links.contact" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkContact}</Link>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h3 data-editable="services.title" data-page={PAGE} className="text-lg font-heading font-bold text-gold mb-4">{servicesTitle}</h3>
            <nav aria-label={servicesTitle} className="space-y-2 text-sm">
              <Link to={localePath("/ingatlan-ertekesites-berbeadas")} data-editable="links.sales" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkSales}</Link>
              <Link to={localePath("/ertekbecsles-ertekmeghatrozas")} data-editable="links.appraisal" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkAppraisal}</Link>
              <Link to={localePath("/teljeskoru-jogi-hatter")} data-editable="links.legal" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkLegal}</Link>
              <Link to={localePath("/hitel-allami-tamogatasok")} data-editable="links.loan" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkLoan}</Link>
              <Link to={localePath("/energetikai-tanusitvany")} data-editable="links.energy" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkEnergy}</Link>
              <Link to={localePath("/belsoepiteszet-latvanyterv")} data-editable="links.interior" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkInterior}</Link>
              <Link to={localePath("/villamos-biztonsagi-felulvizsgalat")} data-editable="links.electrical" data-page={PAGE} className="block text-primary-foreground/80 hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{linkElectrical}</Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h3 id="footer-newsletter-heading" data-editable="newsletter.title" data-page={PAGE} className="text-lg font-heading font-bold text-gold mb-4">{newsletterTitle}</h3>
            <p data-editable="newsletter.subtitle" data-page={PAGE} className="text-sm text-primary-foreground/80 mb-3">{newsletterSubtitle}</p>
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
                  <label htmlFor="footer-email" className="sr-only">{newsletterPlaceholder}</label>
                  <input
                    id="footer-email"
                    type="email"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    placeholder={newsletterPlaceholder}
                    required
                    autoComplete="email"
                    className="flex-1 px-3 py-2 text-sm rounded bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                  <button
                    type="submit"
                    aria-label={newsletterButton}
                    className="px-4 py-2 bg-gold text-accent-foreground font-semibold text-sm rounded hover:bg-gold/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4]"
                  >
                    {newsletterButton}
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
                  <span data-editable="newsletter.gdpr" data-page={PAGE}>{newsletterGdpr}</span>
                </label>
                {footerError && (
                  <p role="alert" className="text-xs text-red-300">{footerError}</p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/60">
          <p data-editable="copyright" data-page={PAGE}>{copyright}</p>
          <nav aria-label={t.footer.legalInfo} className="flex flex-wrap gap-4">
            <Link to={localePath("/impresszum")} data-editable="imprint" data-page={PAGE} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{imprintLabel}</Link>
            <Link to={localePath("/adatkezelesi-tajekoztato")} data-editable="privacy" data-page={PAGE} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{privacyLabel}</Link>
            <Link to={localePath("/cookie-tajekoztato")} data-editable="cookies" data-page={PAGE} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{cookiesLabel}</Link>
            <Link to={localePath("/aszf")} data-editable="terms" data-page={PAGE} className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#4682B4] rounded-sm">{termsLabel}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
