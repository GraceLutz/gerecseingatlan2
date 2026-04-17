import { useLanguage } from "@/contexts/LanguageContext";
import { useId, useState } from "react";
import { Loader2 } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Footer newsletter signup section.
 * Visible label, inline validation error, and an ARIA live region for success —
 * preserves the existing submit flow (no network call yet).
 */
const NewsletterSection = () => {
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Whether the user has attempted to submit — gates inline error visibility so
  // the user is not scolded before they even interact with the field.
  const [touched, setTouched] = useState(false);

  const uid = useId();
  const emailId = `${uid}-email`;
  const emailErrId = `${emailId}-error`;
  const gdprId = `${uid}-gdpr`;
  const gdprErrId = `${gdprId}-error`;
  const statusId = `${uid}-status`;

  const isValidEmail = EMAIL_REGEX.test(email);
  const emailError = touched && email.length > 0 && !isValidEmail;
  const gdprError = touched && !gdpr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidEmail || !gdpr || submitting) return;
    setSubmitting(true);
    // Newsletter signup would be handled here (no network call yet).
    setEmail("");
    setGdpr(false);
    setTouched(false);
    setSubmitting(false);
    setSubmitted(true);
  };

  const labelClass = "block text-left text-xs font-semibold text-primary-foreground/80 mb-1";

  const emailInvalidText = lang === "hu"
    ? "Kérjük, adjon meg érvényes e-mail címet."
    : "Please enter a valid email address.";
  const gdprInvalidText = lang === "hu"
    ? "A feliratkozáshoz el kell fogadnia az adatkezelést."
    : "You must accept the privacy policy to subscribe.";

  return (
    <section className="py-16 bg-[#4682B4]" aria-labelledby="newsletter-heading">
      <div className="container mx-auto px-4 text-center">
        <h2 id="newsletter-heading" className="text-2xl md:text-3xl font-heading font-bold text-gold mb-3">
          {t.newsletter.title}
        </h2>
        <p className="text-gold/90 font-body mb-8 max-w-lg mx-auto">
          {t.newsletter.subtitle}
        </p>

        {/* Live region for async success feedback — always rendered so SRs pick up the update. */}
        <div id={statusId} role="status" aria-live="polite" className="min-h-[1.5rem]">
          {submitted && (
            <p className="text-gold font-semibold font-body text-lg">
              ✓ {t.newsletter.success ?? (lang === "hu" ? "Sikeres feliratkozás!" : "Successfully subscribed!")}
            </p>
          )}
        </div>

        {!submitted && (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-2" noValidate>
            <div className="mb-3 text-left">
              <label htmlFor={emailId} className={labelClass}>
                {t.newsletter.placeholder}
              </label>
              <div className="flex gap-2">
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => email.length > 0 && setTouched(true)}
                  placeholder={t.newsletter.placeholder}
                  autoComplete="email"
                  required
                  aria-invalid={emailError || undefined}
                  aria-describedby={emailError ? emailErrId : undefined}
                  disabled={submitting}
                  className={`flex-1 px-4 py-3 rounded-lg bg-white border text-[#0B2340] placeholder:text-[#0B2340]/40 focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:ring-offset-2 focus:ring-offset-[#D8EEFF] disabled:opacity-60 disabled:cursor-not-allowed ${
                    emailError ? "border-destructive" : "border-[#0B2340]/15 focus:border-[#4682B4]"
                  }`}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="px-6 py-3 bg-[#4682B4] text-white font-semibold rounded-lg hover:bg-[#3B72A4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:ring-offset-2 focus:ring-offset-[#D8EEFF] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                  <span>{t.newsletter.button}</span>
                </button>
              </div>
              {emailError && (
                <p id={emailErrId} role="alert" className="mt-1 text-xs text-destructive">
                  {emailInvalidText}
                </p>
              )}
            </div>
            <div className="text-left">
              <label htmlFor={gdprId} className="flex items-center gap-2 text-sm text-[#0B2340]/70 justify-center cursor-pointer">
                <input
                  id={gdprId}
                  type="checkbox"
                  checked={gdpr}
                  onChange={e => setGdpr(e.target.checked)}
                  aria-invalid={gdprError || undefined}
                  aria-describedby={gdprError ? gdprErrId : undefined}
                  aria-required="true"
                  disabled={submitting}
                  className="rounded border-[#0B2340]/30 focus:ring-2 focus:ring-[#4682B4]"
                />
                {t.newsletter.gdpr}
              </label>
              {gdprError && (
                <p id={gdprErrId} role="alert" className="mt-1 text-xs text-destructive text-center">
                  {gdprInvalidText}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
