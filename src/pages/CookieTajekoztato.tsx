import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Cookie, ShieldCheck, BarChart3, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Cookie tájékoztató (Cookie Policy) page.
 *
 * Describes what cookies the site uses, grouped by category (necessary,
 * analytics, marketing). Required for GDPR transparency and referenced
 * by the cookie consent banner.
 */
const CookieTajekoztato = () => {
  const { lang, localePath } = useLanguage();
  const isHu = lang === "hu";

  const title = isHu
    ? "Cookie (süti) tájékoztató – Gerecse Ingatlan"
    : "Cookie Policy – Gerecse Ingatlan";
  const description = isHu
    ? "Tájékoztató a gerecseingatlan.hu weboldalon használt sütikről: típusok, célok, kezelés időtartama."
    : "Information about cookies used on gerecseingatlan.hu: types, purposes, and retention.";

  /** Cookie category card */
  const CookieCategory = ({
    icon,
    titleHu,
    titleEn,
    children,
  }: {
    icon: React.ReactNode;
    titleHu: string;
    titleEn: string;
    children: React.ReactNode;
  }) => (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-heading font-bold text-dark-navy">
          {isHu ? titleHu : titleEn}
        </h2>
      </div>
      <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </article>
  );

  return (
    <Layout title={title} description={description} canonicalPath="/cookie-tajekoztato">
      {/* Hero */}
      <section className="bg-dark-green py-16 text-center">
        <div className="flex justify-center mb-4">
          <Cookie size={40} className="text-gold" aria-hidden="true" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
          {isHu ? "Cookie (süti) tájékoztató" : "Cookie Policy"}
        </h1>
        <p className="text-primary-foreground/70 font-body mt-2 max-w-xl mx-auto px-4">
          {isHu
            ? "Információk a weboldalunkon használt sütikről"
            : "Information about the cookies used on our website"}
        </p>
      </section>

      {/* Content */}
      <section className="py-16 bg-light-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Introduction */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                {isHu ? "Mi az a süti (cookie)?" : "What Are Cookies?"}
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <p>
                  {isHu
                    ? "A sütik (cookie-k) kis szöveges fájlok, amelyeket a weboldal az Ön böngészőjében tárol. Segítenek a weboldal működésében, a felhasználói élmény javításában és a látogatottsági statisztikák gyűjtésében."
                    : "Cookies are small text files stored in your browser by the website. They help the website function, improve user experience, and collect visitor statistics."}
                </p>
                <p>
                  {isHu
                    ? "A gerecseingatlan.hu weboldalon Ön szabadon dönthet arról, hogy mely sütiket engedélyezi. Az alapvető funkciókhoz szükséges sütik nélkül is működik a weboldal."
                    : "On gerecseingatlan.hu you can freely decide which cookies to allow. The website functions without optional cookies."}
                </p>
              </div>
            </article>

            {/* Necessary cookies */}
            <CookieCategory
              icon={<ShieldCheck size={20} className="text-primary" aria-hidden="true" />}
              titleHu="Szükséges sütik"
              titleEn="Necessary Cookies"
            >
              <p>
                {isHu
                  ? "Ezek a sütik elengedhetetlenek a weboldal alapvető működéséhez. Nem gyűjtenek személyes adatokat, és nem kapcsolhatók ki."
                  : "These cookies are essential for the basic functionality of the website. They do not collect personal data and cannot be disabled."}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 pr-4 font-semibold text-dark-navy">
                        {isHu ? "Süti neve" : "Cookie name"}
                      </th>
                      <th className="py-2 pr-4 font-semibold text-dark-navy">
                        {isHu ? "Cél" : "Purpose"}
                      </th>
                      <th className="py-2 font-semibold text-dark-navy">
                        {isHu ? "Lejárat" : "Expiry"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">gerecse_cookie_consent</td>
                      <td className="py-2 pr-4">
                        {isHu ? "Süti-hozzájárulás állapota" : "Cookie consent status"}
                      </td>
                      <td className="py-2">1 {isHu ? "év" : "year"}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">lang</td>
                      <td className="py-2 pr-4">
                        {isHu ? "Választott nyelv" : "Selected language"}
                      </td>
                      <td className="py-2">1 {isHu ? "év" : "year"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CookieCategory>

            {/* Analytics cookies */}
            <CookieCategory
              icon={<BarChart3 size={20} className="text-primary" aria-hidden="true" />}
              titleHu="Analitikai sütik"
              titleEn="Analytics Cookies"
            >
              <p>
                {isHu
                  ? "Ezek a sütik segítenek megérteni, hogyan használják a látogatók a weboldalt. Az adatgyűjtés anonim. Csak az Ön hozzájárulásával aktiválódnak."
                  : "These cookies help us understand how visitors use the website. Data collection is anonymous. They are activated only with your consent."}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 pr-4 font-semibold text-dark-navy">
                        {isHu ? "Süti neve" : "Cookie name"}
                      </th>
                      <th className="py-2 pr-4 font-semibold text-dark-navy">
                        {isHu ? "Szolgáltató" : "Provider"}
                      </th>
                      <th className="py-2 pr-4 font-semibold text-dark-navy">
                        {isHu ? "Cél" : "Purpose"}
                      </th>
                      <th className="py-2 font-semibold text-dark-navy">
                        {isHu ? "Lejárat" : "Expiry"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                      <td className="py-2 pr-4">Google Analytics</td>
                      <td className="py-2 pr-4">
                        {isHu ? "Egyedi látogatóazonosító" : "Unique visitor ID"}
                      </td>
                      <td className="py-2">2 {isHu ? "év" : "years"}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-xs">_ga_*</td>
                      <td className="py-2 pr-4">Google Analytics 4</td>
                      <td className="py-2 pr-4">
                        {isHu ? "Munkamenet-azonosító" : "Session ID"}
                      </td>
                      <td className="py-2">2 {isHu ? "év" : "years"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CookieCategory>

            {/* Marketing cookies */}
            <CookieCategory
              icon={<BarChart3 size={20} className="text-primary" aria-hidden="true" />}
              titleHu="Marketing sütik"
              titleEn="Marketing Cookies"
            >
              <p>
                {isHu
                  ? "A marketing sütik segítenek releváns hirdetések megjelenítésében. Jelenleg weboldalunk nem használ marketing sütiket, de a jövőben bevezethetjük őket. Ilyen esetben csak az Ön kifejezett hozzájárulásával aktiváljuk."
                  : "Marketing cookies help display relevant advertisements. Currently our website does not use marketing cookies, but we may introduce them in the future. In that case, they will only be activated with your explicit consent."}
              </p>
            </CookieCategory>

            {/* Managing cookies */}
            <CookieCategory
              icon={<Settings2 size={20} className="text-primary" aria-hidden="true" />}
              titleHu="Sütik kezelése"
              titleEn="Managing Cookies"
            >
              <p>
                {isHu
                  ? 'A sütibeállításokat bármikor módosíthatja a weboldal cookie-sávjának \u201EBeállítások\u201D gombjával, vagy a böngészője beállításaiban.'
                  : "You can change your cookie preferences at any time using the cookie banner's \"Settings\" button, or in your browser settings."}
              </p>
              <p>
                {isHu
                  ? "A legtöbb böngészőben a következő módon törölheti vagy letilthatja a sütiket:"
                  : "In most browsers, you can delete or disable cookies as follows:"}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Chrome:</strong>{" "}
                  {isHu
                    ? "Beállítások → Adatvédelem és biztonság → Cookie-k"
                    : "Settings → Privacy and Security → Cookies"}
                </li>
                <li>
                  <strong>Firefox:</strong>{" "}
                  {isHu
                    ? "Beállítások → Adatvédelem és biztonság → Sütik"
                    : "Settings → Privacy & Security → Cookies"}
                </li>
                <li>
                  <strong>Safari:</strong>{" "}
                  {isHu
                    ? "Beállítások → Adatvédelem → Sütik kezelése"
                    : "Preferences → Privacy → Manage Website Data"}
                </li>
                <li>
                  <strong>Edge:</strong>{" "}
                  {isHu
                    ? "Beállítások → Cookie-k és webhelyadatok"
                    : "Settings → Cookies and site data"}
                </li>
              </ul>
              <p>
                {isHu
                  ? "A sütik letiltása befolyásolhatja egyes funkciók működését."
                  : "Disabling cookies may affect the functionality of some features."}
              </p>
            </CookieCategory>

            {/* Link to privacy policy */}
            <div className="text-center pt-4">
              <p className="font-body text-sm text-gray-600">
                {isHu
                  ? "A személyes adatok kezeléséről bővebben az "
                  : "For more information on personal data processing, see our "}
                <Link
                  to={localePath("/adatkezelesi-tajekoztato")}
                  className="text-primary font-semibold hover:underline"
                >
                  {isHu ? "Adatkezelési tájékoztatóban" : "Privacy Policy"}
                </Link>
                {isHu ? " olvashat." : "."}
              </p>
            </div>

            {/* Last updated */}
            <p className="text-center text-xs text-gray-500 font-body">
              {isHu
                ? "Utolsó frissítés: 2026. április 16."
                : "Last updated: 16 April 2026"}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CookieTajekoztato;
