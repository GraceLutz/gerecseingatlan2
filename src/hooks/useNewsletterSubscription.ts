import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscriptionOptions {
  name?: string;
}

interface SubscriptionState {
  email: string;
  setEmail: (email: string) => void;
  gdpr: boolean;
  setGdpr: (gdpr: boolean) => void;
  submitted: boolean;
  submitting: boolean;
  error: string | null;
  touched: boolean;
  setTouched: (touched: boolean) => void;
  isValidEmail: boolean;
  emailError: boolean;
  gdprError: boolean;
  handleSubmit: (e: React.FormEvent, options?: SubscriptionOptions) => Promise<void>;
  reset: () => void;
}

export function useNewsletterSubscription(): SubscriptionState {
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const isValidEmail = EMAIL_REGEX.test(email);
  const emailError = touched && email.length > 0 && !isValidEmail;
  const gdprError = touched && !gdpr;

  const reset = () => {
    setEmail("");
    setGdpr(false);
    setTouched(false);
    setSubmitted(false);
    setError(null);
  };

  const handleSubmit = async (
    e: React.FormEvent,
    options?: SubscriptionOptions,
  ) => {
    e.preventDefault();
    setTouched(true);
    setError(null);

    if (!isValidEmail || !gdpr || submitting) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        email: email.trim(),
        gdprConsent: true,
      };
      if (options?.name?.trim()) {
        payload.name = options.name.trim();
      }

      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "GENERIC_ERROR");
        return;
      }

      setEmail("");
      setGdpr(false);
      setTouched(false);
      setSubmitted(true);
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    gdpr,
    setGdpr,
    submitted,
    submitting,
    error,
    touched,
    setTouched,
    isValidEmail,
    emailError,
    gdprError,
    handleSubmit,
    reset,
  };
}
