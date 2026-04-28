import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent, useContentBlock, useContentArray } from "@/contexts/ContentContext";
import { buildBreadcrumbJsonLd } from "@/components/SEOHead";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { getServiceBySlug } from "@/data/services";
import EditableButton from "@/components/EditableButton";
import EditableText from "@/components/EditableText";
import EditableList from "@/components/EditableList";

const enToHuServiceSlug: Record<string, string> = {
  "property-sales-and-rentals": "ingatlan-ertekesites-berbeadas",
  "appraisal-and-valuation": "ertekbecsles-ertekmeghatrozas",
  "interior-design": "belsoepiteszet-latvanyterv",
  "full-legal-support": "teljeskoru-jogi-hatter",
  "loans-and-subsidies": "hitel-allami-tamogatasok",
  "energy-certificate": "energetikai-tanusitvany",
  "electrical-safety-inspection": "villamos-biztonsagi-felulvizsgalat",
  // Legacy aliases — App.tsx redirects these, but kept for direct-navigation safety
  "property-sales-and-rental": "ingatlan-ertekesites-berbeadas",
  "interior-design-and-visualization": "belsoepiteszet-latvanyterv",
  "credit-and-state-support": "hitel-allami-tamogatasok",
  "energy-performance-certificate": "energetikai-tanusitvany",
};

/** Maps Hungarian service slugs to i18n seo key prefixes */
const slugToSeoKey: Record<string, string> = {
  "ingatlan-ertekesites-berbeadas": "sales",
  "ertekbecsles-ertekmeghatrozas": "appraisal",
  "belsoepiteszet-latvanyterv": "interior",
  "teljeskoru-jogi-hatter": "legal",
  "hitel-allami-tamogatasok": "loan",
  "energetikai-tanusitvany": "energy",
  "villamos-biztonsagi-felulvizsgalat": "electrical",
};

const ServiceDetailPage = () => {
  const { lang, t, localePath } = useLanguage();
  const { slug } = useParams();

  const resolvedSlug = slug ? (enToHuServiceSlug[slug] || slug) : undefined;
  const service = resolvedSlug ? getServiceBySlug(resolvedSlug) : undefined;

  if (!service) {
    return (
      <Layout>
        <div className="py-32 text-center text-muted-foreground">
          {t.serviceDetail.pageNotFound}
        </div>
      </Layout>
    );
  }

  return <ServiceContent service={service} resolvedSlug={resolvedSlug!} />;
};

