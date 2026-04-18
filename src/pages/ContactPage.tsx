import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, Clock, Facebook } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10),
  gdpr: z.literal(true),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const { t, lang } = useLanguage();
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
      setSubmitError(
        lang === "hu"
          ? `Hiba történt az üzenet küldésekor: ${message}`
          : `Error sending message: ${message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (field: keyof ContactFormData) => {
    if (!errors[field]) return null;
    const messages: Record<string, Record<string, string>> = {
      name: {
        hu: "Kérjük, adja meg a nevét (min. 2 karakter)",
        en: "Please enter your name (min. 2 characters)",
      },
      email: {
        hu: "Kérjük, adjon meg érvényes e-mail címet",
        en: "Please enter a valid email address",
      },
      subject: {
        hu: "Kérjük, adja meg a tárgyat",
        en: "Please enter the subject",
      },
      message: {
        hu: "Az üzenet legalább 10 karakter legyen",
        en: "Message must be at least 10 characters",
      },
      gdpr: {
        hu: "Az adatkezelési hozzájárulás elfogadása kötelező",
        en: "You must accept the data processing consent",
      },
    };
    return (
      <p className="text-destructive text-xs mt-1" role="alert">
        {messages[field]?.[lang] ?? ""}
      </p>
    );
  };

  const inputClasses = (field: keyof ContactFormData) =>
    `w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  const seoTitle = lang === "hu"
    ? "Kapcsolat – Gerecse Ingatlan"
    : "Contact – Gerecse Ingatlan";
  const seoDescription = lang === "hu"
    ? "Vegye fel velünk a kapcsolatot! Telefon, e-mail, nyitvatartás és kapcsolatfelvételi űrlap."
    : "Get in touch with us! Phone, e-mail, opening hours and contact form.";

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/kapcsolat">
      <section className="bg-dark-green py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground">
          {t.contact.title}
        </h1>
        <p className="text-primary-foreground/70 font-body mt-2">
          {t.contact.subtitle}
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
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    {t.contact.phone}
                  </h3>
                  <a
                    href="tel:+36706132658"
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    +36 70 613 2658
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={22} className="text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    {t.contact.email}
                  </h3>
                  <a
                    href="mailto:info@gerecseingatlan.hu"
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    info@gerecseingatlan.hu
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock size={22} className="text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1">
                    {t.contact.openingHours}
                  </h3>
                  <p className="text-muted-foreground text-sm">{t.contact.weekdays}</p>
                  <p className="text-muted-foreground text-sm">{t.contact.saturday}</p>
                  <p className="text-muted-foreground text-sm">{t.contact.sunday}</p>
                </div>
              </div>

              {/* Social links */}
              <div className="flex gap-4 pt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  aria-label={lang === "hu" ? "Facebook oldalunk" : "Visit us on Facebook"}
                >
                  <Facebook size={18} className="text-primary" />
                </a>
              </div>

            </div>

            {/* Form */}
            <div className="bg-card rounded-xl p-8 shadow-md border border-border">
              <h2 className="text-xl font-heading font-bold text-dark-green mb-6">
                {t.contact.subtitle}
              </h2>

              {submitted && (
                <div
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm"
                  role="status"
                  aria-live="polite"
                >
                  {lang === "hu"
                    ? "Üzenetét sikeresen elküldtük! Hamarosan felvesszük Önnel a kapcsolatot."
                    : "Your message has been sent successfully! We will contact you shortly."}
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
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {t.contact.name} *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    className={inputClasses("name")}
                    {...register("name")}
                    aria-invalid={!!errors.name}
                  />
                  {fieldError("name")}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {t.contact.email} *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className={inputClasses("email")}
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {fieldError("email")}
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {t.contact.phone}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className={inputClasses("phone")}
                    {...register("phone")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {t.contact.subject} *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    className={inputClasses("subject")}
                    {...register("subject")}
                    aria-invalid={!!errors.subject}
                  />
                  {fieldError("subject")}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="text-sm font-semibold text-foreground mb-1 block"
                  >
                    {t.contact.message} *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    className={`${inputClasses("message")} resize-none`}
                    {...register("message")}
                    aria-invalid={!!errors.message}
                  />
                  {fieldError("message")}
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="contact-gdpr"
                    type="checkbox"
                    className="mt-1 rounded border-border"
                    {...register("gdpr")}
                    aria-invalid={!!errors.gdpr}
                  />
                  <label
                    htmlFor="contact-gdpr"
                    className="text-sm text-muted-foreground"
                  >
                    {lang === "hu"
                      ? "Elfogadom az adatkezelési tájékoztatót és hozzájárulok személyes adataim kezeléséhez. *"
                      : "I accept the privacy policy and consent to the processing of my personal data. *"}
                  </label>
                </div>
                {fieldError("gdpr")}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-main-green/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? (lang === "hu" ? "Küldés..." : "Sending...")
                    : t.contact.send}
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
