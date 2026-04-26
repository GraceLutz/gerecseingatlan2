import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import RichText from "@/components/RichText";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const PAGE = "/adatkezelesi-tajekoztato";

const AdatkezelesiPage = () => {
  const { lang, t, localePath } = useLanguage();
  const isHu = lang === "hu";

  const { content: heroTitle } = useContentBlock(PAGE, "page.title", isHu ? "Adatkezelési tájékoztató" : "Privacy Policy");
  const { content: heroSubtitle } = useContentBlock(PAGE, "page.subtitle", isHu
    ? "Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (GDPR) alapján"
    : "In accordance with EU Regulation 2016/679 (GDPR)");

  const { content: s1Title } = useContentBlock(PAGE, "section1.title", isHu ? "Adatkezelő" : "Data Controller");
  const { content: s1p1 } = useContentBlock(PAGE, "section1.p1", isHu
    ? "Az adatkezelő a Gerecse Ingatlan Kft. (székhely: 2890 Tata, Példa utca 1.; adószám: XXXXXXXX-X-XX; e-mail: info@gerecseingatlan.hu; telefon: +36 70 613 2658)."
    : "The data controller is Gerecse Ingatlan Kft. (registered office: 2890 Tata, Példa utca 1.; tax number: XXXXXXXX-X-XX; e-mail: info@gerecseingatlan.hu; phone: +36 70 613 2658).");

  const { content: s2Title } = useContentBlock(PAGE, "section2.title", isHu ? "A tájékoztató hatálya" : "Scope of This Policy");
  const { content: s2p1 } = useContentBlock(PAGE, "section2.p1", isHu
    ? "Jelen tájékoztató a gerecseingatlan.hu weboldalon és az ahhoz kapcsolódó szolgáltatások során végzett személyesadat-kezelésre terjed ki."
    : "This policy covers the processing of personal data on the gerecseingatlan.hu website and related services.");

  const { content: s3Title } = useContentBlock(PAGE, "section3.title", isHu ? "Kezelt adatok, jogalapok és célok" : "Data Processed, Legal Bases & Purposes");

  const { content: s4Title } = useContentBlock(PAGE, "section4.title", isHu ? "Az érintett jogai" : "Data Subject Rights");
  const { content: s4p1 } = useContentBlock(PAGE, "section4.p1", isHu
    ? "A GDPR alapján Ön az alábbi jogokkal rendelkezik:"
    : "Under the GDPR, you have the following rights:");
  const { content: s4right1 } = useContentBlock(PAGE, "section4.right1", isHu ? "Hozzáférési jog (GDPR 15. cikk)" : "Right of access (Art. 15)");
  const { content: s4right2 } = useContentBlock(PAGE, "section4.right2", isHu ? "Helyesbítéshez való jog (GDPR 16. cikk)" : "Right to rectification (Art. 16)");
  const { content: s4right3 } = useContentBlock(PAGE, "section4.right3", isHu ? "Törléshez való jog – „elfeledtetéshez való jog” (GDPR 17. cikk)" : "Right to erasure – 'right to be forgotten' (Art. 17)");
  const { content: s4right4 } = useContentBlock(PAGE, "section4.right4", isHu ? "Adatkezelés korlátozásához való jog (GDPR 18. cikk)" : "Right to restriction of processing (Art. 18)");
  const { content: s4right5 } = useContentBlock(PAGE, "section4.right5", isHu ? "Adathordozhatósághoz való jog (GDPR 20. cikk)" : "Right to data portability (Art. 20)");
  const { content: s4right6 } = useContentBlock(PAGE, "section4.right6", isHu ? "Tiltakozáshoz való jog (GDPR 21. cikk)" : "Right to object (Art. 21)");
  const { content: s4right7 } = useContentBlock(PAGE, "section4.right7", isHu
    ? "Hozzájárulás visszavonásának joga – a visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét"
    : "Right to withdraw consent – withdrawal does not affect the lawfulness of processing before withdrawal");
  const { content: s4p2 } = useContentBlock(PAGE, "section4.p2", isHu
    ? "Jogai gyakorlásához kérjük, írjon az info@gerecseingatlan.hu e-mail címre."
    : "To exercise your rights, please contact info@gerecseingatlan.hu.");

  const { content: s5Title } = useContentBlock(PAGE, "section5.title", isHu ? "Adattovábbítás" : "Data Transfers");
  const { content: s5p1 } = useContentBlock(PAGE, "section5.p1", isHu
    ? "Személyes adatait harmadik országba nem továbbítjuk. Az adatfeldolgozók (pl. tárhelyszolgáltató, e-mail szolgáltató) az Európai Gazdasági Térségen belül működnek, vagy megfelelő garanciákat biztosítanak (GDPR 46. cikk)."
    : "We do not transfer your personal data to third countries. Our data processors (e.g., hosting provider, e-mail service) operate within the European Economic Area or provide appropriate safeguards (Art. 46 GDPR).");

  const { content: s6Title } = useContentBlock(PAGE, "section6.title", isHu ? "Adatbiztonság" : "Data Security");
  const { content: s6p1 } = useContentBlock(PAGE, "section6.p1", isHu
    ? "Az adatkezelő megfelelő technikai és szervezési intézkedéseket alkalmaz az adatok védelme érdekében, beleértve a HTTPS titkosítást, tűzfalvédelmet és rendszeres biztonsági mentéseket."
    : "The data controller implements appropriate technical and organisational measures to protect data, including HTTPS encryption, firewall protection and regular backups.");

  const { content: s7Title } = useContentBlock(PAGE, "section7.title", isHu ? "Jogorvoslat" : "Complaints & Legal Remedies");
  const { content: s7p1 } = useContentBlock(PAGE, "section7.p1", isHu
    ? "Panaszával fordulhat a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH):"
    : "You may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH):");
  const { content: s7p2 } = useContentBlock(PAGE, "section7.p2", isHu
    ? "Továbbá bírósághoz is fordulhat az Infotv. 22. § alapján."
    : "You also have the right to seek judicial remedy under Hungarian law.");

  const { content: s8Title } = useContentBlock(PAGE, "section8.title", isHu ? "Sütik (cookie-k)" : "Cookies");
  const { content: s8p1 } = useContentBlock(PAGE, "section8.p1", isHu
    ? "A weboldalon használt sütikről részletes tájékoztatást a Cookie tájékoztatóban talál."
    : "For detailed information about cookies used on this website, please see our Cookie Policy.");

  const { content: lastUpdated } = useContentBlock(PAGE, "lastUpdated", isHu ? "Utolsó frissítés: 2026. április 16." : "Last updated: 16 April 2026");

  const title = t.seo.privacyTitle;
  const description = t.seo.privacyDescription;

  return (
    <Layout title={title} description={description} canonicalPath="/adatkezelesi-tajekoztato">
      {/* Hero */}
      <section className="bg-dark-green py-16 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex justify-center mb-4">
            <ShieldCheck size={40} className="text-gold" aria-hidden="true" />
          </div>
          <h1 data-editable="page.title" data-page={PAGE} className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            {heroTitle}
          </h1>
          <RichText content={heroSubtitle} data-editable="page.subtitle" data-page={PAGE} className="text-primary-foreground/70 font-body max-w-xl mx-auto" />
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-light-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* 1. Data controller */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">1.</span>
                <span data-editable="section1.title" data-page={PAGE}>{s1Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s1p1} data-editable="section1.p1" data-page={PAGE} />
              </div>
            </article>

            {/* 2. Scope */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">2.</span>
                <span data-editable="section2.title" data-page={PAGE}>{s2Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s2p1} data-editable="section2.p1" data-page={PAGE} />
              </div>
            </article>

            {/* 3. Legal bases & purposes */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">3.</span>
                <span data-editable="section3.title" data-page={PAGE}>{s3Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 pr-4 font-semibold text-dark-navy">{isHu ? "Adatkezelés" : "Processing activity"}</th>
                        <th className="py-2 pr-4 font-semibold text-dark-navy">{isHu ? "Kezelt adatok" : "Data processed"}</th>
                        <th className="py-2 pr-4 font-semibold text-dark-navy">{isHu ? "Jogalap" : "Legal basis"}</th>
                        <th className="py-2 font-semibold text-dark-navy">{isHu ? "Megőrzés" : "Retention"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2 pr-4">{isHu ? "Kapcsolatfelvételi űrlap" : "Contact form"}</td>
                        <td className="py-2 pr-4">{isHu ? "Név, e-mail, telefon, üzenet" : "Name, e-mail, phone, message"}</td>
                        <td className="py-2 pr-4">{isHu ? "Hozzájárulás (GDPR 6(1)(a))" : "Consent (GDPR Art. 6(1)(a))"}</td>
                        <td className="py-2">{isHu ? "Cél megvalósulásáig" : "Until purpose fulfilled"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">{isHu ? "Hírlevél feliratkozás" : "Newsletter signup"}</td>
                        <td className="py-2 pr-4">{isHu ? "Név, e-mail" : "Name, e-mail"}</td>
                        <td className="py-2 pr-4">{isHu ? "Hozzájárulás (GDPR 6(1)(a))" : "Consent (GDPR Art. 6(1)(a))"}</td>
                        <td className="py-2">{isHu ? "Visszavonásig" : "Until withdrawal"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">{isHu ? "Sütik (cookie-k)" : "Cookies"}</td>
                        <td className="py-2 pr-4">{isHu ? "IP-cím, böngésző adatok" : "IP address, browser data"}</td>
                        <td className="py-2 pr-4">{isHu ? "Hozzájárulás / jogos érdek" : "Consent / legitimate interest"}</td>
                        <td className="py-2">{isHu ? "Max. 1 év" : "Max. 1 year"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">{isHu ? "Ingatlan érdeklődés" : "Property inquiry"}</td>
                        <td className="py-2 pr-4">{isHu ? "Név, e-mail, telefon, keresési feltételek" : "Name, e-mail, phone, search criteria"}</td>
                        <td className="py-2 pr-4">{isHu ? "Szerződés teljesítése (GDPR 6(1)(b))" : "Contract performance (GDPR Art. 6(1)(b))"}</td>
                        <td className="py-2">{isHu ? "5 év (Ptk.)" : "5 years (Civil Code)"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            {/* 4. Data subject rights */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">4.</span>
                <span data-editable="section4.title" data-page={PAGE}>{s4Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s4p1} data-editable="section4.p1" data-page={PAGE} />
                <ul className="list-disc pl-5 space-y-1">
                  <li data-editable="section4.right1" data-page={PAGE}>{s4right1}</li>
                  <li data-editable="section4.right2" data-page={PAGE}>{s4right2}</li>
                  <li data-editable="section4.right3" data-page={PAGE}>{s4right3}</li>
                  <li data-editable="section4.right4" data-page={PAGE}>{s4right4}</li>
                  <li data-editable="section4.right5" data-page={PAGE}>{s4right5}</li>
                  <li data-editable="section4.right6" data-page={PAGE}>{s4right6}</li>
                  <li data-editable="section4.right7" data-page={PAGE}>{s4right7}</li>
                </ul>
                <RichText content={s4p2} data-editable="section4.p2" data-page={PAGE} />
              </div>
            </article>

            {/* 5. Data transfers */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">5.</span>
                <span data-editable="section5.title" data-page={PAGE}>{s5Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s5p1} data-editable="section5.p1" data-page={PAGE} />
              </div>
            </article>

            {/* 6. Data security */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">6.</span>
                <span data-editable="section6.title" data-page={PAGE}>{s6Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s6p1} data-editable="section6.p1" data-page={PAGE} />
              </div>
            </article>

            {/* 7. Complaints */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">7.</span>
                <span data-editable="section7.title" data-page={PAGE}>{s7Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s7p1} data-editable="section7.p1" data-page={PAGE} />
                <address className="not-italic pl-4 border-l-2 border-primary/30 space-y-1">
                  <p>{isHu ? "Nemzeti Adatvédelmi és Információszabadság Hatóság" : "Hungarian National Authority for Data Protection and Freedom of Information"}</p>
                  <p>1055 Budapest, Falk Miksa utca 9-11.</p>
                  <p>{isHu ? "Levelezési cím" : "Postal address"}: 1363 Budapest, Pf. 9.</p>
                  <p>
                    <a href="https://naih.hu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      naih.hu
                    </a>
                  </p>
                </address>
                <RichText content={s7p2} data-editable="section7.p2" data-page={PAGE} />
              </div>
            </article>

            {/* 8. Cookies reference */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">8.</span>
                <span data-editable="section8.title" data-page={PAGE}>{s8Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <p data-editable="section8.p1" data-page={PAGE}>
                  {isHu ? "A weboldalon használt sütikről részletes tájékoztatást a " : "For detailed information about cookies used on this website, please see our "}
                  <Link to={localePath("/cookie-tajekoztato")} className="text-primary font-semibold hover:underline">
                    {isHu ? "Cookie tájékoztatóban" : "Cookie Policy"}
                  </Link>
                  {isHu ? " talál." : "."}
                </p>
              </div>
            </article>

            {/* Last updated */}
            <RichText content={lastUpdated} data-editable="lastUpdated" data-page={PAGE} className="text-center text-xs text-gray-500 font-body" />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdatkezelesiPage;
