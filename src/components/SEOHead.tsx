import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/** Static mapping of Hungarian paths to their English equivalents for hreflang */
const HU_TO_EN_PATH: Record<string, string> = {
  "/": "/en",
  "/bemutatkozas": "/en/introduction",
  "/munkatarsaink": "/en/our-team",
  "/ingatlanok": "/en/properties",
  "/velemenyek": "/en/testimonials",
  "/kapcsolat": "/en/contact",
  "/gyik": "/en/faq",
  "/impresszum": "/en/impresszum",
  "/adatkezelesi-tajekoztato": "/en/privacy-policy",
  "/cookie-tajekoztato": "/en/cookie-policy",
  "/aszf": "/en/terms",
  "/ingatlan-ertekesites-berbeadas": "/en/property-sales-and-rentals",
  "/ertekbecsles-ertekmeghatrozas": "/en/appraisal-and-valuation",
  "/belsoepiteszet-latvanyterv": "/en/interior-design",
  "/teljeskoru-jogi-hatter": "/en/full-legal-support",
  "/hitel-allami-tamogatasok": "/en/loans-and-subsidies",
  "/energetikai-tanusitvany": "/en/energy-certificate",
  "/villamos-biztonsagi-felulvizsgalat": "/en/electrical-safety-inspection",
};

/** Dynamic route patterns: /ingatlan/:id → /en/property/:id, /:slug → /en/:slug */
function resolveHuEnPair(huPath: string): { hu: string; en: string } | null {
  if (HU_TO_EN_PATH[huPath]) {
    return { hu: huPath, en: HU_TO_EN_PATH[huPath] };
  }
  const propertyMatch = huPath.match(/^\/ingatlan\/(.+)$/);
  if (propertyMatch) {
    return { hu: huPath, en: `/en/property/${propertyMatch[1]}` };
  }
  // Service slug pages: /:slug → /en/:slug (same slug)
  if (huPath.startsWith("/") && !huPath.startsWith("/en") && !huPath.startsWith("/admin")) {
    return { hu: huPath, en: `/en${huPath}` };
  }
  return null;
}

interface SEOHeadProps {
  /** Page title — appended to site name */
  title?: string;
  /** Meta description */
  description?: string;
  /** Canonical path (without locale prefix, e.g. "/rolunk") */
  canonicalPath?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Page type for og:type */
  ogType?: string;
  /** Optional JSON-LD structured data object(s) to inject */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Builds the default RealEstateAgent / LocalBusiness JSON-LD schema
 * for the Gerecse Ingatlan site. Emitted on every page so Google
 * always has the organization knowledge-graph data available.
 */
function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "@id": "https://gerecseingatlan.hu/#organization",
    name: "Gerecse Ingatlan",
    description: "Professzionális ingatlanszolgáltatások a Gerecse régióban. Eladó és kiadó ingatlanok Tata, Tatabánya, Esztergom környékén – értékbecslés, jogi háttér, hitel tanácsadás.",
    url: "https://gerecseingatlan.hu",
    logo: "https://gerecseingatlan.hu/gerecsenewlogo.png",
    image: "https://gerecseingatlan.hu/og-image.png",
    telephone: "+36-70-613-2658",
    email: "info@gerecseingatlan.hu",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tata",
      addressRegion: "Komárom-Esztergom",
      postalCode: "2890",
      addressCountry: "HU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 47.649,
      longitude: 18.326,
    },
    areaServed: [
      { "@type": "City", name: "Tata" },
      { "@type": "City", name: "Tatabánya" },
      { "@type": "City", name: "Esztergom" },
      { "@type": "City", name: "Nyergesújfalu" },
      { "@type": "City", name: "Komárom" },
      { "@type": "City", name: "Oroszlány" },
      { "@type": "AdministrativeArea", name: "Komárom-Esztergom megye" },
      { "@type": "AdministrativeArea", name: "Gerecse" },
    ],
    priceRange: "$$",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    sameAs: [
      "https://www.facebook.com/gerecseingatlan",
    ],
  };
}

