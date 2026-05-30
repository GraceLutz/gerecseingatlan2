import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Property } from "@/data/properties";
import { Home, BedDouble, Maximize } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

const PropertyCardComponent: React.FC<PropertyCardProps> = ({ property }) => {
  const { lang, t, localePath } = useLanguage();
  const { formatPrice } = useCurrency();

  const [imgError, setImgError] = useState(false);

  const title = lang === "hu" ? property.titleHu : property.titleEn;
  const statusLabel = property.status === "sale" ? t.featured.forSale : t.featured.forRent;
  const statusColor = property.status === "sale" ? "bg-primary" : "bg-gold";
  const hasImage = property.images.length > 0 && !imgError;

  return (
    <article className="h-full">
    <Link
      to={localePath(`/ingatlan/${property.id}`)}
      className="group flex flex-col h-full bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      aria-label={`${title} — ${formatPrice(property.price)}`}
    >
      <figure className="relative h-[280px] md:h-[260px] xl:h-[220px] bg-muted overflow-hidden rounded-t-lg m-0">
        {hasImage ? (
          <img
            src={property.images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center" aria-hidden="true">
            <Home size={48} className="text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" aria-hidden="true" />
        <figcaption className="sr-only">{title}</figcaption>
        <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold uppercase rounded text-primary-foreground ${statusColor}`}>
          {statusLabel}
        </span>
        {property.featured && (
          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold uppercase rounded bg-gold text-accent-foreground" aria-label={t.featured.title}>
            ★
          </span>
        )}
      </figure>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-lg font-heading font-bold text-gold mb-1">
          {formatPrice(property.price)}
          {property.status === "rent" && <span className="text-sm font-body font-normal text-muted-foreground"> /{t.properties.perMonth}</span>}
        </p>
        <h3 className="font-heading font-semibold text-foreground mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-1 line-clamp-1">{property.location}</p>
        {(property.category || property.subCategory) && (
          <p className="text-xs text-muted-foreground/70 mb-2">
            {t.propertyCategories[property.category] ?? ""}
            {property.subCategory && t.propertySubTypes[property.subCategory] && (
              <> · {t.propertySubTypes[property.subCategory]}</>
            )}
          </p>
        )}
        <div className="mt-auto flex items-center gap-4 text-sm text-muted-foreground">
          {property.area > 0 && (
            <span className="flex items-center gap-1">
              <Maximize size={14} aria-hidden="true" />
              <span>{property.area} {t.featured.sqm}</span>
            </span>
          )}
          {property.rooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={14} aria-hidden="true" />
              <span>{property.rooms} {t.featured.rooms}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
    </article>
  );
};

const PropertyCard = memo(PropertyCardComponent);

export default PropertyCard;
