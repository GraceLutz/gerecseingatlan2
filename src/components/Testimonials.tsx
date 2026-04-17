import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  nameHu: string;
  nameEn: string;
  textHu: string;
  textEn: string;
  roleHu?: string;
  roleEn?: string;
  rating?: number;
}

const testimonials: Testimonial[] = [
  {
    nameHu: "Kovács János",
    nameEn: "János Kovács",
    textHu:
      "El sem tudom mondani, mekkora segítség volt a csapat! Az ingatlanom hónapokig nem mozdult, amíg egyedül hirdettem, ők pedig két hét alatt eladták – ráadásul jobb áron, mint amire számítottam.",
    textEn:
      "I can't express how much the team helped! My property wasn't moving for months while I was advertising alone, but they sold it in two weeks – at a better price than I expected.",
    roleHu: "Eladó",
    roleEn: "Seller",
    rating: 5,
  },
  {
    nameHu: "Nagy András",
    nameEn: "András Nagy",
    textHu:
      "Nagyon örülök, hogy rájuk találtam! Segítettek hitelt intézni, eligazítottak a támogatások között, és végül megvettük álmaink otthonát. Végig ott voltak, minden kérdésemre válaszoltak.",
    textEn:
      "I'm so glad I found them! They helped arrange the mortgage, guided me through the subsidies, and we finally bought our dream home. They were there every step of the way.",
    roleHu: "Vásárló",
    roleEn: "Buyer",
    rating: 5,
  },
  {
    nameHu: "Laurinyecz Éva",
    nameEn: "Éva Laurinyecz",
    textHu:
      "Az egész folyamat stresszmentes volt, ami nálam nagy szó! Nem csak az ingatlan eladását bíztam rájuk, hanem az értékbecslést, fotózást, hirdetést is. Precízen, pontosan dolgoznak.",
    textEn:
      "The entire process was stress-free, which is a big deal for me! I entrusted them not just with selling the property, but also with the appraisal, photography, and advertising. They work precisely and accurately.",
    roleHu: "Eladó",
    roleEn: "Seller",
    rating: 5,
  },
  {
    nameHu: "Szabó Beáta",
    nameEn: "Beáta Szabó",
    textHu:
      "Ami nekem napokig tartott volna, nekik pár óra volt. Olyan lakásokat mutattak, amik valóban passzoltak hozzánk – nem futottunk felesleges köröket. Megbízhatóak, őszinték, és tényleg segíteni akarnak.",
    textEn:
      "What would have taken me days, took them just a few hours. They showed apartments that truly matched our needs – no wasted time. Reliable, honest, and they genuinely want to help.",
    roleHu: "Vásárló",
    roleEn: "Buyer",
    rating: 5,
  },
];

/**
 * Testimonials section displaying client reviews in a responsive grid.
 * Includes star ratings and quote styling.
 */
const Testimonials = () => {
  const { t, lang } = useLanguage();

  return (
    <section id="velemenyek" className="py-16 bg-background" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <h2
          id="testimonials-heading"
          className="text-3xl md:text-4xl font-heading font-bold text-dark-green text-center mb-3"
        >
          {t.about.testimonials}
        </h2>
        <p className="text-center text-muted-foreground font-body mb-10 max-w-2xl mx-auto">
          {lang === "hu"
            ? "Ügyfeleink tapasztalatai és visszajelzései"
            : "Experiences and feedback from our clients"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, i) => {
            const name = lang === "hu" ? testimonial.nameHu : testimonial.nameEn;
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("");
            return (
            <article
              key={i}
              className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow relative"
            >
              <Quote
                size={32}
                className="absolute top-4 right-4 text-primary/10"
                aria-hidden="true"
              />
              {testimonial.rating && (
                <div className="flex gap-0.5 mb-3" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: testimonial.rating }).map((_, s) => (
                    <Star
                      key={s}
                      size={16}
                      className="fill-gold text-gold"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
              <blockquote className="text-muted-foreground font-body italic leading-relaxed mb-4">
                &ldquo;{lang === "hu" ? testimonial.textHu : testimonial.textEn}&rdquo;
              </blockquote>
              <footer className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div>
                  <cite className="not-italic font-semibold text-foreground text-sm">
                    {name}
                  </cite>
                  {testimonial.roleHu && (
                    <p className="text-xs text-muted-foreground">
                      {lang === "hu" ? testimonial.roleHu : testimonial.roleEn}
                    </p>
                  )}
                </div>
              </footer>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
