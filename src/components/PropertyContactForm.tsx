import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail, Clock, Loader2 } from "lucide-react";

const PHONE_PATTERN = /^[+]?[\d\s\-()]{6,20}$/;

const contactSchema = z.object({
  name: z.string().min(1, "required"),
  email: z.string().email("invalid"),
  phone: z.string().regex(PHONE_PATTERN, "invalid").or(z.literal("")),
  message: z.string().max(2000).optional(),
  gdpr: z.boolean().refine((v) => v === true, { message: "required" }),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface PropertyContactFormProps {
  propertyId: string;
  propertyTitle: string;
}

/**
 * Sticky sidebar contact/inquiry form for property detail pages.
 * Uses react-hook-form + zod for validation. Includes GDPR consent checkbox.
 * Visible labels, inline errors wired via aria-describedby, and async submit so
 * `isSubmitting` drives the loading/disabled button state.
 */
const PropertyContactForm: React.FC<PropertyContactFormProps> = ({ propertyId, propertyTitle }) => {
  const { t, lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  // Stable unique ids so multiple forms on a page don't collide.
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    phone: `${uid}-phone`,
    message: `${uid}-message`,
    gdpr: `${uid}-gdpr`,
  };
  const errIds = {
    name: `${ids.name}-error`,
    email: `${ids.email}-error`,
    phone: `${ids.phone}-error`,
    gdpr: `${ids.gdpr}-error`,
  };

  const defaultMessage = lang === "hu"
    ? `Érdeklődöm a(z) ${propertyId} számú ingatlan iránt.`
    : `I am interested in property ${propertyId}.`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: defaultMessage,
      gdpr: false,
    },
  });

  // Async so RHF sets isSubmitting; resolves immediately (no real network call yet).
  const onSubmit = async (data: ContactFormData) => {
    // In production this would POST to an API endpoint.
    console.info("[PropertyContactForm] Inquiry submitted", { propertyId, ...data });
    setSubmitted(true);
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-lg border bg-background text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError ? "border-destructive" : "border-border"
    }`;

  const labelClass = "block text-xs font-semibold text-foreground mb-1";

  // Localized error messages resolved from zod's machine-readable codes.
  const errText = (key: "required" | "invalid") =>
    lang === "hu"
      ? key === "required"
        ? "Kötelező mező"
        : "Érvénytelen formátum"
      : key === "required"
        ? "Required field"
        : "Invalid format";

  const gdprErrText = lang === "hu"
    ? "A folytatáshoz el kell fogadnia az adatkezelést."
    : "You must accept the privacy policy to continue.";

  return (
    <div className="bg-card rounded-xl p-6 shadow-md border border-border sticky top-24 space-y-5">
      <h3 className="text-lg font-heading font-bold text-dark-green">{t.contact.inquiry}</h3>
      <p className="text-xs text-muted-foreground truncate" title={propertyTitle}>
        {propertyId}
      </p>

      {submitted ? (
        <div className="py-8 text-center" role="status" aria-live="polite">
          <p className="text-primary font-semibold text-lg mb-1" aria-hidden="true">✓</p>
          <p className="text-sm text-muted-foreground">
            {lang === "hu"
              ? "Köszönjük érdeklődését! Hamarosan felvesszük Önnel a kapcsolatot."
              : "Thank you for your inquiry! We will contact you shortly."}
          </p>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor={ids.name} className={labelClass}>
              {t.contact.name} <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <input
              id={ids.name}
              type="text"
              placeholder={t.contact.name}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? errIds.name : undefined}
              aria-required="true"
              disabled={isSubmitting}
              className={inputClass(!!errors.name)}
              {...register("name")}
            />
            {errors.name && (
              <p id={errIds.name} role="alert" className="mt-1 text-xs text-destructive">
                {errText(errors.name.message as "required" | "invalid")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={ids.email} className={labelClass}>
              {t.contact.email} <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <input
              id={ids.email}
              type="email"
              placeholder={t.contact.email}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? errIds.email : undefined}
              aria-required="true"
              autoComplete="email"
              disabled={isSubmitting}
              className={inputClass(!!errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p id={errIds.email} role="alert" className="mt-1 text-xs text-destructive">
                {errText(errors.email.message as "required" | "invalid")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={ids.phone} className={labelClass}>
              {t.contact.phone}
            </label>
            <input
              id={ids.phone}
              type="tel"
              placeholder={t.contact.phone}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? errIds.phone : undefined}
              autoComplete="tel"
              pattern="[+]?[\d\s\-()]{6,20}"
              maxLength={20}
              disabled={isSubmitting}
              className={inputClass(!!errors.phone)}
              {...register("phone")}
            />
            {errors.phone && (
              <p id={errIds.phone} role="alert" className="mt-1 text-xs text-destructive">
                {errText("invalid")}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={ids.message} className={labelClass}>
              {t.contact.message}
            </label>
            <textarea
              id={ids.message}
              placeholder={t.contact.message}
              rows={4}
              maxLength={2000}
              disabled={isSubmitting}
              className={`${inputClass(false)} resize-none`}
              {...register("message")}
            />
          </div>

          {/* GDPR consent */}
          <div>
            <label
              htmlFor={ids.gdpr}
              className={`flex items-start gap-2 text-xs cursor-pointer ${
                errors.gdpr ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              <input
                id={ids.gdpr}
                type="checkbox"
                className="mt-0.5 accent-primary"
                aria-invalid={!!errors.gdpr}
                aria-describedby={errors.gdpr ? errIds.gdpr : undefined}
                aria-required="true"
                disabled={isSubmitting}
                {...register("gdpr")}
              />
              <span>
                {lang === "hu"
                  ? "Elfogadom az adatkezelési tájékoztatót és hozzájárulok adataim kezeléséhez."
                  : "I accept the privacy policy and consent to the processing of my data."}
              </span>
            </label>
            {errors.gdpr && (
              <p id={errIds.gdpr} role="alert" className="mt-1 text-xs text-destructive">
                {gdprErrText}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-main-green/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            <span>
              {isSubmitting
                ? lang === "hu" ? "Küldés…" : "Sending…"
                : t.contact.send}
            </span>
          </button>
        </form>
      )}

      {/* Agency contact info */}
      <div className="border-t border-border pt-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-primary shrink-0" aria-hidden="true" />
          <a href="tel:+3634123456" className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">+36 34 123 456</a>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-primary shrink-0" aria-hidden="true" />
          <a href="mailto:info@gerecseingatlan.hu" className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">info@gerecseingatlan.hu</a>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary shrink-0" aria-hidden="true" />
          <span>{t.contact.weekdays}</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyContactForm;
