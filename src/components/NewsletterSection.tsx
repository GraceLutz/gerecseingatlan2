import { useId } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import { useNewsletterSubscription } from "@/hooks/useNewsletterSubscription";

const PAGE = "/";

const NewsletterSection = () => {
  const { t } = useLanguage();
  const { content: nlTitle } = useContentBlock(PAGE, "newsletter.title", t.newsletter.title);
  const { content: nlSubtitle } = useContentBlock(PAGE, "newsletter.subtitle", t.newsletter.subtitle);
  const { content: nlSuccess } = useContentBlock(PAGE, "newsletter.success", t.newsletter.success);
  const { content: nlPlaceholder } = useContentBlock(PAGE, "newsletter.placeholder", t.newsletter.placeholder);
  const { content: nlButton } = useContentBlock(PAGE, "newsletter.button", t.newsletter.button);
  const { content: nlEmailInvalid } = useContentBlock(PAGE, "newsletter.emailInvalid", t.newsletter.emailInvalid);
  const { content: nlGdpr } = useContentBlock(PAGE, "newsletter.gdpr", t.newsletter.gdpr);
  const { content: nlGdprInvalid } = useContentBlock(PAGE, "newsletter.gdprInvalid", t.newsletter.gdprInvalid);
  const { content: nlNetworkError } = useContentBlock(PAGE, "newsletter.networkError", t.newsletter.networkError);
  const { content: nlGenericError } = useContentBlock(PAGE, "newsletter.genericError", t.newsletter.genericError);
  const {
    email,
    setEmail,
    gdpr,
    setGdpr,
    submitted,
    submitting,
    error,
    touched,
    setTouched,
    emailError,
    gdprError,
    handleSubmit,
  } = useNewsletterSubscription();

  const uid = useId();
  const emailId = `${uid}-email`;
  const emailErrId = `${emailId}-error`;
  const gdprId = `${uid}-gdpr`;
  const gdprErrId = `${gdprId}-error`;
  const statusId = `${uid}-status`;

  const displayError =
    error === "NETWORK_ERROR"
      ? nlNetworkError
      : error === "GENERIC_ERROR"
        ? nlGenericError
        : error;

  const labelClass = "block text-left text-xs font-semibold text-primary-foreground/80 mb-1";

  return (
    <section className="py-16 bg-[#4682B4]" aria-labelledby="newsletter-heading">
      <div className="container mx-auto px-4 text-center">
        <h2 id="newsletter-heading" data-editable="newsletter.title" data-page={PAGE} className="text-2xl md:text-3xl font-heading font-bold text-gold mb-3">
          {nlTitle}
        </h2>
        <p data-editable="newsletter.subtitle" data-page={PAGE} className="text-gold/90 font-body mb-8 max-w-lg mx-auto">
          {nlSubtitle}
        </p>

        <div id={statusId} role="status" aria-live="polite" className="min-h-[1.5rem]">
          {submitted && (
            <p data-editable="newsletter.success" data-page={PAGE} className="text-gold font-semibold font-body text-lg">
              ✓ {nlSuccess}
            </p>
          )}
          {error && (
            <p className="text-red-200 font-semibold font-body text-sm">
              {displayError}
            </p>
          )}
        </div>

        {!submitted && (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-2" noValidate>
            <div className="mb-3 text-left">
              <label htmlFor={emailId} className={labelClass}>
                {nlPlaceholder}
              </label>
              <div className="flex gap-2">
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => email.length > 0 && setTouched(true)}
                  placeholder={nlPlaceholder}
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
                  className="px-6 py-3 bg-gold text-accent-foreground font-semibold rounded-lg hover:bg-gold/90 transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[#4682B4] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                  <span data-editable="newsletter.button" data-page={PAGE}>{nlButton}</span>
                </button>
              </div>
              {emailError && (
                <p id={emailErrId} role="alert" className="mt-1 text-xs text-red-200">
                  {nlEmailInvalid}
                </p>
              )}
            </div>
            <div className="text-left">
              <label htmlFor={gdprId} className="flex items-center gap-2 text-sm text-primary-foreground/80 justify-center cursor-pointer">
                <input
                  id={gdprId}
                  type="checkbox"
                  checked={gdpr}
                  onChange={e => setGdpr(e.target.checked)}
                  aria-invalid={gdprError || undefined}
                  aria-describedby={gdprError ? gdprErrId : undefined}
                  aria-required="true"
                  disabled={submitting}
                  className="rounded border-primary-foreground/40 focus:ring-2 focus:ring-gold accent-gold"
                />
                <span data-editable="newsletter.gdpr" data-page={PAGE}>{nlGdpr}</span>
              </label>
              {gdprError && (
                <p id={gdprErrId} role="alert" className="mt-1 text-xs text-red-200 text-center">
                  {nlGdprInvalid}
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
