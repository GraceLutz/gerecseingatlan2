import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Adatkezelési tájékoztató (Privacy Policy / Data Processing Notice) page.
 *
 * Required by GDPR Article 13/14 and Hungarian data protection law (2011.
 * évi CXII. törvény – Infotv.). Describes what personal data is collected,
 * on what legal basis, for what purpose, and what rights data subjects have.
 */
const AdatkezelesiPage = () => {
  const { lang, localePath } = useLanguage();
  const isHu = lang === "hu";

  const title = isHu
    ? "Adatkezelési tájékoztató – Gerecse Ingatlan"
    : "Privacy Policy – Gerecse Ingatlan";
  const description = isHu
    ? "A Gerecse Ingatlan adatkezelési tájékoztatója: személyes adatok kezelése, jogalapok, érintetti jogok a GDPR és az Infotv. alapján."
    : "Privacy policy of Gerecse Ingatlan: personal data processing, legal bases, and data subject rights under GDPR.";

  /** Reusable section card */
  const Section = ({
    number,
    titleHu,
    titleEn,
    children,
  }: {
    number: string;
    titleHu: string;
    titleEn: string;
    children: React.ReactNode;
  }) => (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
        <span className="text-primary mr-2">{number}</span>
        {isHu ? titleHu : titleEn}
      </h2>
      <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </article>
  );

  return (
    <Layout title={title} description={description} canonicalPath="/adatkezelesi-tajekoztato">
      {/* Hero */}
      <section className="bg-dark-green py-16 text-center">
        <div className="flex justify-center mb-4">
          <ShieldCheck size={40} className="text-gold" aria-hidden="true" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
          {isHu ? "Adatkezelési tájékoztató" : "Privacy Policy"}
        </h1>
        <p className="text-primary-foreground/70 font-body mt-2 max-w-xl mx-auto px-4">
          {isHu
            ? "Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) alapján"
            : "In accordance with EU Regulation 2016/679 (GDPR)"}
        </p>
      </section>

      {/* Content */}
      <section className="py-16 bg-light-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* 1. Data controller */}
            <Section number="1." titleHu="Adatkezelő" titleEn="Data Controller">
              <p>
                {isHu
                  ? "Az adatkezelő a Gerecse Ingatlan Kft. (székhely: 2890 Tata, Példa utca 1.; adószám: XXXXXXXX-X-XX; e-mail: info@gerecseingatlan.hu; telefon: +36 70 613 2658)."
                  : "The data controller is Gerecse Ingatlan Kft. (registered office: 2890 Tata, Példa utca 1.; tax number: XXXXXXXX-X-XX; e-mail: info@gerecseingatlan.hu; phone: +36 70 613 2658)."}
              </p>
            </Section>

            {/* 2. Scope */}
            <Section
              number="2."
              titleHu="A tájékoztató hatálya"
              titleEn="Scope of This Policy"
            >
              <p>
                {isHu
                  ? "Jelen tájékoztató a gerecseingatlan.hu weboldalon és az ahhoz kapcsolódó szolgáltatások során végzett személyesadat-kezelésre terjed ki."
                  : "This policy covers the processing of personal data on the gerecseingatlan.hu website and related services."}
              </p>
            </Section>

            {/* 3. Legal bases & purposes */}
            <Section
              number="3."
              titleHu="Kezelt adatok, jogalapok és célok"
              titleEn="Data Processed, Legal Bases & Purposes"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 pr-4 font-semibold text-dark-navy">
                        {isHu ? "Adatkezelés" : "Processing activity"}
                      </th>
                      <th className="py-2 pr-4 font-semibold text-dark-navy">
                        {isHu ? "Kezelt adatok" : "Data processed"}
                      </th>
                      <th className="py-2 pr-4 font-semibold text-dark-navy">
                        {isHu ? "Jogalap" : "Legal basis"}
                      </th>
                      <th className="py-2 font-semibold text-dark-navy">
                        {isHu ? "Megőrzés" : "Retention"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2 pr-4">
                        {isHu ? "Kapcsolatfelvételi űrlap" : "Contact form"}
                      </td>
                      <td className="py-2 pr-4">
                        {isHu ? "Név, e-mail, telefon, üzenet" : "Name, e-mail, phone, message"}
                      </td>
                      <td className="py-2 pr-4">
                        {isHu ? "Hozzájárulás (GDPR 6(1)(a))" : "Consent (GDPR Art. 6(1)(a))"}
                      </td>
                      <td className="py-2">
                        {isHu ? "Cél megvalósulásáig" : "Until purpose fulfilled"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        {isHu ? "Hírlevél feliratkozás" : "Newsletter signup"}
                      </td>
                      <td className="py-2 pr-4">
                        {isHu ? "Név, e-mail" : "Name, e-mail"}
                      </td>
                      <td className="py-2 pr-4">
                        {isHu ? "Hozzájárulás (GDPR 6(1)(a))" : "Consent (GDPR Art. 6(1)(a))"}
                      </td>
                      <td className="py-2">
                        {isHu ? "Visszavonásig" : "Until withdrawal"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        {isHu ? "Sütik (cookie-k)" : "Cookies"}
                      </td>
                      <td className="py-2 pr-4">
                        {isHu ? "IP-cím, böngésző adatok" : "IP address, browser data"}
                      </td>
                      <td className="py-2 pr-4">
                        {isHu
                          ? "Hozzájárulás / jogos érdek"
                          : "Consent / legitimate interest"}
                      </td>
                      <td className="py-2">
                        {isHu ? "Max. 1 év" : "Max. 1 year"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">
                        {isHu ? "Ingatlan érdeklődés" : "Property inquiry"}
                      </td>
                      <td className="py-2 pr-4">
                        {isHu
                          ? "Név, e-mail, telefon, keresési feltételek"
                          : "Name, e-mail, phone, search criteria"}
                      </td>
                      <td className="py-2 pr-4">
                        {isHu
                          ? "Szerződés teljesítése (GDPR 6(1)(b))"
                          : "Contract performance (GDPR Art. 6(1)(b))"}
                      </td>
                      <td className="py-2">
                        {isHu ? "5 év (Ptk.)" : "5 years (Civil Code)"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 4. Data subject rights */}
            <Section
              number="4."
              titleHu="Az érintett jogai"
              titleEn="Data Subject Rights"
            >
              <p>
                {isHu
                  ? "A GDPR alapján Ön az alábbi jogokkal rendelkezik:"
                  : "Under the GDPR, you have the following rights:"}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{isHu ? "Hozzáférési jog (GDPR 15. cikk)" : "Right of access (Art. 15)"}</li>
                <li>{isHu ? "Helyesbítéshez való jog (GDPR 16. cikk)" : "Right to rectification (Art. 16)"}</li>
                <li>{isHu ? 'Törléshez való jog – \u201Eelfeledtetéshez való jog\u201D (GDPR 17. cikk)' : "Right to erasure – 'right to be forgotten' (Art. 17)"}</li>
                <li>{isHu ? "Adatkezelés korlátozásához való jog (GDPR 18. cikk)" : "Right to restriction of processing (Art. 18)"}</li>
                <li>{isHu ? "Adathordozhatósághoz való jog (GDPR 20. cikk)" : "Right to data portability (Art. 20)"}</li>
                <li>{isHu ? "Tiltakozáshoz való jog (GDPR 21. cikk)" : "Right to object (Art. 21)"}</li>
                <li>
                  {isHu
                    ? "Hozzájárulás visszavonásának joga – a visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét"
                    : "Right to withdraw consent – withdrawal does not affect the lawfulness of processing before withdrawal"}
                </li>
              </ul>
              <p>
                {isHu
                  ? "Jogai gyakorlásához kérjük, írjon az info@gerecseingatlan.hu e-mail címre."
                  : "To exercise your rights, please contact info@gerecseingatlan.hu."}
              </p>
            </Section>

            {/* 5. Data transfers */}
            <Section
              number="5."
              titleHu="Adattovábbítás"
              titleEn="Data Transfers"
            >
              <p>
                {isHu
                  ? "Személyes adatait harmadik országba nem továbbítjuk. Az adatfeldolgozók (pl. tárhelyszolgáltató, e-mail szolgáltató) az Európai Gazdasági Térségen belül működnek, vagy megfelelő garanciákat biztosítanak (GDPR 46. cikk)."
                  : "We do not transfer your personal data to third countries. Our data processors (e.g., hosting provider, e-mail service) operate within the European Economic Area or provide appropriate safeguards (Art. 46 GDPR)."}
              </p>
            </Section>

            {/* 6. Data security */}
            <Section
              number="6."
              titleHu="Adatbiztonság"
              titleEn="Data Security"
            >
              <p>
                {isHu
                  ? "Az adatkezelő megfelelő technikai és szervezési intézkedéseket alkalmaz az adatok védelme érdekében, beleértve a HTTPS titkosítást, tűzfalvédelmet és rendszeres biztonsági mentéseket."
                  : "The data controller implements appropriate technical and organisational measures to protect data, including HTTPS encryption, firewall protection and regular backups."}
              </p>
            </Section>

            {/* 7. Complaints */}
            <Section
              number="7."
              titleHu="Jogorvoslat"
              titleEn="Complaints & Legal Remedies"
            >
              <p>
                {isHu
                  ? "Panaszával fordulhat a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH):"
                  : "You may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH):"}
              </p>
              <address className="not-italic pl-4 border-l-2 border-primary/30 space-y-1">
                <p>
                  {isHu
                    ? "Nemzeti Adatvédelmi és Információszabadság Hatóság"
                    : "Hungarian National Authority for Data Protection and Freedom of Information"}
                </p>
                <p>1055 Budapest, Falk Miksa utca 9-11.</p>
                <p>
                  {isHu ? "Levelezési cím" : "Postal address"}: 1363 Budapest, Pf. 9.
                </p>
                <p>
                  <a
                    href="https://naih.hu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    naih.hu
                  </a>
                </p>
              </address>
              <p className="mt-3">
                {isHu
                  ? "Továbbá bírósághoz is fordulhat az Infotv. 22. § alapján."
                  : "You also have the right to seek judicial remedy under Hungarian law."}
              </p>
            </Section>

            {/* 8. Cookies reference */}
            <Section
              number="8."
              titleHu="Sütik (cookie-k)"
              titleEn="Cookies"
            >
              <p>
                {isHu
                  ? "A weboldalon használt sütikről részletes tájékoztatást a "
                  : "For detailed information about cookies used on this website, please see our "}
                <Link
                  to={localePath("/cookie-tajekoztato")}
                  className="text-primary font-semibold hover:underline"
                >
                  {isHu ? "Cookie tájékoztatóban" : "Cookie Policy"}
                </Link>
                {isHu ? " talál." : "."}
              </p>
            </Section>

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

export default AdatkezelesiPage;
