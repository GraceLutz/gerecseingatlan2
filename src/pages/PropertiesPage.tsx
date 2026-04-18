import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useProperties } from "@/hooks/useProperties";
import PropertyCard from "@/components/PropertyCard";
import PropertyListItem from "@/components/PropertyListItem";
import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";

const PAGE_SIZE = 9;

interface Filters {
  location: string;
  type: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  rooms: string;
  idSearch: string;
}

const EMPTY_FILTERS: Filters = {
  location: "", type: "", status: "", minPrice: "", maxPrice: "",
  minArea: "", maxArea: "", rooms: "", idSearch: "",
};

/* ---- Extracted filter panel ---- */
interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  locations: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onClear, hasActiveFilters, locations }) => {
  const { t } = useLanguage();

  const types = [
    { value: "house", label: t.propertyTypes.house },
    { value: "brick", label: t.propertyTypes.brick },
    { value: "panel", label: t.propertyTypes.panel },
    { value: "semiDetached", label: t.propertyTypes.semiDetached },
    { value: "rowHouse", label: t.propertyTypes.rowHouse },
    { value: "holiday", label: t.propertyTypes.holiday },
    { value: "land", label: t.propertyTypes.land },
    { value: "industrial", label: t.propertyTypes.industrial },
  ];

  const fieldClass = "w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors";

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder={t.properties.idSearch}
        aria-label={t.properties.idSearch}
        value={filters.idSearch}
        onChange={e => onFilterChange("idSearch", e.target.value)}
        className={fieldClass}
      />

      <select
        value={filters.location}
        onChange={e => onFilterChange("location", e.target.value)}
        aria-label={t.search.location}
        className={fieldClass}
      >
        <option value="">{t.search.location}</option>
        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
      </select>

      <select
        value={filters.type}
        onChange={e => onFilterChange("type", e.target.value)}
        aria-label={t.search.type}
        className={fieldClass}
      >
        <option value="">{t.search.type}</option>
        {types.map(tp => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
      </select>

      <select
        value={filters.status}
        onChange={e => onFilterChange("status", e.target.value)}
        aria-label={t.search.status}
        className={fieldClass}
      >
        <option value="">{t.search.status}</option>
        <option value="sale">{t.search.forSale}</option>
        <option value="rent">{t.search.forRent}</option>
      </select>

      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground mb-1.5">{t.search.priceRange}</legend>
        <div className="flex gap-2">
          <input type="number" placeholder={t.search.minPrice} aria-label={t.search.minPrice}
            value={filters.minPrice} onChange={e => onFilterChange("minPrice", e.target.value)}
            className={fieldClass} min={0} />
          <input type="number" placeholder={t.search.maxPrice} aria-label={t.search.maxPrice}
            value={filters.maxPrice} onChange={e => onFilterChange("maxPrice", e.target.value)}
            className={fieldClass} min={0} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground mb-1.5">{t.search.areaRange}</legend>
        <div className="flex gap-2">
          <input type="number" placeholder={t.search.minArea} aria-label={t.search.minArea}
            value={filters.minArea} onChange={e => onFilterChange("minArea", e.target.value)}
            className={fieldClass} min={0} />
          <input type="number" placeholder={t.search.maxArea} aria-label={t.search.maxArea}
            value={filters.maxArea} onChange={e => onFilterChange("maxArea", e.target.value)}
            className={fieldClass} min={0} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold text-muted-foreground mb-1.5">{t.search.rooms}</legend>
        <input type="number" placeholder={t.search.any} aria-label={t.search.rooms}
          value={filters.rooms} onChange={e => onFilterChange("rooms", e.target.value)}
          className={fieldClass} min={0} />
      </fieldset>

      {hasActiveFilters && (
        <button onClick={onClear} className="w-full text-sm text-primary hover:underline">
          {t.properties.clearFilters}
        </button>
      )}
    </div>
  );
};

/* ---- Pagination helper: truncated page numbers ---- */
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

/* ---- Main page ---- */
const PropertiesPage = () => {
  const { t, lang } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const { properties, locations } = useProperties();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    status: searchParams.get("status") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    rooms: searchParams.get("rooms") || "",
    idSearch: searchParams.get("id") || "",
  });

  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "area-desc" | "newest">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  const filtered = useMemo(() => {
    let result = properties.filter(p => {
      if (filters.location && p.location !== filters.location) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (filters.minArea && p.area < Number(filters.minArea)) return false;
      if (filters.maxArea && p.area > Number(filters.maxArea)) return false;
      if (filters.rooms && p.rooms < Number(filters.rooms)) return false;
      if (filters.idSearch && !p.id.toLowerCase().includes(filters.idSearch.toLowerCase())) return false;
      return true;
    });

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "area-desc":
        result = [...result].sort((a, b) => b.area - a.area);
        break;
      default:
        break;
    }

    return result;
  }, [filters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = getPageNumbers(page, totalPages);

  const prevPageLabel = lang === "hu" ? "Előző oldal" : "Previous page";
  const nextPageLabel = lang === "hu" ? "Következő oldal" : "Next page";
  const paginationLabel = lang === "hu" ? "Lapozás" : "Pagination";
  const filtersLabel = lang === "hu" ? "Szűrők" : "Filters";

  const seoTitle = lang === "hu"
    ? "Eladó és kiadó ingatlanok – Gerecse Ingatlan"
    : "Properties for Sale and Rent – Gerecse Ingatlan";
  const seoDescription = lang === "hu"
    ? "Böngésszen eladó és kiadó ingatlanjaink között a Gerecse régióban. Szűrés típus, ár, méret és település szerint."
    : "Browse properties for sale and rent in the Gerecse region. Filter by type, price, size, and location.";

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/ingatlanok">
      <section className="bg-dark-green py-16 text-center">
        <h1 className="text-4xl font-heading font-bold text-primary-foreground mb-2">{t.properties.title}</h1>
        <p className="text-primary-foreground/70 font-body">{t.properties.subtitle}</p>
      </section>

      <section className="py-10 bg-background">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop sidebar — pinned flush to viewport edge */}
          <aside className="hidden lg:block lg:w-64 shrink-0 lg:sticky lg:top-24 lg:self-start" aria-label={filtersLabel}>
            <div className="bg-card rounded-r-xl p-5 shadow-sm border border-l-0 border-border">
              <FilterPanel filters={filters} onFilterChange={handleFilterChange} onClear={clearFilters} hasActiveFilters={hasActiveFilters} locations={locations} />
            </div>
          </aside>

            {/* Mobile filter toggle */}
            <div className="lg:hidden px-4">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium"
                aria-expanded={mobileFiltersOpen}
                aria-controls="mobile-filters"
              >
                <SlidersHorizontal size={16} />
                {t.search.title}
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
              </button>

              {mobileFiltersOpen && (
                <div id="mobile-filters" className="mt-3 bg-card rounded-xl p-5 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">{t.search.title}</span>
                    <button onClick={() => setMobileFiltersOpen(false)} aria-label={t.common.close}>
                      <X size={18} />
                    </button>
                  </div>
                  <FilterPanel filters={filters} onFilterChange={handleFilterChange} onClear={clearFilters} hasActiveFilters={hasActiveFilters} locations={locations} />
                </div>
              )}
            </div>

            {/* Results */}
            <div className="flex-1 px-4 lg:pl-0 lg:pr-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-sm text-muted-foreground">
                  {filtered.length} {t.properties.results}
                </p>

                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    aria-label={t.properties.sortBy}
                    className="px-3 py-1.5 text-xs border border-border rounded bg-background"
                  >
                    <option value="newest">{t.properties.sortDate}</option>
                    <option value="price-asc">{t.properties.sortPrice} ↑</option>
                    <option value="price-desc">{t.properties.sortPrice} ↓</option>
                    <option value="area-desc">{t.properties.sortSize} ↓</option>
                  </select>

                  <div className="hidden sm:flex border border-border rounded overflow-hidden" role="radiogroup" aria-label={t.properties.gridView}>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
                      role="radio"
                      aria-checked={viewMode === "grid"}
                      aria-label={t.properties.gridView}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
                      role="radio"
                      aria-checked={viewMode === "list"}
                      aria-label={t.properties.listView}
                    >
                      <List size={16} />
                    </button>
                  </div>

                  <button
                    onClick={toggleCurrency}
                    className="px-3 py-1.5 text-xs font-semibold border border-gold/50 rounded text-gold hover:bg-gold/10 transition-colors"
                  >
                    {currency}
                  </button>
                </div>
              </div>

              {paginated.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  }
                >
                  {paginated.map(p =>
                    viewMode === "grid" ? (
                      <PropertyCard key={p.id} property={p} />
                    ) : (
                      <PropertyListItem key={p.id} property={p} />
                    )
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">{t.properties.noResults}</p>
              )}

              {/* Pagination with truncation */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-10" aria-label={paginationLabel}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm rounded border border-border bg-background disabled:opacity-40 hover:bg-light-bg transition-colors"
                    aria-label={prevPageLabel}
                  >
                    ←
                  </button>
                  {pageNumbers.map((n, i) =>
                    n === "ellipsis" ? (
                      <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-muted-foreground">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`px-3 py-2 text-sm rounded border transition-colors ${
                          n === page
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border bg-background hover:bg-light-bg"
                        }`}
                        aria-current={n === page ? "page" : undefined}
                      >
                        {n}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm rounded border border-border bg-background disabled:opacity-40 hover:bg-light-bg transition-colors"
                    aria-label={nextPageLabel}
                  >
                    →
                  </button>
                </nav>
              )}
            </div>
        </div>
      </section>
    </Layout>
  );
};

export default PropertiesPage;
