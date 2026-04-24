import { MapPin, ExternalLink } from "lucide-react";
import { useId } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyMapProps {
  lat?: number;
  lng?: number;
  location: string;
}

/**
 * Property location card. Shows a static, keyboard-accessible fallback with the
 * property's city/region and (when available) coordinates, plus a focusable
 * external link to open the location in Google Maps.
 *
 * When a real map library (Leaflet/MapLibre/Google Maps) is wired up, it should
 * replace the fallback block while preserving the heading and the external link.
 */
const PropertyMap: React.FC<PropertyMapProps> = ({ lat, lng, location }) => {
  const { lang } = useLanguage();
  const uid = useId();
  const headingId = `${uid}-map-heading`;

  const label = lang === "hu" ? "Elhelyezkedés" : "Location";
  const openLabel = lang === "hu" ? "Megnyitás Google Maps-ben" : "Open in Google Maps";
  // Accessible link name that explicitly conveys the destination for SRs.
  const openAriaLabel = lang === "hu"
    ? `${openLabel}: ${location} (új lapon nyílik)`
    : `${openLabel}: ${location} (opens in a new tab)`;

  const mapsHref = lat !== undefined && lng !== undefined
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(location)}`;

  return (
    <section
      className="rounded-xl overflow-hidden border border-border bg-card"
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="text-xl font-heading font-bold text-dark-green px-4 pt-4 pb-2"
      >
        {label}
      </h2>
      <div
        className="relative aspect-[2/1] bg-light-bg flex flex-col items-center justify-center gap-2 px-4 text-center"
        role="img"
        aria-label={`${label}: ${location}`}
      >
        <MapPin size={40} className="text-primary" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">{location}</p>
        {lat !== undefined && lng !== undefined && (
          <p className="text-xs text-muted-foreground">
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </p>
        )}
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={openAriaLabel}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-main-green active:text-main-green/80 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-3 min-h-[44px]"
        >
          {openLabel}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};

export default PropertyMap;
