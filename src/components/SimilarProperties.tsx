import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/data/properties";
import PropertyCard from "./PropertyCard";

interface SimilarPropertiesProps {
  /** The current property (excluded from results) */
  property: Property;
  /** Maximum number of similar properties to show */
  limit?: number;
}

/**
 * Displays a grid of similar properties based on type, then location.
 * Excludes the current property from results.
 */
const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ property, limit = 3 }) => {
  const { t } = useLanguage();
  const { properties } = useProperties();

  const similar = useMemo(() => {
    const candidates = properties.filter((p) => p.id !== property.id);

    // Score by relevance: same type +2, same location +1, same status +1
    const scored = candidates.map((p) => {
      let score = 0;
      if (p.type === property.type) score += 2;
      if (p.location === property.location) score += 1;
      if (p.status === property.status) score += 1;
      return { property: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.property);
  }, [property, limit, properties]);

  if (similar.length === 0) return null;

  return (
    <section className="mt-16 md:mt-20" aria-labelledby="similar-heading">
      <h2 id="similar-heading" className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-6 md:mb-8">
        {t.properties.similar}
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none p-0 m-0">
        {similar.map((p) => (
          <li key={p.id}>
            <PropertyCard property={p} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SimilarProperties;
