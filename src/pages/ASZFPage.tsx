import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Általános Szerződési Feltételek (Terms and Conditions) page.
 *
 * Covers the terms of using the gerecseingatlan.hu website and the
 * real estate brokerage services offered by Gerecse Ingatlan Kft.
 */
const ASZFPage = () => {
  const { lang, localePath } = useLanguage();
  const isHu = lang === "hu";

  const title = isHu
    ? "Általános Szerződési Feltételek – Gerecse Ingatlan"
    : "Terms and Conditions – Gerecse Ingatlan";
  const description = isHu
    ? "A Gerecse Ingatlan Kft. általános szerződési feltételei a gerecseingatlan.hu weboldal és ingatlanközvetítői szolgáltatások igénybevételéhez."
    : "Terms and conditions of Gerecse Ingatlan Kft. for the use of gerecseingatlan.hu and real estate brokerage services.";

  /** Reusable numbered section */
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
    <Layout title={title} description={description} canonicalPath="/aszf">
      {/* Hero */}
      <section className="bg-dark-green py-16 text-center">
        <div className="flex justify-center mb-4">
          <FileText size={40} className="text-gold" aria-hidden="true" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
          {isHu ? "Általános Szerződési Feltételek" : "Terms and Conditions"}
        </h1>
        <p className="text-primary-foreground/70 font-body mt-2 max-w-xl mx-auto px-4">
          {isHu ? "(ÁSZF)" : "(T&C)"}
        </p>
      </section>

      {/* Content */}
      <section className="py-16 bg-light-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* 1. General provisions */}
            <Section
              number="1."
              titleHu="Általános rendelkezések"
              titleEn="General Provisions"
            >
              <p>
                {isHu
                  ? "Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a Gerecse Ingatlan Kft. (székhely: 2890 Tata, Példa utca 1.; cégjegyzékszám: 11-09-XXXXXX; adószám: XXXXXXXX-X-XX; a továbbiakban: Szolgáltató) által üzemeltetett gerecseingatlan.hu weboldal (a továbbiakban: Weboldal) használatának feltételeit szabályozzák."
                  : "These Terms and Conditions (hereinafter: T&C) govern the use of the gerecseingatlan.hu website (hereinafter: Website) operated by Gerecse Ingatlan Kft. (registered office: 2890 Tata, Példa utca 1.; company registration no.: 11-09-XXXXXX; tax no.: XXXXXXXX-X-XX; hereinafter: Provider)."}
              </p>
              <p>
                {isHu
                  ? "A Weboldal használatával Ön elfogadja a jelen ÁSZF-ben foglalt feltételeket."
                  : "By using the Website, you accept the terms set out in these T&C."}
              </p>
            </Section>

            {/* 2. Services */}
            <Section
              number="2."
              titleHu="A Szolgáltató tevékenysége"
              titleEn="Services Provided"
            >
              <p>
                {isHu
                  ? "A Szolgáltató ingatlanközvetítői tevékenységet végez a Gerecse régióban és Komárom-Esztergom megyében. Szolgáltatásai közé tartozik:"
                  : "The Provider offers real estate brokerage services in the Gerecse region and Komárom-Esztergom county. Services include:"}
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{isHu ? "Ingatlanok adásvételének közvetítése" : "Mediation of property sales"}</li>
                <li>{isHu ? "Ingatlanok bérbeadásának közvetítése" : "Mediation of property rentals"}</li>
                <li>{isHu ? "Ingatlan értékbecslés" : "Property valuation"}</li>
                <li>{isHu ? "Jogi háttér biztosítása" : "Legal support"}</li>
                <li>{isHu ? "Hiteltanácsadás" : "Mortgage consulting"}</li>
                <li>{isHu ? "Home staging és belsőépítészet" : "Home staging and interior design"}</li>
              </ul>
            </Section>

            {/* 3. Website use */}
            <Section
              number="3."
              titleHu="A Weboldal használata"
              titleEn="Use of the Website"
            >
              <p>
                {isHu
                  ? "A Weboldalon közzétett ingatlaninformációk tájékoztató jellegűek, és nem minősülnek szerződéses ajánlatnak. A Szolgáltató fenntartja a jogot a tartalom bármikori módosítására."
                  : "Property information published on the Website is for informational purposes only and does not constitute a contractual offer. The Provider reserves the right to modify content at any time."}
              </p>
              <p>
                {isHu
                  ? "A felhasználó köteles a Weboldalt rendeltetésszerűen, jogszerűen és jóhiszeműen használni."
                  : "The user is obliged to use the Website properly, lawfully and in good faith."}
              </p>
            </Section>

            {/* 4. Intellectual property */}
            <Section
              number="4."
              titleHu="Szellemi tulajdon"
              titleEn="Intellectual Property"
            >
              <p>
                {isHu
                  ? "A Weboldalon megjelenő szövegek, képek, logók, grafikai elemek és egyéb tartalmak a Szolgáltató szellemi tulajdonát képezik, vagy felhasználási joggal rendelkezik felettük. A tartalmak engedély nélküli másolása, felhasználása vagy terjesztése tilos és jogkövetkezményeket von maga után."
                  : "Texts, images, logos, graphics and other content on the Website are the intellectual property of the Provider or used under licence. Copying, using or distributing content without permission is prohibited and subject to legal consequences."}
              </p>
            </Section>

            {/* 5. Liability */}
            <Section
              number="5."
              titleHu="Felelősség"
              titleEn="Liability"
            >
              <p>
                {isHu
                  ? "A Szolgáltató törekszik a Weboldalon közölt információk pontosságára, de nem vállal felelősséget az esetleges pontatlanságokért vagy elírásokért. Az ingatlanokkal kapcsolatos végleges adatokat a személyes egyeztetés során pontosítjuk."
                  : "The Provider strives for accuracy of information on the Website but accepts no liability for potential inaccuracies or typographical errors. Final property details are confirmed during personal consultation."}
              </p>
              <p>
                {isHu
                  ? "A Szolgáltató nem felelős a Weboldalról elérhető külső linkek tartalmáért."
                  : "The Provider is not responsible for the content of external links accessible from the Website."}
              </p>
            </Section>

            {/* 6. Data protection */}
            <Section
              number="6."
              titleHu="Adatkezelés"
              titleEn="Data Protection"
            >
              <p>
                {isHu
                  ? "A személyes adatok kezelésére vonatkozó részletes tájékoztatást az "
                  : "Detailed information on personal data processing can be found in our "}
                <Link
                  to={localePath("/adatkezelesi-tajekoztato")}
                  className="text-primary font-semibold hover:underline"
                >
                  {isHu ? "Adatkezelési tájékoztató" : "Privacy Policy"}
                </Link>
                {isHu ? " tartalmazza." : "."}
              </p>
            </Section>

            {/* 7. Applicable law */}
            <Section
              number="7."
              titleHu="Irányadó jog és jogviták"
              titleEn="Governing Law & Disputes"
            >
              <p>
                {isHu
                  ? "Jelen ÁSZF-re a magyar jog az irányadó. A felek vitáikat elsősorban egyeztetés útján kísérlik meg rendezni. Ennek eredménytelensége esetén a Tatabányai Törvényszék, illetve a Tatabányai Járásbíróság illetékességét kötik ki."
                  : "These T&C are governed by Hungarian law. The parties shall first attempt to settle disputes through negotiation. Failing that, the courts of Tatabánya shall have exclusive jurisdiction."}
              </p>
            </Section>

            {/* 8. Amendments */}
            <Section
              number="8."
              titleHu="ÁSZF módosítása"
              titleEn="Amendments"
            >
              <p>
                {isHu
                  ? "A Szolgáltató fenntartja a jogot a jelen ÁSZF egyoldalú módosítására. A módosított ÁSZF a Weboldalon történő közzététellel lép hatályba. A Weboldal további használata a módosítások elfogadásának minősül."
                  : "The Provider reserves the right to unilaterally amend these T&C. Amended T&C take effect upon publication on the Website. Continued use of the Website constitutes acceptance of the amendments."}
              </p>
            </Section>

            {/* 9. Contact */}
            <Section
              number="9."
              titleHu="Kapcsolat"
              titleEn="Contact"
            >
              <p>
                {isHu
                  ? "Kérdéseivel forduljon hozzánk bizalommal:"
                  : "If you have any questions, please contact us:"}
              </p>
              <address className="not-italic pl-4 border-l-2 border-primary/30 space-y-1">
                <p>Gerecse Ingatlan Kft.</p>
                <p>2890 Tata, Példa utca 1.</p>
                <p>
                  E-mail:{" "}
                  <a
                    href="mailto:info@gerecseingatlan.hu"
                    className="text-primary hover:underline"
                  >
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
            </Section>

            {/* Cross-links */}
            <div className="text-center pt-4 space-y-2">
              <p className="font-body text-sm text-gray-600">
                <Link
                  to={localePath("/impresszum")}
                  className="text-primary font-semibold hover:underline"
                >
                  {isHu ? "Impresszum" : "Legal Notice"}
                </Link>
                {" · "}
                <Link
                  to={localePath("/adatkezelesi-tajekoztato")}
                  className="text-primary font-semibold hover:underline"
                >
                  {isHu ? "Adatkezelési tájékoztató" : "Privacy Policy"}
                </Link>
                {" · "}
                <Link
                  to={localePath("/cookie-tajekoztato")}
                  className="text-primary font-semibold hover:underline"
                >
                  {isHu ? "Cookie tájékoztató" : "Cookie Policy"}
                </Link>
              </p>
            </div>

            {/* Last updated */}
            <p className="text-center text-xs text-gray-500 font-body">
              {isHu
                ? "Hatályba lépés: 2026. április 16."
                : "Effective date: 16 April 2026"}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ASZFPage;
