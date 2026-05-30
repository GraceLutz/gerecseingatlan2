import { useLanguage } from "@/contexts/LanguageContext";
import { useProperties } from "@/hooks/useProperties";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { categoryOrder, subTypesByCategory } from "@/data/propertyTypeHierarchy";

const SearchSection = () => {
  const { t, localePath } = useLanguage();
  const navigate = useNavigate();
  const { properties, locations } = useProperties();
  const [filters, setFilters] = useState({
    status: "sale" as "sale" | "rent",
    category: "",
    subType: "",
    location: "",
    csokPlusz: "" as "" | "yes" | "no",
    propertyId: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    minRooms: "",
    maxRooms: "",
  });

  const availableSubTypes = filters.category ? (subTypesByCategory[filters.category] ?? []) : [];

  const resultCount = useMemo(() => {
    return properties.filter(p => {
      if (filters.status === "sale" && p.status !== "sale") return false;
      if (filters.status === "rent" && p.status !== "rent") return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.subType && p.subCategory !== filters.subType) return false;
      if (filters.location && p.location !== filters.location) return false;
      if (filters.minPrice && p.price < Number(filters.minPrice) * 1_000_000) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice) * 1_000_000) return false;
      if (filters.minArea && p.area < Number(filters.minArea)) return false;
      if (filters.maxArea && p.area > Number(filters.maxArea)) return false;
      if (filters.minRooms && p.rooms < Number(filters.minRooms)) return false;
      if (filters.maxRooms && p.rooms > Number(filters.maxRooms)) return false;
      if (filters.propertyId && !String(p.id).includes(filters.propertyId)) return false;
      return true;
    }).length;
  }, [filters, properties]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.category) params.set("category", filters.category);
    if (filters.subType) params.set("subType", filters.subType);
    if (filters.location) params.set("location", filters.location);
    if (filters.csokPlusz) params.set("csok", filters.csokPlusz);
    if (filters.propertyId) params.set("id", filters.propertyId);
    if (filters.minPrice) params.set("minPrice", String(Number(filters.minPrice) * 1_000_000));
    if (filters.maxPrice) params.set("maxPrice", String(Number(filters.maxPrice) * 1_000_000));
    if (filters.minArea) params.set("minArea", filters.minArea);
    if (filters.maxArea) params.set("maxArea", filters.maxArea);
    if (filters.minRooms) params.set("rooms", filters.minRooms);
    if (filters.maxRooms) params.set("maxRooms", filters.maxRooms);
    navigate(localePath("/ingatlanok") + "?" + params.toString());
  };

  const selectClasses =
    "h-12 px-4 rounded border border-gray-300 bg-white text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary w-full appearance-none";

  const inputClasses =
    "h-12 px-3 rounded border border-gray-300 bg-white text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary w-full";

  // Shared class for numeric inputs inside range groups — DRY
  const rangeInputClasses =
    "w-16 text-sm text-center border-none outline-none bg-transparent focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const rangeGroupClasses =
    "flex items-center gap-2 h-12 px-3 rounded border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-primary";

  const toggleBase =
    "flex-1 h-12 px-4 text-sm font-bold uppercase border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5DA8] focus-visible:ring-offset-2";
  const toggleActive = "bg-[#2E5DA8] text-white border-[#2E5DA8]";
  const toggleInactive = "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";

  return (
    <section className="py-10 bg-light-bg" aria-labelledby="search-heading">
      <div className="container mx-auto px-4">
        <h2 id="search-heading" className="sr-only">{t.search.title}</h2>
        <form
          className="max-w-6xl mx-auto bg-[#FFFFF0] rounded-xl shadow-lg p-6 md:p-8"
          onSubmit={e => { e.preventDefault(); handleSearch(); }}
          role="search"
          aria-label={t.search.title}
        >
          {/* Row 1: Status toggle, Type, Subtype, Location, CSOK, ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-4 items-end">
            {/* ELADÓ / KIADÓ toggle */}
            <div className="flex" role="group" aria-label={t.search.status}>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, status: "sale" }))}
                aria-pressed={filters.status === "sale"}
                className={`${toggleBase} rounded-l ${filters.status === "sale" ? toggleActive : toggleInactive}`}
              >
                {t.search.forSale}
              </button>
              <button
                type="button"
                onClick={() => setFilters(f => ({ ...f, status: "rent" }))}
                aria-pressed={filters.status === "rent"}
                className={`${toggleBase} rounded-r border-l-0 ${filters.status === "rent" ? toggleActive : toggleInactive}`}
              >
                {t.search.forRent}
              </button>
            </div>

            {/* Típus */}
            <div>
              <label htmlFor="search-type" className="sr-only">{t.search.type}</label>
              <select
                id="search-type"
                value={filters.category}
                onChange={e => setFilters(f => ({ ...f, category: e.target.value, subType: "" }))}
                className={selectClasses}
              >
                <option value="">--- {t.search.type} ---</option>
                {categoryOrder.map(cat => (
                  <option key={cat} value={cat}>{t.propertyCategories[cat] ?? cat}</option>
                ))}
              </select>
            </div>

            {/* Altípus — only active when Típus is selected */}
            <div>
              <label htmlFor="search-subtype" className="sr-only">{t.search.subType}</label>
              <select
                id="search-subtype"
                value={filters.subType}
                onChange={e => setFilters(f => ({ ...f, subType: e.target.value }))}
                className={selectClasses}
                disabled={!filters.category || availableSubTypes.length === 0}
              >
                <option value="">--- {t.search.subType} ---</option>
                {availableSubTypes.map(sub => (
                  <option key={sub} value={sub}>{t.propertySubTypes[sub] ?? sub}</option>
                ))}
              </select>
            </div>

            {/* Település/Kerület */}
            <div>
              <label htmlFor="search-location" className="sr-only">{t.search.location}</label>
              <select
                id="search-location"
                value={filters.location}
                onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                className={selectClasses}
              >
                <option value="">--- {t.search.location} ---</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* CSOK PLUSZ */}
            <div>
              <label htmlFor="search-csok" className="sr-only">{t.search.csokPlusz}</label>
              <select
                id="search-csok"
                value={filters.csokPlusz}
                onChange={e => setFilters(f => ({ ...f, csokPlusz: e.target.value as "" | "yes" | "no" }))}
                className={selectClasses}
              >
                <option value="">{t.search.csokPlusz} {t.search.csokNotImportant}</option>
                <option value="yes">{t.search.csokPlusz} {t.search.csokYes}</option>
                <option value="no">{t.search.csokPlusz} {t.search.csokNo}</option>
              </select>
            </div>

            {/* ID, Hirdetésazonosító */}
            <div className="lg:col-span-2">
              <label htmlFor="search-id" className="sr-only">{t.search.propertyId}</label>
              <input
                id="search-id"
                type="text"
                inputMode="numeric"
                placeholder={t.search.propertyId}
                value={filters.propertyId}
                onChange={e => setFilters(f => ({ ...f, propertyId: e.target.value }))}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Row 2: Price range, Area range, Rooms range, Search button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {/* Ár: Min - Max Millió Ft */}
            <div role="group" aria-label={t.search.price} className={rangeGroupClasses}>
              <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{t.search.price}</span>
              <input
                type="number"
                min="0"
                placeholder={t.search.minPrice}
                value={filters.minPrice}
                onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                className={rangeInputClasses}
                aria-label={`${t.search.price} ${t.search.minPrice}`}
              />
              <span className="text-gray-400" aria-hidden="true">-</span>
              <input
                type="number"
                min="0"
                placeholder={t.search.maxPrice}
                value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className={rangeInputClasses}
                aria-label={`${t.search.price} ${t.search.maxPrice}`}
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">{t.search.millionHuf}</span>
            </div>

            {/* Alapterület: Min - Max m² */}
            <div role="group" aria-label={t.search.area} className={rangeGroupClasses}>
              <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{t.search.area}</span>
              <input
                type="number"
                min="0"
                placeholder={t.search.minArea}
                value={filters.minArea}
                onChange={e => setFilters(f => ({ ...f, minArea: e.target.value }))}
                className={rangeInputClasses}
                aria-label={`${t.search.area} ${t.search.minArea}`}
              />
              <span className="text-gray-400" aria-hidden="true">-</span>
              <input
                type="number"
                min="0"
                placeholder={t.search.maxArea}
                value={filters.maxArea}
                onChange={e => setFilters(f => ({ ...f, maxArea: e.target.value }))}
                className={rangeInputClasses}
                aria-label={`${t.search.area} ${t.search.maxArea}`}
              />
              <span className="text-xs text-gray-400">m²</span>
            </div>

            {/* Szobaszám: Min - Max */}
            <div role="group" aria-label={t.search.rooms} className={rangeGroupClasses}>
              <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{t.search.rooms}:</span>
              <input
                type="number"
                min="0"
                placeholder={t.search.minRooms}
                value={filters.minRooms}
                onChange={e => setFilters(f => ({ ...f, minRooms: e.target.value }))}
                className={rangeInputClasses}
                aria-label={`${t.search.rooms} ${t.search.minRooms}`}
              />
              <span className="text-gray-400" aria-hidden="true">-</span>
              <input
                type="number"
                min="0"
                placeholder={t.search.maxRooms}
                value={filters.maxRooms}
                onChange={e => setFilters(f => ({ ...f, maxRooms: e.target.value }))}
                className={rangeInputClasses}
                aria-label={`${t.search.rooms} ${t.search.maxRooms}`}
              />
            </div>

            {/* KERESÉS button with live result count */}
            <button
              type="submit"
              className="h-12 flex items-center justify-center gap-2 px-6 bg-[#2E5DA8] hover:bg-[#254B8A] text-white font-bold text-sm uppercase rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5DA8] focus-visible:ring-offset-2"
            >
              <Search size={18} aria-hidden="true" />
              <span>{t.search.resultsCount}</span>
              <span aria-live="polite" aria-atomic="true">({resultCount})</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SearchSection;
