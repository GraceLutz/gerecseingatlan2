import { ExternalLink } from "lucide-react";
import { useId, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyMapProps {
  lat?: number;
  lng?: number;
  location: string;
  fullAddress?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ lat, lng, location, fullAddress }) => {
  const { lang } = useLanguage();
  const uid = useId();
  const headingId = `${uid}-map-heading`;
  const [iframeError, setIframeError] = useState(false);

  const label = lang === "hu" ? "Elhelyezkedés" : "Location";
  const openLabel = lang === "hu" ? "Megnyitás Google Maps-ben" : "Open in Google Maps";

  const searchQuery = fullAddress || location;
  const mapQuery = lat !== undefined && lng !== undefined
    ? `${lat},${lng}`
    : searchQuery;

  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsHref = lat !== undefined && lng !== undefined
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

  return (
    <section
      className="rounded-xl overflow-hidden border border-border bg-card"
      aria-labelledby={headingId}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2
          id={headingId}
          className="text-xl font-heading font-bold text-dark-green"
        >
          {label}
        </h2>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={lang === "hu" ? `${openLabel} (új lapon nyílik)` : `${openLabel} (opens in a new tab)`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-main-green underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-2 min-h-[44px]"
        >
          {openLabel}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
      {iframeError ? (
        <div className="w-full aspect-[2/1] flex items-center justify-center bg-muted text-muted-foreground text-sm p-4 text-center">
          <p>
            {lang === "hu"
              ? "A térkép jelenleg nem elérhető. Kérjük, használja a fenti linket a Google Maps megnyitásához."
              : "Map is currently unavailable. Please use the link above to open Google Maps."}
          </p>
        </div>
      ) : (
        <iframe
          src={embedSrc}
          className="w-full aspect-[2/1] border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${label}: ${location}`}
          onError={() => setIframeError(true)}
        />
      )}
    </section>
  );
};

export default PropertyMap;
