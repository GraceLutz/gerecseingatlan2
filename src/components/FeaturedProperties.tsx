import { useLanguage } from "@/contexts/LanguageContext";
import { useProperties } from "@/hooks/useProperties";
import PropertyCard from "./PropertyCard";
import { Link } from "react-router-dom";

const FeaturedProperties = () => {
  const { t, lang, localePath } = useLanguage();
  const { properties, isLoading } = useProperties();

  // Show featured first; if none are featured, show all (up to 6)
  const featured = properties.filter(p => p.featured);
  const displayProperties = (featured.length > 0 ? featured : properties).slice(0, 6);

  // Skeleton loader while fetching
  if (isLoading) {
    return (
      <section className="py-16 md:py-20 bg-background" aria-labelledby="featured-heading">
        <div className="container mx-auto px-4">
          <h2 id="featured-heading" className="text-3xl md:text-4xl font-heading font-bold text-dark-green text-center mb-10 md:mb-12">
            {t.featured.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (displayProperties.length === 0) {
    return (
      <section className="py-16 md:py-20 bg-background" aria-labelledby="featured-heading">
        <div className="container mx-auto px-4 text-center">
          <h2 id="featured-heading" className="text-3xl md:text-4xl font-heading font-bold text-dark-green mb-6">
            {t.featured.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {lang === "hu"
              ? "Hamarosan új ingatlanokkal bővül kínálatunk!"
              : "New properties coming soon!"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-background" aria-labelledby="featured-heading">
      <div className="container mx-auto px-4">
        <h2 id="featured-heading" className="text-3xl md:text-4xl font-heading font-bold text-dark-green text-center mb-10 md:mb-12">
          {t.featured.title}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
          {displayProperties.map(property => (
            <li key={property.id}>
              <PropertyCard property={property} />
            </li>
          ))}
        </ul>
        <div className="text-center mt-10 md:mt-12">
          <Link
            to={localePath("/ingatlanok")}
            className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-main-navy/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            {t.featured.viewAll}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
