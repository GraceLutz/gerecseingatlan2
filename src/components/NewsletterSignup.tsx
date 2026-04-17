import { useId, useState } from "react";
import { Loader2 } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public newsletter signup form for the footer.
 * Posts to /api/newsletter/subscribe with double opt-in.
 * All UI text in Hungarian.
 */
export default function NewsletterSignup() {
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
        setError(data.error ?? "Hiba történt a feliratkozás során.");
        return;
      }

      setEmail("");
      setName("");
      setGdpr(false);
      setTouched(false);
      setSubmitted(true);
    } catch {
      setError("Hálózati hiba. Kérjük, próbálja újra később.");
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
          Iratkozzon fel hírlevelünkre
        </h2>
        <p className="text-gold/90 font-body mb-8 max-w-lg mx-auto">
          Értesüljön elsőként új ingatlanjainkról és aktuális ajánlatainkról!
        </p>

        <div
          id={statusId}
          role="status"
          aria-live="polite"
          className="min-h-[1.5rem]"
        >
          {submitted && (
            <p className="text-gold font-semibold font-body text-lg">
              Sikeres feliratkozás! Kérjük, erősítse meg e-mail címét a kapott
              levélben.
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
                Név (nem kötelező)
              </label>
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Teljes név"
                autoComplete="name"
                disabled={submitting}
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#0B2340]/15 text-[#0B2340] placeholder:text-[#0B2340]/40 focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:ring-offset-2 focus:ring-offset-[#D8EEFF] focus:border-[#4682B4] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div className="mb-3 text-left">
              <label htmlFor={emailId} className={labelClass}>
                E-mail cím
              </label>
              <div className="flex gap-2">
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => email.length > 0 && setTouched(true)}
                  placeholder="pelda@email.hu"
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
                  className="px-6 py-3 bg-[#4682B4] text-white font-semibold rounded-lg hover:bg-[#3B72A4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:ring-offset-2 focus:ring-offset-[#D8EEFF] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  <span>Feliratkozás</span>
                </button>
              </div>
              {emailError && (
                <p
                  id={emailErrId}
                  role="alert"
                  className="mt-1 text-xs text-destructive"
                >
                  Kérjük, adjon meg érvényes e-mail címet.
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
                  Hozzájárulok az adataim kezeléséhez az{" "}
                  <a
                    href="/adatkezelesi-tajekoztato"
                    className="underline hover:text-[#0B2340] focus:outline-none focus:ring-2 focus:ring-[#4682B4] rounded"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    adatkezelési tájékoztató
                  </a>{" "}
                  szerint.
                </span>
              </label>
              {gdprError && (
                <p
                  id={gdprErrId}
                  role="alert"
                  className="mt-1 text-xs text-destructive text-center"
                >
                  A feliratkozáshoz el kell fogadnia az adatkezelést.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
