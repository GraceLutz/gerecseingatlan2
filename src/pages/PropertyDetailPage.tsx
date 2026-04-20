import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useProperties } from "@/hooks/useProperties";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyContactForm from "@/components/PropertyContactForm";
import PropertyMap from "@/components/PropertyMap";
import SimilarProperties from "@/components/SimilarProperties";
import { useParams, Link } from "react-router-dom";
import { Maximize, BedDouble, Bath, Calendar, Thermometer, Zap, Building, Car, Trees, ChevronRight } from "lucide-react";

const PropertyDetailPage = () => {
  const { t, lang, localePath } = useLanguage();
  const { formatPrice } = useCurrency();
  const { properties, isLoading } = useProperties();
  const { id } = useParams();

  const property = properties.find(p => p.id === id);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-32 text-center text-muted-foreground" aria-live="polite">
          {t.common.loading}
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="py-32 text-center text-muted-foreground">
          {t.properties.notFound}
        </div>
      </Layout>
    );
  }

  const title = lang === "hu" ? property.titleHu : property.titleEn;
  const description = lang === "hu" ? property.descriptionHu : property.descriptionEn;
  const statusLabel = property.status === "sale" ? t.featured.forSale : t.featured.forRent;

  const details = [
    property.area > 0 ? { icon: Maximize, label: t.properties.area, value: `${property.area} m²` } : null,
    property.lotSize ? { icon: Trees, label: t.properties.lotSize, value: `${property.lotSize} m²` } : null,
    property.rooms > 0 ? { icon: BedDouble, label: t.featured.rooms, value: property.rooms } : null,
    property.bathrooms > 0 ? { icon: Bath, label: t.properties.bathrooms, value: property.bathrooms } : null,
    property.builtYear ? { icon: Calendar, label: t.properties.builtYear, value: property.builtYear } : null,
    property.heating ? { icon: Thermometer, label: t.properties.heating, value: property.heating } : null,
    property.energy ? { icon: Zap, label: t.properties.energy, value: property.energy } : null,
    property.floor !== undefined ? { icon: Building, label: t.properties.floor, value: property.floor } : null,
    property.parking !== undefined ? { icon: Car, label: t.properties.parking, value: property.parking ? t.properties.yes : t.properties.no } : null,
  ].filter(Boolean) as { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string | number }[];

  const seoTitle = `${title} – ${property.location} | Gerecse Ingatlan`;
  const seoDescription = `${title} – ${property.location}.${property.area > 0 ? ` ${property.area} m²,` : ""} ${formatPrice(property.price)}. Gerecse Ingatlan.`;

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath={`/ingatlanok/${property.id}`}>
      {/* Page header */}
      <section className="bg-dark-green py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-primary-foreground/60 mb-3">
            <Link to={localePath("/")} className="hover:text-primary-foreground transition-colors">
              {t.nav.home}
            </Link>
            <ChevronRight size={14} />
            <Link to={localePath("/ingatlanok")} className="hover:text-primary-foreground transition-colors">
              {t.nav.properties}
            </Link>
            <ChevronRight size={14} />
            <span className="text-primary-foreground" aria-current="page">{property.id}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">{title}</h1>
              <p className="text-primary-foreground/70 font-body mt-1">{property.location} · {property.id}</p>
            </div>
            <span className={`self-start px-4 py-1.5 text-sm font-semibold uppercase rounded text-primary-foreground ${
              property.status === "sale" ? "bg-primary" : "bg-gold"
            }`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: gallery + details */}
            <div className="lg:w-2/3 space-y-8">
              {/* Gallery */}
              <PropertyGallery images={property.images} alt={title} />

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <p className="text-3xl font-heading font-bold text-gold">
                  {formatPrice(property.price)}
                  {property.status === "rent" && (
                    <span className="text-lg font-body font-normal text-muted-foreground">
                      {" "}/{t.properties.perMonth}
                    </span>
                  )}
                </p>
              </div>

              {/* Details grid */}
              <div>
                <h2 className="text-xl font-heading font-bold text-dark-green mb-4">{t.properties.mainData}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {details.map((d, i) => {
                    const Icon = d.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 bg-light-bg rounded-lg p-3">
                        <Icon size={18} className="text-primary shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{d.label}</p>
                          <p className="text-sm font-semibold text-foreground">{d.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-heading font-bold text-dark-green mb-3">{t.properties.description}</h2>
                <p className="text-muted-foreground font-body leading-relaxed whitespace-pre-line">{description}</p>
              </div>

              {/* Map */}
              <PropertyMap lat={property.lat} lng={property.lng} location={property.location} />
            </div>

            {/* Right: contact form */}
            <div className="lg:w-1/3">
              <PropertyContactForm propertyId={property.id} propertyTitle={title} />
            </div>
          </div>

          {/* Similar properties */}
          <SimilarProperties property={property} />
        </div>
      </section>
    </Layout>
  );
};

export default PropertyDetailPage;
