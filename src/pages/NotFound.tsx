import { useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * 404 Not Found page with Hungarian-first UX.
 * Provides helpful navigation links to key pages (properties, contact, FAQ)
 * so users can recover quickly. Sets noindex to prevent search engines from
 * indexing 404 pages.
 */
const NotFound = () => {
  const { lang, localePath } = useLanguage();

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const prev = meta?.getAttribute("content") ?? null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, follow";
    return () => {
      if (prev !== null) {
        meta!.content = prev;
      } else {
        meta!.remove();
      }
    };
  }, []);

  const isHu = lang === "hu";

  const title = isHu
    ? "Az oldal nem található"
    : "Page not found";

  const description = isHu
    ? "A keresett oldal nem létezik vagy áthelyezésre került. Tekintse meg legfrissebb ingatlanajánlatainkat vagy lépjen velünk kapcsolatba."
    : "The page you are looking for does not exist or has been moved. Browse our latest properties or get in touch.";

  /** Helpful navigation links for recovery */
  const links = [
    {
      to: localePath("/"),
      label: isHu ? "Vissza a kezdőlapra" : "Return to Home",
      primary: true,
    },
    {
      to: localePath("/ingatlanok"),
      label: isHu ? "Legfrissebb ingatlanok" : "Latest Properties",
      primary: false,
    },
    {
      to: localePath("/kapcsolat"),
      label: isHu ? "Kapcsolatfelvétel" : "Contact Us",
      primary: false,
    },
    {
      to: localePath("/gyik"),
      label: isHu ? "Gyakori kérdések" : "FAQ",
      primary: false,
    },
  ];

  return (
    <Layout
      title={isHu ? "404 – Az oldal nem található" : "404 – Page not found"}
      description={description}
    >
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1
            className="mb-4 text-7xl font-heading font-bold text-dark-navy"
            aria-label={`${isHu ? "Hiba" : "Error"} 404`}
          >
            404
          </h1>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            {description}
          </p>
          <nav aria-label={isHu ? "Hasznos linkek" : "Helpful links"}>
            <ul className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center list-none p-0">
              {links.map(({ to, label, primary }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`inline-block px-6 py-3 font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      primary
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
