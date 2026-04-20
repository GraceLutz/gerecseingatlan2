import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { hu } from "@/i18n/hu";
import { en } from "@/i18n/en";
import { useNavigate, useLocation } from "react-router-dom";

type Language = "hu" | "en";
type Translations = typeof hu;

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  isEnglish: boolean;
  /** Generates a localized path: translates HU slugs to EN slugs when in English mode */
  localePath: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = { hu, en };

/**
 * Route slug mapping: Hungarian path segments → English equivalents.
 * Used by localePath() to generate correct English URLs,
 * and by setLanguage() to translate between HU↔EN when switching.
 */
const huToEnSlugs: Record<string, string> = {
  "/bemutatkozas": "/introduction",
  "/munkatarsaink": "/our-team",
  "/velemenyek": "/testimonials",
  "/ingatlanok": "/properties",
  "/kapcsolat": "/contact",
  "/ingatlan-ertekesites-berbeadas": "/property-sales-and-rentals",
  "/ertekbecsles-ertekmeghatrozas": "/appraisal-and-valuation",
  "/belsoepiteszet-latvanyterv": "/interior-design",
  "/teljeskoru-jogi-hatter": "/full-legal-support",
  "/hitel-allami-tamogatasok": "/loans-and-subsidies",
  "/energetikai-tanusitvany": "/energy-certificate",
  "/villamos-biztonsagi-felulvizsgalat": "/electrical-safety-inspection",
  "/gyik": "/faq",
  "/impresszum": "/impresszum",
  "/adatkezelesi-tajekoztato": "/privacy-policy",
  "/cookie-tajekoztato": "/cookie-policy",
  "/aszf": "/terms",
};

/** Reverse mapping: English slugs → Hungarian equivalents */
const enToHuSlugs: Record<string, string> = Object.fromEntries(
  Object.entries(huToEnSlugs).map(([hu, en]) => [en, hu]),
);

/**
 * Translates a HU path to its EN equivalent.
 * Handles both static routes and dynamic segments like /ingatlan/:id → /property/:id.
 */
export function translateHuToEn(huPath: string): string {
  // Exact match
  if (huToEnSlugs[huPath]) return huToEnSlugs[huPath];

  // Dynamic property detail: /ingatlan/:id → /property/:id
  const propertyMatch = huPath.match(/^\/ingatlan\/(.+)$/);
  if (propertyMatch) return `/property/${propertyMatch[1]}`;

  // No mapping found — return as-is
  return huPath;
}

/**
 * Translates an EN path to its HU equivalent.
 * Handles both static routes and dynamic segments like /property/:id → /ingatlan/:id.
 */
export function translateEnToHu(enPath: string): string {
  // Exact match
  if (enToHuSlugs[enPath]) return enToHuSlugs[enPath];

  // Dynamic property detail: /property/:id → /ingatlan/:id
  const propertyMatch = enPath.match(/^\/property\/(.+)$/);
  if (propertyMatch) return `/ingatlan/${propertyMatch[1]}`;

  // No mapping found — return as-is
  return enPath;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isEn = location.pathname.startsWith("/en");
  const [lang, setLang] = useState<Language>(isEn ? "en" : "hu");

  // Sync language state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlLang = location.pathname.startsWith("/en") ? "en" : "hu";
    if (urlLang !== lang) {
      setLang(urlLang);
    }
  }, [location.pathname, lang]);

  const setLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    const currentPath = location.pathname;
    const search = location.search;

    if (newLang === "en" && !currentPath.startsWith("/en")) {
      const translatedPath = currentPath === "/" ? "" : translateHuToEn(currentPath);
      navigate("/en" + translatedPath + search);
    } else if (newLang === "hu" && currentPath.startsWith("/en")) {
      const enPath = currentPath.replace(/^\/en/, "") || "/";
      const huPath = enPath === "/" ? "/" : translateEnToHu(enPath);
      navigate(huPath + search);
    }
  }, [location.pathname, location.search, navigate]);

  const localePath = useCallback((path: string) => {
    if (lang === "en") {
      const translatedPath = path === "/" ? "" : translateHuToEn(path);
      return `/en${translatedPath}`;
    }
    return path;
  }, [lang]);

  const value = useMemo(
    () => ({ lang, t: translations[lang], setLanguage, isEnglish: lang === "en", localePath }),
    [lang, setLanguage, localePath],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
