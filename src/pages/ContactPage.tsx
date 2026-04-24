import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import { Phone, Mail, Clock, Facebook } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";

const PAGE = "/kapcsolat";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10),
  gdpr: z.literal(true),
  honeypot: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const { t, lang } = useLanguage();

  const { content: pageTitle } = useContentBlock(PAGE, "page.title", t.contact.title);
  const { content: pageSubtitle } = useContentBlock(PAGE, "page.subtitle", t.contact.subtitle);

  const { content: phoneLabel } = useContentBlock(PAGE, "contact.info.phone.label", t.contact.phone);
  const { content: phoneNumber } = useContentBlock(PAGE, "contact.info.phone.value", "+36 70 613 2658");
  const { content: emailLabel } = useContentBlock(PAGE, "contact.info.email.label", t.contact.email);
  const { content: emailAddress } = useContentBlock(PAGE, "contact.info.email.value", "info@gerecseingatlan.hu");
  const { content: hoursLabel } = useContentBlock(PAGE, "contact.info.hours.label", t.contact.openingHours);
  const { content: hoursWeekdays } = useContentBlock(PAGE, "contact.info.hours.weekdays", t.contact.weekdays);
  const { content: hoursSaturday } = useContentBlock(PAGE, "contact.info.hours.saturday", t.contact.saturday);
  const { content: hoursSunday } = useContentBlock(PAGE, "contact.info.hours.sunday", t.contact.sunday);
  const { content: facebookLabel } = useContentBlock(PAGE, "contact.info.facebook.label", t.contact.facebookLabel);

  const { content: formTitle } = useContentBlock(PAGE, "contact.form.title", t.contact.subtitle);
  const { content: nameLabel } = useContentBlock(PAGE, "contact.form.name.label", t.contact.name);
  const { content: formEmailLabel } = useContentBlock(PAGE, "contact.form.email.label", t.contact.email);
  const { content: formPhoneLabel } = useContentBlock(PAGE, "contact.form.phone.label", t.contact.phone);
  const { content: subjectLabel } = useContentBlock(PAGE, "contact.form.subject.label", t.contact.subject);
  const { content: messageLabel } = useContentBlock(PAGE, "contact.form.message.label", t.contact.message);
  const { content: gdprText } = useContentBlock(PAGE, "contact.form.gdpr", t.contact.gdprConsent);
  const { content: submitLabel } = useContentBlock(PAGE, "contact.form.submit", t.contact.send);
  const { content: submittingLabel } = useContentBlock(PAGE, "contact.form.submitting", t.contact.sending);
  const { content: successMessage } = useContentBlock(PAGE, "contact.form.success", t.contact.successMessage);
  const { content: errorPrefix } = useContentBlock(PAGE, "contact.form.errorPrefix", t.contact.sendErrorPrefix);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          subject: data.subject,
          message: data.message,
          honeypot: data.honeypot || "",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      setSubmitted(true);
      reset();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSubmitted(false), 8000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSubmitError(`${errorPrefix}${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (field: keyof ContactFormData) => {
    if (!errors[field]) return null;
    const fieldErrors = t.contact.fieldErrors as Record<string, string>;
    return (
      <p id={`contact-${field}-error`} className="text-destructive text-xs mt-1" role="alert">
        {fieldErrors[field] ?? ""}
      </p>
    );
  };

  const inputClasses = (field: keyof ContactFormData) =>
    `w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  const seoTitle = t.seo.contactTitle;
  const seoDescription = t.seo.contactDescription;

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/kapcsolat">
      <section className="bg-dark-green py-20 text-center">
        <h1 data-editable="page.title" data-page={PAGE} className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">
          {pageTitle}
        </h1>
        <p data-editable="page.subtitle" data-page={PAGE} className="text-primary-foreground/70 font-body mt-2">
          {pageSubtitle}
        </p>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone size={22} className="text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 data-editable="contact.info.phone.label" data-page={PAGE} className="font-heading font-semibold text-foreground mb-1">
                    {phoneLabel}
                  </h3>
                  <a
                    href="tel:+36706132658"
                    data-editable="contact.info.phone.value" data-page={PAGE}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                  >
                    {phoneNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={22} className="text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 data-editable="contact.info.email.label" data-page={PAGE} className="font-heading font-semibold text-foreground mb-1">
                    {emailLabel}
                  </h3>
                  <a
                    href={`mailto:${emailAddress}`}
                    data-editable="contact.info.email.value" data-page={PAGE}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                  >
                    {emailAddress}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock size={22} className="text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 data-editable="contact.info.hours.label" data-page={PAGE} className="font-heading font-semibold text-foreground mb-1">
                    {hoursLabel}
                  </h3>
                  <p data-editable="contact.info.hours.weekdays" data-page={PAGE} className="text-muted-foreground text-sm">{hoursWeekdays}</p>
                  <p data-editable="contact.info.hours.saturday" data-page={PAGE} className="text-muted-foreground text-sm">{hoursSaturday}</p>
                  <p data-editable="contact.info.hours.sunday" data-page={PAGE} className="text-muted-foreground text-sm">{hoursSunday}</p>
                </div>
              </div>

              {/* Social links */}
              <div className="flex gap-4 pt-2">
                <a
                  href="https://www.facebook.com/gerecseingatlan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={facebookLabel}
                >
                  <Facebook size={18} className="text-primary" />
                </a>
              </div>

            </div>

            {/* Form */}
            <div className="bg-card rounded-xl p-8 shadow-md border border-border">
              <h2 data-editable="contact.form.title" data-page={PAGE} className="text-xl font-heading font-bold text-dark-green mb-6">
                {formTitle}
              </h2>

              {submitted && (
                <div
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm"
                  role="status"
                  aria-live="polite"
                  data-editable="contact.form.success" data-page={PAGE}
                >
                  {successMessage}
                </div>
              )}

              {submitError && (
                <div
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm"
                  role="alert"
                  aria-live="assertive"
                >
                  {submitError}
                </div>
              )}

              <form
                className="space-y-4"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div>
                  <label
                    htmlFor="contact-name"
                    data-editable="contact.form.name.label" data-page={PAGE}
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {nameLabel} *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    disabled={submitting}
                    className={inputClasses("name")}
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    aria-required="true"
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                  />
                  {fieldError("name")}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    data-editable="contact.form.email.label" data-page={PAGE}
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {formEmailLabel} *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    disabled={submitting}
                    className={inputClasses("email")}
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    aria-required="true"
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                  />
                  {fieldError("email")}
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    data-editable="contact.form.phone.label" data-page={PAGE}
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {formPhoneLabel}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    autoComplete="tel"
                    disabled={submitting}
                    className={inputClasses("phone")}
                    {...register("phone")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    data-editable="contact.form.subject.label" data-page={PAGE}
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {subjectLabel} *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    disabled={submitting}
                    className={inputClasses("subject")}
                    {...register("subject")}
                    aria-invalid={!!errors.subject}
                    aria-required="true"
                    aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                  />
                  {fieldError("subject")}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    data-editable="contact.form.message.label" data-page={PAGE}
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {messageLabel} *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    disabled={submitting}
                    className={`${inputClasses("message")} resize-none`}
                    {...register("message")}
                    aria-invalid={!!errors.message}
                    aria-required="true"
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                  />
                  {fieldError("message")}
                </div>

                {/* Honeypot - hidden from real users */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    {...register("honeypot")}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="contact-gdpr"
                    type="checkbox"
                    className={`mt-1 rounded ${errors.gdpr ? "border-destructive ring-1 ring-destructive" : "border-border"}`}
                    disabled={submitting}
                    {...register("gdpr")}
                    aria-invalid={!!errors.gdpr}
                    aria-required="true"
                    aria-describedby={errors.gdpr ? "contact-gdpr-error" : undefined}
                  />
                  <label
                    htmlFor="contact-gdpr"
                    data-editable="contact.form.gdpr" data-page={PAGE}
                    className={`text-sm ${errors.gdpr ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {gdprText}
                  </label>
                </div>
                {fieldError("gdpr")}

                <button
                  type="submit"
                  disabled={submitting}
                  data-editable="contact.form.submit" data-page={PAGE}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-main-green/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? submittingLabel : submitLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
