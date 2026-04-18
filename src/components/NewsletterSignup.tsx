import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public newsletter signup form with double opt-in.
 * Posts to /api/newsletter/subscribe. Bilingual via i18n context.
 */
export default function NewsletterSignup() {
  const { t, lang, localePath } = useLanguage();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const uid = useId();
  const emailId = `${uid}-email`;
  const nameId = `${uid}-name`;
  const emailErrId = `${emailId}-error`;
  const gdprId = `${uid}-gdpr`;
  const gdprErrId = `${gdprId}-error`;
  const statusId = `${uid}-status`;

  const isValidEmail = EMAIL_REGEX.test(email);
  const emailError = touched && email.length > 0 && !isValidEmail;
  const gdprError = touched && !gdpr;

  const nameLabel = lang === "hu" ? "Név (nem kötelező)" : "Name (optional)";
  const namePlaceholder = lang === "hu" ? "Teljes név" : "Full name";
  const emailPlaceholder = lang === "hu" ? "pelda@email.hu" : "example@email.com";
  const emailInvalidText = lang === "hu"
    ? "Kérjük, adjon meg érvényes e-mail címet."
    : "Please enter a valid email address.";
  const gdprInvalidText = lang === "hu"
    ? "A feliratkozáshoz el kell fogadnia az adatkezelést."
    : "You must accept the privacy policy to subscribe.";
  const successText = lang === "hu"
    ? "Sikeres feliratkozás! Kérjük, erősítse meg e-mail címét a kapott levélben."
    : "Successfully subscribed! Please confirm your email address in the message you received.";
  const networkErrorText = lang === "hu"
    ? "Hálózati hiba. Kérjük, próbálja újra később."
    : "Network error. Please try again later.";
  const genericErrorText = lang === "hu"
    ? "Hiba történt a feliratkozás során."
    : "An error occurred during subscription.";
  const gdprLinkText = lang === "hu" ? "adatkezelési tájékoztató" : "privacy policy";
  const gdprConsentPrefix = lang === "hu"
    ? "Hozzájárulok az adataim kezeléséhez az "
    : "I consent to data processing per the ";
  const gdprConsentSuffix = lang === "hu" ? " szerint." : ".";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);

    if (!isValidEmail || !gdpr || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          gdprConsent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? genericErrorText);
        return;
      }

      setEmail("");
      setName("");
      setGdpr(false);
      setTouched(false);
      setSubmitted(true);
    } catch {
      setError(networkErrorText);
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass =
    "block text-left text-xs font-semibold text-primary-foreground/80 mb-1";

  return (
    <section
      className="py-16 bg-[#4682B4]"
      aria-labelledby="newsletter-heading"
    >
      <div className="container mx-auto px-4 text-center">
        <h2
          id="newsletter-heading"
          className="text-2xl md:text-3xl font-heading font-bold text-gold mb-3"
        >
          {t.newsletter.title}
        </h2>
        <p className="text-gold/90 font-body mb-8 max-w-lg mx-auto">
          {t.newsletter.subtitle}
        </p>

        <div
          id={statusId}
          role="status"
          aria-live="polite"
          className="min-h-[1.5rem]"
        >
          {submitted && (
            <p className="text-gold font-semibold font-body text-lg">
              {successText}
            </p>
          )}
          {error && (
            <p className="text-red-200 font-semibold font-body text-sm">
              {error}
            </p>
          )}
        </div>

        {!submitted && (
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mt-2"
            noValidate
          >
            <div className="mb-3 text-left">
              <label htmlFor={nameId} className={labelClass}>
                {nameLabel}
              </label>
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder}
                autoComplete="name"
                disabled={submitting}
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#0B2340]/15 text-[#0B2340] placeholder:text-[#0B2340]/40 focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:ring-offset-2 focus:ring-offset-[#D8EEFF] focus:border-[#4682B4] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div className="mb-3 text-left">
              <label htmlFor={emailId} className={labelClass}>
                {t.newsletter.placeholder}
              </label>
              <div className="flex gap-2">
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => email.length > 0 && setTouched(true)}
                  placeholder={emailPlaceholder}
                  autoComplete="email"
                  required
                  aria-invalid={emailError || undefined}
                  aria-describedby={emailError ? emailErrId : undefined}
                  disabled={submitting}
                  className={`flex-1 px-4 py-3 rounded-lg bg-white border text-[#0B2340] placeholder:text-[#0B2340]/40 focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:ring-offset-2 focus:ring-offset-[#D8EEFF] disabled:opacity-60 disabled:cursor-not-allowed ${
                    emailError
                      ? "border-destructive"
                      : "border-[#0B2340]/15 focus:border-[#4682B4]"
                  }`}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="px-6 py-3 bg-gold text-accent-foreground font-semibold rounded-lg hover:bg-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[#4682B4] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  <span>{t.newsletter.button}</span>
                </button>
              </div>
              {emailError && (
                <p
                  id={emailErrId}
                  role="alert"
                  className="mt-1 text-xs text-destructive"
                >
                  {emailInvalidText}
                </p>
              )}
            </div>
            <div className="text-left">
              <label
                htmlFor={gdprId}
                className="flex items-start gap-2 text-sm text-[#0B2340]/70 cursor-pointer"
              >
                <input
                  id={gdprId}
                  type="checkbox"
                  checked={gdpr}
                  onChange={(e) => setGdpr(e.target.checked)}
                  aria-invalid={gdprError || undefined}
                  aria-describedby={gdprError ? gdprErrId : undefined}
                  aria-required="true"
                  disabled={submitting}
                  className="mt-0.5 rounded border-[#0B2340]/30 focus:ring-2 focus:ring-[#4682B4]"
                />
                <span>
                  {gdprConsentPrefix}
                  <a
                    href={localePath("/adatkezelesi-tajekoztato")}
                    className="underline hover:text-[#0B2340] focus:outline-none focus:ring-2 focus:ring-[#4682B4] rounded"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {gdprLinkText}
                  </a>
                  {gdprConsentSuffix}
                </span>
              </label>
              {gdprError && (
                <p
                  id={gdprErrId}
                  role="alert"
                  className="mt-1 text-xs text-destructive text-center"
                >
                  {gdprInvalidText}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
