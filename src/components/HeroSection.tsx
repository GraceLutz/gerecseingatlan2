import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import { Link } from "react-router-dom";
import heroBg from "@/assets/header2.jpg";

const HeroSection = () => {
  const { t, localePath } = useLanguage();
  const { content: heroTitle, loading } = useContentBlock("/", "hero.title", "");
  const { content: heroSubtitle } = useContentBlock("/", "hero.subtitle", "");
  const { content: heroCta } = useContentBlock("/", "hero.cta", "");
  const textVisible = !loading;

  return (
    <section
      className="relative min-h-[85vh] flex items-end overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Decorative background image */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover object-[center_75%]"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      {/* Gradient overlay for text legibility (WCAG AA contrast) */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-primary/10"
        aria-hidden="true"
      />

      <div className={`relative z-10 text-center px-4 max-w-4xl mx-auto pb-28 pt-48 md:pt-64 transition-opacity duration-500 ${textVisible ? "opacity-100" : "opacity-0"}`}>
        <h1
          id="hero-title"
          data-editable="hero.title"
          data-page="/"
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-4 drop-shadow-lg"
        >
          {heroTitle}
        </h1>
        <p data-editable="hero.subtitle" data-page="/" className="text-lg md:text-xl text-primary-foreground/90 font-body mb-8 drop-shadow">
          {heroSubtitle}
        </p>
        <Link
          to={localePath("/ingatlanok")}
          data-editable="hero.cta"
          data-page="/"
          className="inline-block px-8 py-3.5 bg-accent text-accent-foreground font-semibold text-lg rounded-lg hover:bg-accent/90 transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          {heroCta}
        </Link>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          role="presentation"
          focusable="false"
        >
          <path
            d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 37C672 44 768 58 864 62C960 66 1056 60 1152 52C1248 44 1344 34 1392 29L1440 24V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V60Z"
            className="fill-light-bg"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
