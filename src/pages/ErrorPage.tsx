import React from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";

/**
 * Generic error boundary page for unhandled runtime errors.
 * Renders in Hungarian (primary) or English based on current language context.
 *
 * Used as the `errorElement` on the root route in App.tsx so that
 * any uncaught throw inside a route component lands here instead of
 * crashing the whole SPA.
 */
const ErrorPage: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  // Determine language from URL since LanguageProvider may not be available
  // inside the error boundary (it sits above the provider).
  const isEn = typeof window !== "undefined" && window.location.pathname.startsWith("/en");
  const homePath = isEn ? "/en" : "/";

  const statusCode = isRouteErrorResponse(error) ? error.status : 500;
  const isNotFound = statusCode === 404;

  const title = isEn
    ? isNotFound
      ? "Page not found"
      : "An unexpected error occurred"
    : isNotFound
      ? "Az oldal nem található"
      : "Váratlan hiba történt";

  const description = isEn
    ? isNotFound
      ? "The page you are looking for does not exist or has been moved."
      : "Something went wrong. Please try again later."
    : isNotFound
      ? "A keresett oldal nem létezik vagy áthelyezésre került."
      : "Valami hiba történt. Kérjük, próbálja újra később.";

  const homeLabel = isEn ? "Return to Home" : "Vissza a kezdőlapra";
  const backLabel = isEn ? "Go back" : "Visszalépés";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="mb-4 text-7xl font-heading font-bold text-dark-navy" aria-label={`${isEn ? "Error" : "Hiba"} ${statusCode}`}>
          {statusCode}
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={homePath}
            className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {homeLabel}
          </a>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-block px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          >
            {backLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
