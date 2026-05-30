import { useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import { useNewsletterSubscription } from "@/hooks/useNewsletterSubscription";

const PAGE = "/";

export default function NewsletterSignup() {
  const { t, localePath } = useLanguage();

  const { content: nlTitle } = useContentBlock(PAGE, "newsletter.title", t.newsletter.title);
  const { content: nlSubtitle } = useContentBlock(PAGE, "newsletter.subtitle", t.newsletter.subtitle);
  const { content: nlSuccessConfirm } = useContentBlock(PAGE, "newsletter.successConfirm", t.newsletter.successConfirm);
  const { content: nlNameLabel } = useContentBlock(PAGE, "newsletter.nameLabel", t.newsletter.nameLabel);
  const { content: nlNamePlaceholder } = useContentBlock(PAGE, "newsletter.namePlaceholder", t.newsletter.namePlaceholder);
  const { content: nlPlaceholder } = useContentBlock(PAGE, "newsletter.placeholder", t.newsletter.placeholder);
  const { content: nlEmailPlaceholder } = useContentBlock(PAGE, "newsletter.emailPlaceholder", t.newsletter.emailPlaceholder);
  const { content: nlButton } = useContentBlock(PAGE, "newsletter.button", t.newsletter.button);
  const { content: nlEmailInvalid } = useContentBlock(PAGE, "newsletter.emailInvalid", t.newsletter.emailInvalid);
  const { content: nlGdprConsentPrefix } = useContentBlock(PAGE, "newsletter.gdprConsentPrefix", t.newsletter.gdprConsentPrefix);
  const { content: nlGdprLinkText } = useContentBlock(PAGE, "newsletter.gdprLinkText", t.newsletter.gdprLinkText);
  const { content: nlGdprConsentSuffix } = useContentBlock(PAGE, "newsletter.gdprConsentSuffix", t.newsletter.gdprConsentSuffix);
  const { content: nlGdprInvalid } = useContentBlock(PAGE, "newsletter.gdprInvalid", t.newsletter.gdprInvalid);
  const { content: nlNetworkError } = useContentBlock(PAGE, "newsletter.networkError", t.newsletter.networkError);
  const { content: nlGenericError } = useContentBlock(PAGE, "newsletter.genericError", t.newsletter.genericError);

  const [name, setName] = useState("");
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
  const nameId = `${uid}-name`;
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

  const onSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e, { name });
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
          data-editable="newsletter.title"
          data-page={PAGE}
          className="text-2xl md:text-3xl font-heading font-bold text-gold mb-3"
        >
          {nlTitle}
        </h2>
        <p data-editable="newsletter.subtitle" data-page={PAGE} className="text-gold/90 font-body mb-8 max-w-lg mx-auto">
          {nlSubtitle}
        </p>

        <div
          id={statusId}
          role="status"
          aria-live="polite"
          className="min-h-[1.5rem]"
        >
          {submitted && (
            <p data-editable="newsletter.successConfirm" data-page={PAGE} className="text-gold font-semibold font-body text-lg">
              {nlSuccessConfirm}
            </p>
          )}
          {error && (
            <p className="text-red-200 font-semibold font-body text-sm">
              {displayError}
            </p>
          )}
        </div>

        {!submitted && (
          <form
            onSubmit={onSubmit}
            className="max-w-md mx-auto mt-2"
            noValidate
          >
            <div className="mb-3 text-left">
              <label htmlFor={nameId} className={labelClass}>
                {nlNameLabel}
              </label>
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={nlNamePlaceholder}
                autoComplete="name"
                disabled={submitting}
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#0B2340]/15 text-[#0B2340] placeholder:text-[#0B2340]/40 focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:ring-offset-2 focus:ring-offset-[#D8EEFF] focus:border-[#4682B4] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div className="mb-3 text-left">
              <label htmlFor={emailId} className={labelClass}>
                {nlPlaceholder}
              </label>
              <div className="flex gap-2">
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => email.length > 0 && setTouched(true)}
                  placeholder={nlEmailPlaceholder}
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
                  <span data-editable="newsletter.button" data-page={PAGE}>{nlButton}</span>
                </button>
              </div>
              {emailError && (
                <p
                  id={emailErrId}
                  role="alert"
                  className="mt-1 text-xs text-destructive"
                >
                  {nlEmailInvalid}
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
                  {nlGdprConsentPrefix}
                  <a
                    href={localePath("/adatkezelesi-tajekoztato")}
                    className="underline hover:text-[#0B2340] focus:outline-none focus:ring-2 focus:ring-[#4682B4] rounded"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {nlGdprLinkText}
                  </a>
                  {nlGdprConsentSuffix}
                </span>
              </label>
              {gdprError && (
                <p
                  id={gdprErrId}
                  role="alert"
                  className="mt-1 text-xs text-destructive text-center"
                >
                  {nlGdprInvalid}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
