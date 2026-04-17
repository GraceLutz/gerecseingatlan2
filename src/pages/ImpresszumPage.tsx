import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, Mail, Phone, Globe, Server } from "lucide-react";

/**
 * Impresszum (Legal Notice / Imprint) page.
 *
 * Required by Hungarian law (2001. évi CVIII. törvény – Ekertv.) for all
 * commercial websites. Displays company identity, registration details,
 * tax number, contact information and hosting provider data.
 */
const ImpresszumPage = () => {
  const { lang } = useLanguage();
  const isHu = lang === "hu";

  const title = isHu
    ? "Impresszum – Gerecse Ingatlan"
    : "Legal Notice – Gerecse Ingatlan";
  const description = isHu
    ? "A Gerecse Ingatlan impresszuma: céginformációk, elérhetőségek, tárhelyszolgáltató adatai a 2001. évi CVIII. törvény szerint."
    : "Legal notice of Gerecse Ingatlan: company information, contact details, and hosting provider data.";

  return (
    <Layout title={title} description={description} canonicalPath="/impresszum">
      {/* Hero */}
      <section className="bg-dark-green py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
          {isHu ? "Impresszum" : "Legal Notice"}
        </h1>
        <p className="text-primary-foreground/70 font-body mt-2 max-w-xl mx-auto px-4">
          {isHu
            ? "Jogszabályi kötelezettség a 2001. évi CVIII. törvény (Ekertv.) alapján"
            : "Legal obligation under Hungarian Act CVIII of 2001"}
        </p>
      </section>

      {/* Content */}
      <section className="py-16 bg-light-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Company information */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 size={20} className="text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-heading font-bold text-dark-navy">
                  {isHu ? "Szolgáltató adatai" : "Service Provider"}
                </h2>
              </div>
              <dl className="space-y-3 font-body text-gray-700 text-sm leading-relaxed">
                <div>
                  <dt className="font-semibold text-dark-navy">
                    {isHu ? "Cégnév" : "Company name"}
                  </dt>
                  <dd>Gerecse Ingatlan Kft.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-dark-navy">
                    {isHu ? "Székhely" : "Registered office"}
                  </dt>
                  <dd>2890 Tata, Példa utca 1.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-dark-navy">
                    {isHu ? "Cégjegyzékszám" : "Company registration no."}
                  </dt>
                  <dd>11-09-XXXXXX</dd>
                </div>
                <div>
                  <dt className="font-semibold text-dark-navy">
                    {isHu ? "Adószám" : "Tax number"}
                  </dt>
                  <dd>XXXXXXXX-X-XX</dd>
                </div>
                <div>
                  <dt className="font-semibold text-dark-navy">
                    {isHu ? "Nyilvántartó bíróság" : "Court of registration"}
                  </dt>
                  <dd>
                    {isHu
                      ? "Tatabányai Törvényszék Cégbírósága"
                      : "Company Court of Tatabánya"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-dark-navy">
                    {isHu ? "Képviselő" : "Representative"}
                  </dt>
                  <dd>{isHu ? "Gerecse Ingatlan ügyvezető" : "Managing Director"}</dd>
                </div>
              </dl>
            </article>

            {/* Contact information */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone size={20} className="text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-heading font-bold text-dark-navy">
                  {isHu ? "Elérhetőségek" : "Contact Information"}
                </h2>
              </div>
              <dl className="space-y-3 font-body text-gray-700 text-sm leading-relaxed">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <dt className="sr-only">{isHu ? "Telefon" : "Phone"}</dt>
                  <dd>
                    <a
                      href="tel:+36706132658"
                      className="hover:text-primary transition-colors"
                    >
                      +36 70 613 2658
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <dt className="sr-only">E-mail</dt>
                  <dd>
                    <a
                      href="mailto:info@gerecseingatlan.hu"
                      className="hover:text-primary transition-colors"
                    >
                      info@gerecseingatlan.hu
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <dt className="sr-only">{isHu ? "Weboldal" : "Website"}</dt>
                  <dd>
                    <a
                      href="https://gerecseingatlan.hu"
                      className="hover:text-primary transition-colors"
                    >
                      gerecseingatlan.hu
                    </a>
                  </dd>
                </div>
              </dl>
            </article>

            {/* Hosting provider */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Server size={20} className="text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-heading font-bold text-dark-navy">
                  {isHu ? "Tárhelyszolgáltató" : "Hosting Provider"}
                </h2>
              </div>
              <dl className="space-y-3 font-body text-gray-700 text-sm leading-relaxed">
                <div>
                  <dt className="font-semibold text-dark-navy">
                    {isHu ? "Név" : "Name"}
                  </dt>
                  <dd>[Tárhelyszolgáltató neve]</dd>
                </div>
                <div>
                  <dt className="font-semibold text-dark-navy">
                    {isHu ? "Cím" : "Address"}
                  </dt>
                  <dd>[Tárhelyszolgáltató címe]</dd>
                </div>
                <div>
                  <dt className="font-semibold text-dark-navy">
                    {isHu ? "Weboldal" : "Website"}
                  </dt>
                  <dd>[Tárhelyszolgáltató weboldala]</dd>
                </div>
              </dl>
            </article>

            {/* Disclaimer */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl font-heading font-bold text-dark-navy mb-4">
                {isHu ? "Szerzői jogok" : "Copyright"}
              </h2>
              <p className="font-body text-gray-700 text-sm leading-relaxed">
                {isHu
                  ? "A weboldalon megjelenő tartalmak (szövegek, képek, grafikák, logók) a Gerecse Ingatlan Kft. szellemi tulajdonát képezik. Ezek másolása, terjesztése vagy bármilyen felhasználása kizárólag a Gerecse Ingatlan Kft. előzetes írásos engedélyével lehetséges."
                  : "All content on this website (texts, images, graphics, logos) is the intellectual property of Gerecse Ingatlan Kft. Copying, distribution or any use of these materials is only permitted with prior written consent of Gerecse Ingatlan Kft."}
              </p>
            </article>

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

export default ImpresszumPage;
