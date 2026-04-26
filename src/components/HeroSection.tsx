import { useContentBlock } from "@/contexts/ContentContext";
import heroBg from "@/assets/backround.jpg";

const HeroSection = () => {
  const { content: heroTitle, loading } = useContentBlock("/", "hero.title", "");
  const { content: heroSubtitle } = useContentBlock("/", "hero.subtitle", "");
  const textVisible = !loading;

  return (
    <section
      className="relative min-h-[85vh] flex items-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Decorative background image */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover object-[center_80%] md:object-[center_45%]"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      {/* Gradient overlay for text legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-primary/25 via-primary/10 to-primary/15"
        aria-hidden="true"
      />

      <div className={`relative z-10 text-center px-4 max-w-4xl mx-auto py-20 md:py-24 transition-opacity duration-500 ${textVisible ? "opacity-100" : "opacity-0"}`}>
        <h1
          id="hero-title"
          data-editable="hero.title"
          data-page="/"
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-4 drop-shadow-lg"
        >
          {heroTitle}
        </h1>
        <p data-editable="hero.subtitle" data-page="/" className="text-lg md:text-xl text-primary-foreground/90 font-body drop-shadow">
          {heroSubtitle}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