/** Builds a BreadcrumbList JSON-LD schema from an array of breadcrumb items. */
export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Sets document-level SEO metadata (title, meta tags, lang attribute,
 * Open Graph locale, hreflang, canonical, and JSON-LD structured data)
 * via direct DOM manipulation. No external dependency required.
 */
const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = "website",
  jsonLd,
}) => {
  const { lang, t } = useLanguage();

  const siteName = "Gerecse Ingatlan";
  const alreadyBranded = title?.includes(siteName);
  const fullTitle = title
    ? alreadyBranded ? title : `${title} | ${siteName}`
    : siteName;
  const metaDescription = description || t.seo.defaultDescription;
  const ORIGIN = "https://gerecseingatlan.hu";

  useEffect(() => {
    document.title = fullTitle;
    document.documentElement.lang = lang;

    /* ── helper: upsert a <meta> tag ── */
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    /* ── helper: upsert a <link> tag by compound selector ── */
    const setLink = (selector: string, attrs: Record<string, string>) => {
      let el = document.querySelector(selector) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        document.head.appendChild(el);
      }
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    };

    /* ── Standard meta ── */
    setMeta("name", "description", metaDescription);

    /* ── Open Graph ── */
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", metaDescription);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", siteName);
    setMeta("property", "og:locale", lang === "hu" ? "hu_HU" : "en_US");
    setMeta(
      "property",
      "og:locale:alternate",
      lang === "hu" ? "en_US" : "hu_HU",
    );
    const resolvedImage = ogImage || `${ORIGIN}/og-image.png`;
    setMeta("property", "og:image", resolvedImage);

    /* ── Twitter Card ── */
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", metaDescription);
    setMeta("name", "twitter:image", resolvedImage);

    /* ── Resolve HU/EN path pair from the canonical (always Hungarian) path ── */
    const currentPath = canonicalPath || "/";
    const pair = resolveHuEnPair(currentPath);
    const huPath = currentPath;
    const enPath = pair?.en ?? `/en${currentPath === "/" ? "" : currentPath}`;

    /* ── Canonical URL ── */
    const fullCanonical =
      lang === "en" ? `${ORIGIN}${enPath}` : `${ORIGIN}${huPath}`;
    setMeta("property", "og:url", fullCanonical);
    setLink('link[rel="canonical"]', { rel: "canonical", href: fullCanonical });

    /* ── hreflang tags ── */
    const huUrl = `${ORIGIN}${huPath}`;
    setLink('link[rel="alternate"][hreflang="hu"]', {
      rel: "alternate",
      hreflang: "hu",
      href: huUrl,
    });
    setLink('link[rel="alternate"][hreflang="x-default"]', {
      rel: "alternate",
      hreflang: "x-default",
      href: huUrl,
    });
    setLink('link[rel="alternate"][hreflang="en"]', {
      rel: "alternate",
      hreflang: "en",
      href: `${ORIGIN}${enPath}`,
    });

    /* ── JSON-LD structured data ── */
    // Remove previously injected JSON-LD scripts
    document
      .querySelectorAll('script[data-seo-head="jsonld"]')
      .forEach((el) => el.remove());

    // Always inject organization schema
    const orgScript = document.createElement("script");
    orgScript.type = "application/ld+json";
    orgScript.setAttribute("data-seo-head", "jsonld");
    orgScript.textContent = JSON.stringify(buildOrganizationJsonLd());
    document.head.appendChild(orgScript);

    // Inject page-specific JSON-LD if provided
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach((item) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-head", "jsonld");
        script.textContent = JSON.stringify(item);
        document.head.appendChild(script);
      });
    }

    /* cleanup: remove JSON-LD scripts on unmount */
    return () => {
      document
        .querySelectorAll('script[data-seo-head="jsonld"]')
        .forEach((el) => el.remove());
    };
  }, [fullTitle, metaDescription, lang, canonicalPath, ogImage, ogType, jsonLd]);

  return null;
};

export default SEOHead;
