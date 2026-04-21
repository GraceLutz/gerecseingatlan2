import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock, useContentArray } from "@/contexts/ContentContext";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { services, getServiceBySlug } from "@/data/services";
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
  const pagePath = `/${resolvedSlug}`;

  const { content: title } = useContentBlock(pagePath, "service.title", t.services[service.titleKey]);
  const { content: subtitle } = useContentBlock(pagePath, "service.subtitle", "");
  const { content: ctaText } = useContentBlock(pagePath, "service.cta.text", t.services.interestedCta);
  const { content: benefitsTitle } = useContentBlock(pagePath, "service.benefits.title", t.serviceDetail.benefits);
  const { content: otherServicesTitle } = useContentBlock(pagePath, "service.otherServices", t.serviceDetail.otherServices);
  const { items: paragraphs } = useContentArray(pagePath, "service.paragraphs", []);
  const { items: benefits } = useContentArray(pagePath, "service.benefits", []);

  const Icon = service.icon;
  const seoTitle = `${title} – Gerecse Ingatlan`;
  const seoDescription = `${title} ${t.serviceDetail.seoDescriptionSuffix}`;

  const relatedServices = services.filter((s) => s.slug !== resolvedSlug).slice(0, 3);

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath={`/${resolvedSlug}`}>
      <section className="bg-dark-green py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <Icon size={28} className="text-gold" aria-hidden="true" />
          </div>
        </div>
        <h1
          className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground"
          data-editable="service.title"
          data-page={pagePath}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-3 text-lg text-primary-foreground/80"
            data-editable="service.subtitle"
            data-page={pagePath}
          >
            {subtitle}
          </p>
        )}
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

          <div className="space-y-4 mb-12">
            {paragraphs.map((paragraph, i) => (
              <EditableText
                key={i}
                pagePath={pagePath}
                blockKey={`service.paragraphs[${i}]`}
                fallback={paragraph}
                as="p"
                className="text-muted-foreground font-body leading-relaxed text-base"
              />
            ))}
          </div>

          {benefits.length > 0 && (
            <div className="mb-12 p-6 bg-light-bg rounded-xl">
              <h2
                className="text-lg font-heading font-bold text-dark-green mb-4"
                data-editable="service.benefits.title"
                data-page={pagePath}
              >
                {benefitsTitle}
              </h2>
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
              <p
                className="text-lg font-heading font-semibold text-primary-foreground mb-4"
                data-editable="service.cta.text"
                data-page={pagePath}
              >
                {ctaText}
              </p>
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

          {relatedServices.length > 0 && (
            <div className="mt-16">
              <h2
                className="text-xl font-heading font-bold text-dark-green mb-6"
                data-editable="service.otherServices"
                data-page={pagePath}
              >
                {otherServicesTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedServices.map((rel) => {
                  const RelIcon = rel.icon;
                  return (
                    <Link
                      key={rel.slug}
                      to={localePath(`/${rel.slug}`)}
                      className="group bg-card rounded-lg p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <RelIcon
                          size={20}
                          className="text-primary"
                          aria-hidden="true"
                        />
                        <h3 className="text-sm font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                          {t.services[rel.titleKey]}
                        </h3>
                      </div>
                      <span className="text-xs text-primary font-semibold group-hover:text-gold transition-colors">
                        {t.services.more} →
                      </span>
                    </Link>
                  );
                })}
              </div>
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

  const { content: formTitle } = useContentBlock(INTERIOR_PAGE, "service.interior.form.title", t.serviceDetail.interiorFormTitle);
  const { content: formSubtitle } = useContentBlock(INTERIOR_PAGE, "service.interior.form.subtitle", t.serviceDetail.interiorFormSubtitle);
  const { content: nameLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.nameLabel", t.serviceDetail.nameLabel);
  const { content: emailLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.emailLabel", "E-mail");
  const { content: phoneLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.phoneLabel", t.serviceDetail.phoneLabel);
  const { content: addressLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.addressLabel", t.serviceDetail.addressLabel);
  const { content: messageLabel } = useContentBlock(INTERIOR_PAGE, "service.interior.form.messageLabel", t.serviceDetail.messageLabel);
  const { content: submitButton } = useContentBlock(INTERIOR_PAGE, "service.interior.form.submitButton", t.serviceDetail.submitButton);
  const { content: submittingText } = useContentBlock(INTERIOR_PAGE, "service.interior.form.submitting", t.serviceDetail.submitting);
  const { content: dataNotice } = useContentBlock(INTERIOR_PAGE, "service.interior.form.dataNotice", t.serviceDetail.dataNotice);
  const { content: successMessage } = useContentBlock(INTERIOR_PAGE, "service.interior.form.successMessage", t.serviceDetail.successMessage);

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
        <p
          className="text-lg font-heading font-semibold text-dark-green"
          data-editable="service.interior.form.successMessage"
          data-page={INTERIOR_PAGE}
        >
          {successMessage}
        </p>
      </div>
    );
  }

  const fieldClass = "w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors";

  return (
    <div className="p-8 bg-light-bg rounded-xl">
      <h2
        className="text-xl font-heading font-bold text-dark-green mb-2"
        data-editable="service.interior.form.title"
        data-page={INTERIOR_PAGE}
      >
        {formTitle}
      </h2>
      <p
        className="text-sm text-muted-foreground mb-6"
        data-editable="service.interior.form.subtitle"
        data-page={INTERIOR_PAGE}
      >
        {formSubtitle}
      </p>

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
        <p
          className="text-xs text-muted-foreground text-center"
          data-editable="service.interior.form.dataNotice"
          data-page={INTERIOR_PAGE}
        >
          {dataNotice}
        </p>
      </form>
    </div>
  );
};

export default ServiceDetailPage;
