import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Property } from "@/data/properties";
import { Home, BedDouble, Maximize } from "lucide-react";

interface PropertyListItemProps {
  property: Property;
}

const PropertyListItemComponent: React.FC<PropertyListItemProps> = ({ property }) => {
  const { lang, t, localePath } = useLanguage();
  const { formatPrice } = useCurrency();

  const [imgError, setImgError] = useState(false);

  const title = lang === "hu" ? property.titleHu : property.titleEn;
  const statusLabel = property.status === "sale" ? t.featured.forSale : t.featured.forRent;
  const statusColor = property.status === "sale" ? "bg-primary" : "bg-gold";
  const hasImage = property.images.length > 0 && !imgError;

  return (
    <article>
      <Link
        to={localePath(`/ingatlan/${property.id}`)}
        className="group flex flex-row bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        aria-label={`${title} — ${formatPrice(property.price)}`}
      >
        <figure className="relative w-[150px] min-h-[120px] shrink-0 bg-muted overflow-hidden m-0">
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
              <Home size={32} className="text-primary/30" />
            </div>
          )}
          <figcaption className="sr-only">{title}</figcaption>
          <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase rounded text-primary-foreground ${statusColor}`}>
            {statusLabel}
          </span>
        </figure>

        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
            <p className="text-lg font-heading font-bold text-gold">
              {formatPrice(property.price)}
              {property.status === "rent" && <span className="text-sm font-body font-normal text-muted-foreground"> /{t.properties.perMonth}</span>}
            </p>
            {property.featured && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-gold text-accent-foreground" aria-label={t.featured.title}>
                ★
              </span>
            )}
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
            {property.location}
            {(property.category || property.subCategory) && (
              <span className="text-xs text-muted-foreground/70">
                {" · "}{t.propertyCategories[property.category] ?? ""}
                {property.subCategory && t.propertySubTypes[property.subCategory] && (
                  <> / {t.propertySubTypes[property.subCategory]}</>
                )}
              </span>
            )}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

const PropertyListItem = memo(PropertyListItemComponent);

export default PropertyListItem;
