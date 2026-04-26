import { useEffect } from "react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import { buildBreadcrumbJsonLd } from "@/components/SEOHead";
import RichText from "@/components/RichText";
import { Building2, Mail, Phone, Globe, Server } from "lucide-react";

const PAGE = "/impresszum";

const ImpresszumPage = () => {
  const { lang, t } = useLanguage();
  const isHu = lang === "hu";

  const { content: heroTitle } = useContentBlock(PAGE, "page.title", isHu ? "Impresszum" : "Legal Notice");
  const { content: heroSubtitle } = useContentBlock(PAGE, "page.subtitle", isHu
    ? "Jogszabályi kötelezettség a 2001. évi CVIII. törvény (Ekertv.) alapján"
    : "Legal obligation under Hungarian Act CVIII of 2001");

  const { content: companyHeading } = useContentBlock(PAGE, "company.heading", isHu ? "Szolgáltató adatai" : "Service Provider");
  const { content: companyNameLabel } = useContentBlock(PAGE, "company.nameLabel", isHu ? "Cégnév" : "Company name");
  const { content: companyName } = useContentBlock(PAGE, "company.name", "Gerecse Ingatlan Kft.");
  const { content: companyAddressLabel } = useContentBlock(PAGE, "company.addressLabel", isHu ? "Székhely" : "Registered office");
  const { content: companyAddress } = useContentBlock(PAGE, "company.address", "2890 Tata, Példa utca 1.");
  const { content: companyRegLabel } = useContentBlock(PAGE, "company.regLabel", isHu ? "Cégjegyzékszám" : "Company registration no.");
  const { content: companyRegNumber } = useContentBlock(PAGE, "company.regNumber", "11-09-XXXXXX");
  const { content: companyTaxLabel } = useContentBlock(PAGE, "company.taxLabel", isHu ? "Adószám" : "Tax number");
  const { content: companyTaxNumber } = useContentBlock(PAGE, "company.taxNumber", "XXXXXXXX-X-XX");
  const { content: companyCourtLabel } = useContentBlock(PAGE, "company.courtLabel", isHu ? "Nyilvántartó bíróság" : "Court of registration");
  const { content: companyCourt } = useContentBlock(PAGE, "company.court", isHu ? "Tatabányai Törvényszék Cégbírósága" : "Company Court of Tatabánya");
  const { content: companyRepLabel } = useContentBlock(PAGE, "company.repLabel", isHu ? "Képviselő" : "Representative");
  const { content: companyRep } = useContentBlock(PAGE, "company.rep", isHu ? "Gerecse Ingatlan ügyvezető" : "Managing Director");

  const { content: contactHeading } = useContentBlock(PAGE, "contact.heading", isHu ? "Elérhetőségek" : "Contact Information");
  const { content: contactPhone } = useContentBlock(PAGE, "contact.phone", "+36 70 613 2658");
  const { content: contactEmail } = useContentBlock(PAGE, "contact.email", "info@gerecseingatlan.hu");
  const { content: contactWebsite } = useContentBlock(PAGE, "contact.website", "gerecseingatlan.hu");

  const { content: hostingHeading } = useContentBlock(PAGE, "hosting.heading", isHu ? "Tárhelyszolgáltató" : "Hosting Provider");
  const { content: hostingNameLabel } = useContentBlock(PAGE, "hosting.nameLabel", isHu ? "Név" : "Name");
  const { content: hostingName } = useContentBlock(PAGE, "hosting.name", "[Tárhelyszolgáltató neve]");
  const { content: hostingAddressLabel } = useContentBlock(PAGE, "hosting.addressLabel", isHu ? "Cím" : "Address");
  const { content: hostingAddress } = useContentBlock(PAGE, "hosting.address", "[Tárhelyszolgáltató címe]");
  const { content: hostingWebLabel } = useContentBlock(PAGE, "hosting.webLabel", isHu ? "Weboldal" : "Website");
  const { content: hostingWebsite } = useContentBlock(PAGE, "hosting.website", "[Tárhelyszolgáltató weboldala]");

  const { content: copyrightHeading } = useContentBlock(PAGE, "copyright.heading", isHu ? "Szerzői jogok" : "Copyright");
  const { content: copyrightText } = useContentBlock(PAGE, "copyright.text", isHu
    ? "A weboldalon megjelenő tartalmak (szövegek, képek, grafikák, logók) a Gerecse Ingatlan Kft. szellemi tulajdonát képezik. Ezek másolása, terjesztése vagy bármilyen felhasználása kizárólag a Gerecse Ingatlan Kft. előzetes írásos engedélyével lehetséges."
    : "All content on this website (texts, images, graphics, logos) is the intellectual property of Gerecse Ingatlan Kft. Copying, distribution or any use of these materials is only permitted with prior written consent of Gerecse Ingatlan Kft.");

  const { content: lastUpdated } = useContentBlock(PAGE, "page.lastUpdated", isHu
    ? "Utolsó frissítés: 2026. április 16."
    : "Last updated: 16 April 2026");

  const seoTitle = t.seo.impresszumTitle;
  const seoDescription = t.seo.impresszumDescription;

  const ORIGIN = "https://gerecseingatlan.hu";
  useEffect(() => {
    const schema = buildBreadcrumbJsonLd([
      { name: t.nav.home, url: ORIGIN },
      { name: seoTitle, url: `${ORIGIN}/impresszum` },
    ]);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-page-jsonld", "true");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [t.nav.home, seoTitle]);

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/impresszum">
      <section className="bg-dark-green py-16 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 data-editable="page.title" data-page={PAGE} className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            {heroTitle}
          </h1>
          <RichText content={heroSubtitle} data-editable="page.subtitle" data-page={PAGE} className="text-primary-foreground/70 font-body max-w-xl mx-auto" />
        </div>
      </section>

      <section className="py-16 bg-light-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-10">
            {/* Company information */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 size={20} className="text-primary" aria-hidden="true" />
                </div>
                <h2 data-editable="company.heading" data-page={PAGE} className="text-xl font-heading font-bold text-dark-navy">
                  {companyHeading}
                </h2>
              </div>
              <dl className="space-y-3 font-body text-gray-700 text-sm leading-relaxed">
                <div>
                  <dt data-editable="company.nameLabel" data-page={PAGE} className="font-semibold text-dark-navy">
                    {companyNameLabel}
                  </dt>
                  <dd data-editable="company.name" data-page={PAGE}>{companyName}</dd>
                </div>
                <div>
                  <dt data-editable="company.addressLabel" data-page={PAGE} className="font-semibold text-dark-navy">
                    {companyAddressLabel}
                  </dt>
                  <dd data-editable="company.address" data-page={PAGE}>{companyAddress}</dd>
                </div>
                <div>
                  <dt data-editable="company.regLabel" data-page={PAGE} className="font-semibold text-dark-navy">
                    {companyRegLabel}
                  </dt>
                  <dd data-editable="company.regNumber" data-page={PAGE}>{companyRegNumber}</dd>
                </div>
                <div>
                  <dt data-editable="company.taxLabel" data-page={PAGE} className="font-semibold text-dark-navy">
                    {companyTaxLabel}
                  </dt>
                  <dd data-editable="company.taxNumber" data-page={PAGE}>{companyTaxNumber}</dd>
                </div>
                <div>
                  <dt data-editable="company.courtLabel" data-page={PAGE} className="font-semibold text-dark-navy">
                    {companyCourtLabel}
                  </dt>
                  <dd data-editable="company.court" data-page={PAGE}>{companyCourt}</dd>
                </div>
                <div>
                  <dt data-editable="company.repLabel" data-page={PAGE} className="font-semibold text-dark-navy">
                    {companyRepLabel}
                  </dt>
                  <dd data-editable="company.rep" data-page={PAGE}>{companyRep}</dd>
                </div>
              </dl>
            </article>

            {/* Contact information */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone size={20} className="text-primary" aria-hidden="true" />
                </div>
                <h2 data-editable="contact.heading" data-page={PAGE} className="text-xl font-heading font-bold text-dark-navy">
                  {contactHeading}
                </h2>
              </div>
              <dl className="space-y-3 font-body text-gray-700 text-sm leading-relaxed">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <dt className="sr-only">{isHu ? "Telefon" : "Phone"}</dt>
                  <dd data-editable="contact.phone" data-page={PAGE}>
                    <a
                      href={`tel:${contactPhone.replace(/\s/g, "")}`}
                      className="hover:text-primary transition-colors"
                    >
                      {contactPhone}
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <dt className="sr-only">E-mail</dt>
                  <dd data-editable="contact.email" data-page={PAGE}>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="hover:text-primary transition-colors"
                    >
                      {contactEmail}
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-primary shrink-0" aria-hidden="true" />
                  <dt className="sr-only">{isHu ? "Weboldal" : "Website"}</dt>
                  <dd data-editable="contact.website" data-page={PAGE}>
                    <a
                      href={`https://${contactWebsite}`}
                      className="hover:text-primary transition-colors"
                    >
                      {contactWebsite}
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
                <h2 data-editable="hosting.heading" data-page={PAGE} className="text-xl font-heading font-bold text-dark-navy">
                  {hostingHeading}
                </h2>
              </div>
              <dl className="space-y-3 font-body text-gray-700 text-sm leading-relaxed">
                <div>
                  <dt data-editable="hosting.nameLabel" data-page={PAGE} className="font-semibold text-dark-navy">
                    {hostingNameLabel}
                  </dt>
                  <dd data-editable="hosting.name" data-page={PAGE}>{hostingName}</dd>
                </div>
                <div>
                  <dt data-editable="hosting.addressLabel" data-page={PAGE} className="font-semibold text-dark-navy">
                    {hostingAddressLabel}
                  </dt>
                  <dd data-editable="hosting.address" data-page={PAGE}>{hostingAddress}</dd>
                </div>
                <div>
                  <dt data-editable="hosting.webLabel" data-page={PAGE} className="font-semibold text-dark-navy">
                    {hostingWebLabel}
                  </dt>
                  <dd data-editable="hosting.website" data-page={PAGE}>{hostingWebsite}</dd>
                </div>
              </dl>
            </article>

            {/* Copyright */}
            <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 data-editable="copyright.heading" data-page={PAGE} className="text-xl font-heading font-bold text-dark-navy mb-4">
                {copyrightHeading}
              </h2>
              <RichText content={copyrightText} data-editable="copyright.text" data-page={PAGE} className="font-body text-gray-700 text-sm leading-relaxed" />
            </article>

            {/* Last updated */}
            <RichText content={lastUpdated} data-editable="page.lastUpdated" data-page={PAGE} className="text-center text-xs text-gray-500 font-body" />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ImpresszumPage;