function ServiceContent({ service, resolvedSlug }: { service: ReturnType<typeof getServiceBySlug> & {}; resolvedSlug: string }) {
  const { lang, t, localePath } = useLanguage();
  const { isAdmin } = useContent();
  const pagePath = `/${resolvedSlug}`;

  const { content: title } = useContentBlock(pagePath, "service.title", t.services[service.titleKey]);
  const { content: subtitle } = useContentBlock(pagePath, "service.subtitle", "");
  const { items: benefits } = useContentArray(pagePath, "service.benefits", []);

  const Icon = service.icon;
  const seoKey = slugToSeoKey[resolvedSlug];
  const seoTitle = seoKey
    ? (t.seo as Record<string, string>)[`${seoKey}Title`]
    : `${title} – Gerecse Ingatlan`;
  const seoDescription = seoKey
    ? (t.seo as Record<string, string>)[`${seoKey}Description`]
    : `${title} ${t.serviceDetail.seoDescriptionSuffix}`;


  const ORIGIN = "https://gerecseingatlan.hu";
  useEffect(() => {
    const schema = buildBreadcrumbJsonLd([
      { name: t.nav.home, url: ORIGIN },
      { name: seoTitle, url: `${ORIGIN}/${resolvedSlug}` },
    ]);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-page-jsonld", "true");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [t.nav.home, seoTitle, resolvedSlug]);

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath={`/${resolvedSlug}`}>
      <section className="bg-dark-green py-20 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <Icon size={28} className="text-gold" aria-hidden="true" />
            </div>
          </div>
          <EditableText
            pagePath={pagePath}
            blockKey="service.title"
            fallback={t.services[service.titleKey]}
            as="h1"
            className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground"
          />
          {(subtitle || isAdmin) && (
            <EditableText
              pagePath={pagePath}
              blockKey="service.subtitle"
              fallback=""
              as="p"
              className="mt-3 text-lg text-primary-foreground/80"
            />
          )}
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to={localePath("/")}
            className="inline-flex items-center gap-2 text-primary hover:text-gold mb-8 font-semibold text-sm transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t.nav.home}
          </Link>

          <EditableList
            pagePath={pagePath}
            blockKey="service.paragraphs"
            fallback={[t.services[service.descKey]]}
            className="space-y-4 mb-12"
            itemClassName="text-muted-foreground font-body leading-relaxed text-base"
          />

          {benefits.length > 0 && (
            <div className="mb-12 p-6 bg-light-bg rounded-xl">
              <EditableText
                pagePath={pagePath}
                blockKey="service.benefits.title"
                fallback={t.serviceDetail.benefits}
                as="h2"
                className="text-lg font-heading font-bold text-dark-green mb-4"
              />
              <EditableList
                pagePath={pagePath}
                blockKey="service.benefits"
                fallback={benefits}
                className="space-y-3"
                itemClassName="flex items-start gap-3 text-muted-foreground font-body"
              />
            </div>
          )}

          {resolvedSlug === "belsoepiteszet-latvanyterv" ? (
            <InteriorContactForm />
          ) : (
            <div className="p-8 bg-dark-green rounded-xl text-center">
              <EditableText
                pagePath={pagePath}
                blockKey="service.cta.text"
                fallback={t.services.interestedCta}
                as="p"
                className="text-lg font-heading font-semibold text-primary-foreground mb-4"
              />
              <EditableButton
                pagePath={pagePath}
                labelKey="service.cta.label"
                urlKey="service.cta.url"
                fallbackLabel={t.services.interestedCta}
                fallbackUrl={localePath("/kapcsolat")}
                className="inline-block px-8 py-3 bg-gold text-white font-semibold rounded-lg hover:bg-gold/90 transition-colors"
              />
            </div>
          )}

        </div>
      </section>
    </Layout>
  );
}

const INTERIOR_PAGE = "/belsoepiteszet-latvanyterv";

const InteriorContactForm: React.FC = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { content: nameLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.nameLabel", t.serviceDetail.nameLabel);
  const { content: emailLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.emailLabel", "E-mail");
  const { content: phoneLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.phoneLabel", t.serviceDetail.phoneLabel);
  const { content: addressLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.addressLabel", t.serviceDetail.addressLabel);
  const { content: messageLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.messageLabel", t.serviceDetail.messageLabel);
  const { content: submitButton } = useContentBlock(INTERIOR_PAGE, "service.interior.form.submitButton", t.serviceDetail.submitButton);
  const { content: submittingText } = useContentBlock(INTERIOR_PAGE, "service.interior.form.submitting", t.serviceDetail.submitting);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || "";
    const address = (formData.get("address") as string) || "";
    const message = formData.get("message") as string;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject: t.serviceDetail.subjectText,
          message: address
            ? `${t.serviceDetail.locationPrefix}: ${address}\n\n${message}`
            : message,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSubmitError(`${t.serviceDetail.sendErrorPrefix}${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 bg-light-bg rounded-xl text-center" role="status" aria-live="polite">
        <EditableText
          pagePath={INTERIOR_PAGE}
          blockKey="service.interior.form.successMessage"
          fallback={t.serviceDetail.successMessage}
          as="p"
          className="text-lg font-heading font-semibold text-dark-green"
        />
      </div>
    );
  }

  const fieldClass = "w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors";

  return (
    <div className="p-8 bg-light-bg rounded-xl">
      <EditableText
        pagePath={INTERIOR_PAGE}
        blockKey="service.interior.form.title"
        fallback={t.serviceDetail.interiorFormTitle}
        as="h2"
        className="text-xl font-heading font-bold text-dark-green mb-2"
      />
      <EditableText
        pagePath={INTERIOR_PAGE}
        blockKey="service.interior.form.subtitle"
        fallback={t.serviceDetail.interiorFormSubtitle}
        as="p"
        className="text-sm text-muted-foreground mb-6"
      />

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm" role="alert">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="interior-name"
            className="block text-sm font-semibold text-foreground mb-1"
            data-editable="service.interior.form.nameLabel"
            data-page={INTERIOR_PAGE}
          >
            {nameLabel} *
          </label>
          <input id="interior-name" name="name" type="text" required className={fieldClass} />
        </div>
        <div>
          <label
            htmlFor="interior-email"
            className="block text-sm font-semibold text-foreground mb-1"
            data-editable="service.interior.form.emailLabel"
            data-page={INTERIOR_PAGE}
          >
            {emailLabel} *
          </label>
          <input id="interior-email" name="email" type="email" required className={fieldClass} />
        </div>
        <div>
          <label
            htmlFor="interior-phone"
            className="block text-sm font-semibold text-foreground mb-1"
            data-editable="service.interior.form.phoneLabel"
            data-page={INTERIOR_PAGE}
          >
            {phoneLabel}
          </label>
          <input id="interior-phone" name="phone" type="tel" className={fieldClass} />
        </div>
        <div>
          <label
            htmlFor="interior-address"
            className="block text-sm font-semibold text-foreground mb-1"
            data-editable="service.interior.form.addressLabel"
            data-page={INTERIOR_PAGE}
          >
            {addressLabel}
          </label>
          <input id="interior-address" name="address" type="text" className={fieldClass} />
        </div>
        <div>
          <label
            htmlFor="interior-message"
            className="block text-sm font-semibold text-foreground mb-1"
            data-editable="service.interior.form.messageLabel"
            data-page={INTERIOR_PAGE}
          >
            {messageLabel} *
          </label>
          <textarea id="interior-message" name="message" required rows={4} className={fieldClass} />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          data-editable="service.interior.form.submitButton"
          data-page={INTERIOR_PAGE}
        >
          <Send size={16} aria-hidden="true" />
          {submitting ? submittingText : submitButton}
        </button>
        <EditableText
          pagePath={INTERIOR_PAGE}
          blockKey="service.interior.form.dataNotice"
          fallback={t.serviceDetail.dataNotice}
          as="p"
          className="text-xs text-muted-foreground text-center"
        />
      </form>
    </div>
  );
};

export default ServiceDetailPage;
