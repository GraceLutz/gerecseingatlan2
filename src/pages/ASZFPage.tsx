import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import RichText from "@/components/RichText";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const PAGE = "/aszf";

const ASZFPage = () => {
  const { lang, t, localePath } = useLanguage();
  const isHu = lang === "hu";

  const { content: heroTitle } = useContentBlock(PAGE, "page.title", isHu ? "Általános Szerződési Feltételek" : "Terms and Conditions");
  const { content: heroSubtitle } = useContentBlock(PAGE, "page.subtitle", isHu ? "(ÁSZF)" : "(T&C)");

  const { content: s1Title } = useContentBlock(PAGE, "section1.title", isHu ? "Általános rendelkezések" : "General Provisions");
  const { content: s1p1 } = useContentBlock(PAGE, "section1.p1", isHu
    ? "Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a Gerecse Ingatlan Kft. (székhely: 2890 Tata, Példa utca 1.; cégjegyzékszám: 11-09-XXXXXX; adószám: XXXXXXXX-X-XX; a továbbiakban: Szolgáltató) által üzemeltetett gerecseingatlan.hu weboldal (a továbbiakban: Weboldal) használatának feltételeit szabályozzák."
    : "These Terms and Conditions (hereinafter: T&C) govern the use of the gerecseingatlan.hu website (hereinafter: Website) operated by Gerecse Ingatlan Kft. (registered office: 2890 Tata, Példa utca 1.; company registration no.: 11-09-XXXXXX; tax no.: XXXXXXXX-X-XX; hereinafter: Provider).");
  const { content: s1p2 } = useContentBlock(PAGE, "section1.p2", isHu
    ? "A Weboldal használatával Ön elfogadja a jelen ÁSZF-ben foglalt feltételeket."
    : "By using the Website, you accept the terms set out in these T&C.");

  const { content: s2Title } = useContentBlock(PAGE, "section2.title", isHu ? "A Szolgáltató tevékenysége" : "Services Provided");
  const { content: s2p1 } = useContentBlock(PAGE, "section2.p1", isHu
    ? "A Szolgáltató ingatlanközvetítői tevékenységet végez a Gerecse régióban és Komárom-Esztergom megyében. Szolgáltatásai közé tartozik:"
    : "The Provider offers real estate brokerage services in the Gerecse region and Komárom-Esztergom county. Services include:");
  const { content: s2item1 } = useContentBlock(PAGE, "section2.item1", isHu ? "Ingatlanok adásvételének közvetítése" : "Mediation of property sales");
  const { content: s2item2 } = useContentBlock(PAGE, "section2.item2", isHu ? "Ingatlanok bérbeadásának közvetítése" : "Mediation of property rentals");
  const { content: s2item3 } = useContentBlock(PAGE, "section2.item3", isHu ? "Ingatlan értékbecslés" : "Property valuation");
  const { content: s2item4 } = useContentBlock(PAGE, "section2.item4", isHu ? "Jogi háttér biztosítása" : "Legal support");
  const { content: s2item5 } = useContentBlock(PAGE, "section2.item5", isHu ? "Hiteltanácsadás" : "Mortgage consulting");
  const { content: s2item6 } = useContentBlock(PAGE, "section2.item6", isHu ? "Home staging és belsőépítészet" : "Home staging and interior design");

  const { content: s3Title } = useContentBlock(PAGE, "section3.title", isHu ? "A Weboldal használata" : "Use of the Website");
  const { content: s3p1 } = useContentBlock(PAGE, "section3.p1", isHu
    ? "A Weboldalon közzétett ingatlaninformációk tájékoztató jellegűek, és nem minősülnek szerződéses ajánlatnak. A Szolgáltató fenntartja a jogot a tartalom bármikori módosítására."
    : "Property information published on the Website is for informational purposes only and does not constitute a contractual offer. The Provider reserves the right to modify content at any time.");
  const { content: s3p2 } = useContentBlock(PAGE, "section3.p2", isHu
    ? "A felhasználó köteles a Weboldalt rendeltetésszerűen, jogszerűen és jóhiszeműen használni."
    : "The user is obliged to use the Website properly, lawfully and in good faith.");

  const { content: s4Title } = useContentBlock(PAGE, "section4.title", isHu ? "Szellemi tulajdon" : "Intellectual Property");
  const { content: s4p1 } = useContentBlock(PAGE, "section4.p1", isHu
    ? "A Weboldalon megjelenő szövegek, képek, logók, grafikai elemek és egyéb tartalmak a Szolgáltató szellemi tulajdonát képezik, vagy felhasználási joggal rendelkezik felettük. A tartalmak engedély nélküli másolása, felhasználása vagy terjesztése tilos és jogkövetkezményeket von maga után."
    : "Texts, images, logos, graphics and other content on the Website are the intellectual property of the Provider or used under licence. Copying, using or distributing content without permission is prohibited and subject to legal consequences.");

  const { content: s5Title } = useContentBlock(PAGE, "section5.title", isHu ? "Felelősség" : "Liability");
  const { content: s5p1 } = useContentBlock(PAGE, "section5.p1", isHu
    ? "A Szolgáltató törekszik a Weboldalon közölt információk pontosságára, de nem vállal felelősséget az esetleges pontatlanságokért vagy elírásokért. Az ingatlanokkal kapcsolatos végleges adatokat a személyes egyeztetés során pontosítjuk."
    : "The Provider strives for accuracy of information on the Website but accepts no liability for potential inaccuracies or typographical errors. Final property details are confirmed during personal consultation.");
  const { content: s5p2 } = useContentBlock(PAGE, "section5.p2", isHu
    ? "A Szolgáltató nem felelős a Weboldalról elérhető külső linkek tartalmáért."
    : "The Provider is not responsible for the content of external links accessible from the Website.");

  const { content: s6Title } = useContentBlock(PAGE, "section6.title", isHu ? "Adatkezelés" : "Data Protection");
  const { content: s6p1 } = useContentBlock(PAGE, "section6.p1", isHu
    ? "A személyes adatok kezelésére vonatkozó részletes tájékoztatást az Adatkezelési tájékoztató tartalmazza."
    : "Detailed information on personal data processing can be found in our Privacy Policy.");

  const { content: s7Title } = useContentBlock(PAGE, "section7.title", isHu ? "Irányadó jog és jogviták" : "Governing Law & Disputes");
  const { content: s7p1 } = useContentBlock(PAGE, "section7.p1", isHu
    ? "Jelen ÁSZF-re a magyar jog az irányadó. A felek vitáikat elsősorban egyeztetés útján kísérlik meg rendezni. Ennek eredménytelensége esetén a Tatabányai Törvényszék, illetve a Tatabányai Járásbíróság illetékességét kötik ki."
    : "These T&C are governed by Hungarian law. The parties shall first attempt to settle disputes through negotiation. Failing that, the courts of Tatabánya shall have exclusive jurisdiction.");

  const { content: s8Title } = useContentBlock(PAGE, "section8.title", isHu ? "ÁSZF módosítása" : "Amendments");
  const { content: s8p1 } = useContentBlock(PAGE, "section8.p1", isHu
    ? "A Szolgáltató fenntartja a jogot a jelen ÁSZF egyoldalú módosítására. A módosított ÁSZF a Weboldalon történő közzététellel lép hatályba. A Weboldal további használata a módosítások elfogadásának minősül."
    : "The Provider reserves the right to unilaterally amend these T&C. Amended T&C take effect upon publication on the Website. Continued use of the Website constitutes acceptance of the amendments.");

  const { content: s9Title } = useContentBlock(PAGE, "section9.title", isHu ? "Kapcsolat" : "Contact");
  const { content: s9p1 } = useContentBlock(PAGE, "section9.p1", isHu
    ? "Kérdéseivel forduljon hozzánk bizalommal:"
    : "If you have any questions, please contact us:");

  const { content: effectiveDate } = useContentBlock(PAGE, "effectiveDate", isHu ? "Hatályba lépés: 2026. április 16." : "Effective date: 16 April 2026");

  const title = t.seo.termsTitle;
  const description = t.seo.termsDescription;

  return (
    <Layout title={title} description={description} canonicalPath="/aszf">
      {/* Hero */}
      <section className="bg-dark-green py-16 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex justify-center mb-4">
            <FileText size={40} className="text-gold" aria-hidden="true" />
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
            {/* 1. General provisions */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">1.</span>
                <span data-editable="section1.title" data-page={PAGE}>{s1Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s1p1} data-editable="section1.p1" data-page={PAGE} />
                <RichText content={s1p2} data-editable="section1.p2" data-page={PAGE} />
              </div>
            </article>

            {/* 2. Services */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">2.</span>
                <span data-editable="section2.title" data-page={PAGE}>{s2Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s2p1} data-editable="section2.p1" data-page={PAGE} />
                <ul className="list-disc pl-5 space-y-1">
                  <li data-editable="section2.item1" data-page={PAGE}>{s2item1}</li>
                  <li data-editable="section2.item2" data-page={PAGE}>{s2item2}</li>
                  <li data-editable="section2.item3" data-page={PAGE}>{s2item3}</li>
                  <li data-editable="section2.item4" data-page={PAGE}>{s2item4}</li>
                  <li data-editable="section2.item5" data-page={PAGE}>{s2item5}</li>
                  <li data-editable="section2.item6" data-page={PAGE}>{s2item6}</li>
                </ul>
              </div>
            </article>

            {/* 3. Website use */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">3.</span>
                <span data-editable="section3.title" data-page={PAGE}>{s3Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s3p1} data-editable="section3.p1" data-page={PAGE} />
                <RichText content={s3p2} data-editable="section3.p2" data-page={PAGE} />
              </div>
            </article>

            {/* 4. Intellectual property */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">4.</span>
                <span data-editable="section4.title" data-page={PAGE}>{s4Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s4p1} data-editable="section4.p1" data-page={PAGE} />
              </div>
            </article>

            {/* 5. Liability */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">5.</span>
                <span data-editable="section5.title" data-page={PAGE}>{s5Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s5p1} data-editable="section5.p1" data-page={PAGE} />
                <RichText content={s5p2} data-editable="section5.p2" data-page={PAGE} />
              </div>
            </article>

            {/* 6. Data protection */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">6.</span>
                <span data-editable="section6.title" data-page={PAGE}>{s6Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <p data-editable="section6.p1" data-page={PAGE}>
                  {s6p1.includes("Adatkezelési") || s6p1.includes("Privacy") ? (
                    <>
                      {isHu ? "A személyes adatok kezelésére vonatkozó részletes tájékoztatást az " : "Detailed information on personal data processing can be found in our "}
                      <Link to={localePath("/adatkezelesi-tajekoztato")} className="text-primary font-semibold hover:underline">
                        {isHu ? "Adatkezelési tájékoztató" : "Privacy Policy"}
                      </Link>
                      {isHu ? " tartalmazza." : "."}
                    </>
                  ) : s6p1}
                </p>
              </div>
            </article>

            {/* 7. Applicable law */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">7.</span>
                <span data-editable="section7.title" data-page={PAGE}>{s7Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s7p1} data-editable="section7.p1" data-page={PAGE} />
              </div>
            </article>

            {/* 8. Amendments */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">8.</span>
                <span data-editable="section8.title" data-page={PAGE}>{s8Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s8p1} data-editable="section8.p1" data-page={PAGE} />
              </div>
            </article>

            {/* 9. Contact */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-heading font-bold text-dark-navy mb-4">
                <span className="text-primary mr-2">9.</span>
                <span data-editable="section9.title" data-page={PAGE}>{s9Title}</span>
              </h2>
              <div className="font-body text-gray-700 text-sm leading-relaxed space-y-3">
                <RichText content={s9p1} data-editable="section9.p1" data-page={PAGE} />
                <address className="not-italic pl-4 border-l-2 border-primary/30 space-y-1">
                  <p>Gerecse Ingatlan Kft.</p>
                  <p>2890 Tata, Példa utca 1.</p>
                  <p>
                    E-mail:{" "}
                    <a href="mailto:info@gerecseingatlan.hu" className="text-primary hover:underline">
                      info@gerecseingatlan.hu
                    </a>
                  </p>
                  <p>
                    {isHu ? "Telefon" : "Phone"}:{" "}
                    <a href="tel:+36706132658" className="text-primary hover:underline">
                      +36 70 613 2658
                    </a>
                  </p>
                </address>
              </div>
            </article>

            {/* Cross-links */}
            <div className="text-center pt-4 space-y-2">
              <p className="font-body text-sm text-gray-600">
                <Link to={localePath("/impresszum")} className="text-primary font-semibold hover:underline">
                  {isHu ? "Impresszum" : "Legal Notice"}
                </Link>
                {" · "}
                <Link to={localePath("/adatkezelesi-tajekoztato")} className="text-primary font-semibold hover:underline">
                  {isHu ? "Adatkezelési tájékoztató" : "Privacy Policy"}
                </Link>
                {" · "}
                <Link to={localePath("/cookie-tajekoztato")} className="text-primary font-semibold hover:underline">
                  {isHu ? "Cookie tájékoztató" : "Cookie Policy"}
                </Link>
              </p>
            </div>

            {/* Last updated */}
            <RichText content={effectiveDate} data-editable="effectiveDate" data-page={PAGE} className="text-center text-xs text-gray-500 font-body" />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ASZFPage;
