import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useProperties } from "@/hooks/useProperties";
import { buildBreadcrumbJsonLd } from "@/components/SEOHead";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyContactForm from "@/components/PropertyContactForm";
import PropertyMap from "@/components/PropertyMap";
import SimilarProperties from "@/components/SimilarProperties";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { Maximize, BedDouble, Bath, Calendar, Thermometer, Zap, Building, Car, Trees, ChevronRight, Facebook, Mail, Copy } from "lucide-react";

const PropertyDetailPage = () => {
  const { t, lang, localePath } = useLanguage();
  const { formatPrice } = useCurrency();
  const { properties, isLoading } = useProperties();
  const { id } = useParams();
  const { toast } = useToast();

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

  const handleFacebookShare = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400",
    );
  }, []);

  const handleEmailShare = useCallback(() => {
    const subject = encodeURIComponent(`Ingatlan: ${title}`);
    const body = encodeURIComponent(
      `Nézd meg ezt az ingatlant a Gerecse Ingatlannál:\n\n${title}\n${window.location.href}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [title]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link másolva!" });
    } catch {
      toast({ title: "A link másolása nem sikerült.", variant: "destructive" });
    }
  }, [toast]);

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

  const ORIGIN = "https://gerecseingatlan.hu";
  const ogImage = property.images?.[0]
    ? (property.images[0].startsWith("http") ? property.images[0] : `${ORIGIN}${property.images[0]}`)
    : undefined;

  useEffect(() => {
    const schemas: Record<string, unknown>[] = [
      buildBreadcrumbJsonLd([
        { name: t.nav.home, url: ORIGIN },
        { name: t.nav.properties, url: `${ORIGIN}${localePath("/ingatlanok")}` },
        { name: title, url: `${ORIGIN}${localePath(`/ingatlan/${property.id}`)}` },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: title,
        description: seoDescription,
        url: `${ORIGIN}${localePath(`/ingatlan/${property.id}`)}`,
        ...(property.images?.[0] && { image: property.images[0] }),
        offers: {
          "@type": "Offer",
          price: property.price,
          priceCurrency: "HUF",
          availability: "https://schema.org/InStock",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: property.location,
          addressCountry: "HU",
        },
        ...(property.area > 0 && {
          floorSize: { "@type": "QuantitativeValue", value: property.area, unitCode: "MTK" },
        }),
        ...(property.rooms > 0 && { numberOfRooms: property.rooms }),
      },
    ];

    const scripts = schemas.map((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-page-jsonld", "true");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      return script;
    });

    return () => scripts.forEach((s) => s.remove());
  }, [property.id, property.price, property.location, property.area, property.rooms, property.images, title, seoDescription, t.nav.home, t.nav.properties, localePath]);

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath={`/ingatlan/${property.id}`} ogImage={ogImage}>
      {/* Page header */}
      <section className="bg-dark-green py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-primary-foreground/60 mb-3">
            <Link to={localePath("/")} className="hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:text-primary-foreground focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-green rounded-sm">
              {t.nav.home}
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link to={localePath("/ingatlanok")} className="hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:text-primary-foreground focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-green rounded-sm">
              {t.nav.properties}
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
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

          {/* Social sharing buttons */}
          <div className="flex items-center gap-4 mt-4" role="group" aria-label={lang === "hu" ? "Megosztás" : "Share"}>
            <button
              type="button"
              onClick={handleFacebookShare}
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] p-2 rounded-lg bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-green"
              aria-label="Facebook"
            >
              <Facebook size={20} aria-hidden="true" />
              <span className="text-xs font-body">Facebook</span>
            </button>
            <button
              type="button"
              onClick={handleEmailShare}
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-green"
              aria-label="Email"
            >
              <Mail size={20} aria-hidden="true" />
              <span className="text-xs font-body">Email</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-green"
              aria-label={lang === "hu" ? "Link másolása" : "Copy link"}
            >
              <Copy size={20} aria-hidden="true" />
              <span className="text-xs font-body">{lang === "hu" ? "Link" : "Copy"}</span>
            </button>
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
