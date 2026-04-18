import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Award, Users, Heart, Eye, XCircle, Quote } from "lucide-react";

const notRightFitItems = [
  {
    hu: "Ha nem szeretne őszinte, reális véleményt hallani",
    en: "If you don't want to hear honest, realistic opinions",
  },
  {
    hu: "Ha nem hajlandó kihasználni általunk biztosított kedvezményeket",
    en: "If you're unwilling to take advantage of the discounts we provide",
  },
  {
    hu: "Ha zavarja az, hogy mindent elintézünk Ön helyett (érintésvédelem, energetika, földhivatali ügyintézés, ügyvédi egyeztetések az adásvétellel és az ingatlant érintő tennivalókkal kapcsolatban)",
    en: "If it bothers you that we handle everything for you (contact protection, energy certification, land registry, legal consultations regarding the sale and property-related tasks)",
  },
  {
    hu: "Ha azt várja, hogy rábeszéljük vagy támogassuk egy rossz döntésben",
    en: "If you expect us to talk you into or support a bad decision",
  },
  {
    hu: "Ha gyanúsnak találja, hogy alacsony jutalékkal dolgozunk",
    en: "If you find it suspicious that we work with low commission",
  },
  {
    hu: "Ha nem szeretne elsőkézből hitelezési tanácsokat, információkat kapni",
    en: "If you don't want first-hand mortgage advice and information",
  },
];

const IntroductionPage = () => {
  const { t, lang } = useLanguage();

  const values = [
    { icon: Award, labelHu: "Megbízhatóság", labelEn: "Reliability" },
    { icon: Users, labelHu: "Szakértelem", labelEn: "Expertise" },
    { icon: Heart, labelHu: "Odafigyelés", labelEn: "Personal care" },
    { icon: Eye, labelHu: "Átláthatóság", labelEn: "Transparency" },
  ];

  const seoTitle = lang === "hu"
    ? "Bemutatkozás – Gerecse Ingatlan"
    : "Introduction – Gerecse Ingatlan";
  const seoDescription = lang === "hu"
    ? "Ismerje meg a Gerecse Ingatlan csapatát, szemléletünket és küldetésünket. Családias, ügyfélközpontú ingatlanszolgáltatás."
    : "Learn about the Gerecse Ingatlan team, our approach and mission. Family-like, client-focused real estate services.";

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/bemutatkozas">
      {/* Hero */}
      <section className="bg-dark-green py-20 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary-foreground mb-6">
            {lang === "hu" ? "Bemutatkozás" : "Introduction"}
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 font-body leading-relaxed">
            {lang === "hu"
              ? "Válassza irodánk tapasztalt ingatlan szakértőit és tudja biztos kezekben az ügyintézés teljes folyamatát!"
              : "Choose our experienced real estate experts and rest assured that the entire process is in safe hands!"}
          </p>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          <div>
            <h2 className="text-2xl font-heading font-bold text-dark-green mb-4">
              {lang === "hu" ? "Rólunk" : "About us"}
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg">
              {lang === "hu"
                ? "Családias hangulatú, ügyfélközpontú szemléletünk különböztet meg minket a piacon szereplő konkurenciáinktól. Tatától-Esztergomig és főként a Duna mentén foglalkozunk eladó és kiadó ingatlanokkal. Legyen szó minigarzonról vagy több száz millió értékű ipari ingatlanról. Természetesen kereső ügyfeleinkről is gondoskodunk, megpróbáljuk kielégíteni mindenki igényeit."
                : "Our family-like, client-focused approach sets us apart from our competitors. We deal with properties for sale and rent from Tata to Esztergom, primarily along the Danube. Whether it's a small studio or an industrial property worth hundreds of millions. Of course, we also take care of our searching clients, trying to satisfy everyone's needs."}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold text-dark-green mb-4">
              {lang === "hu" ? "Küldetésünk" : "Our Mission"}
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg">
              {lang === "hu"
                ? "Számunkra az a fontos, hogy valódi segítséget nyújtsunk. Küldetésünk, hogy olyan átfogó és egyben minőségi szolgáltatást nyújtsunk, melyben a szakértelem és az ügyfélközpontúság egyszerre van jelen, ennek köszönhetően tulajdonosok és vevőink egyaránt elégedetten és sikeresen zárhatják le adásvételt/bérbeadást. Legyen szó akár első lakás vásárlásról, családi ház eladásáról, befektetési célú ingatlanról vagy agglomerációba költözésről, végig kísérjük a teljes folyamatot."
                : "What matters to us is providing real help. Our mission is to provide comprehensive, quality service where expertise and client focus go hand in hand, allowing both owners and buyers to close sales/rentals with satisfaction and success. Whether it's buying a first home, selling a family house, investing in property, or moving to the suburbs, we accompany you through the entire process."}
            </p>
          </div>
        </div>
      </section>

      {/* Motto */}
      <section className="py-12 bg-gold/10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Quote size={40} className="mx-auto mb-4 text-gold" aria-hidden="true" />
          <blockquote className="text-2xl md:text-3xl font-heading font-bold text-dark-green italic">
            &ldquo;{lang === "hu"
              ? "Az a jó üzlet, amikor mindenki elégedett!"
              : "A good deal is when everyone is satisfied!"}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 bg-gold/10" aria-labelledby="values-heading">
        <div className="container mx-auto px-4">
          <h2 id="values-heading" className="text-2xl font-heading font-bold text-dark-green text-center mb-8">
            {t.about.values}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {values.map(({ icon: Icon, labelHu, labelEn }) => {
              const label = lang === "hu" ? labelHu : labelEn;
              return (
                <div key={label} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center">
                    <Icon size={28} className="text-gold" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* When We're Not the Right Fit */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-heading font-bold text-dark-green mb-2 text-center">
            {lang === "hu"
              ? "Nem mi vagyunk a megfelelő választás, ha..."
              : "We're not the right fit if..."}
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            {lang === "hu" ? "😉" : "😉"}
          </p>
          <ul className="space-y-4">
            {notRightFitItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-card rounded-lg p-4 shadow-sm">
                <XCircle size={22} className="text-gold shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-foreground font-body leading-relaxed">
                  {lang === "hu" ? item.hu : item.en}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

    </Layout>
  );
};

export default IntroductionPage;
