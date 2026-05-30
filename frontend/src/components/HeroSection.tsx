import { useState, useEffect, useCallback } from "react";
import { useContentBlock } from "@/contexts/ContentContext";

const SLIDE_INTERVAL = 5000;
const TRANSITION_MS = 1000;

const SLIDES = [
  "/picture5.jpg",
  "/picture2.jpg",
  "/picture6.jpg",
];

const HeroSection = () => {
  const { content: heroTitle, loading } = useContentBlock(
    "/",
    "hero.title",
    "Az első gondolattól kulcsátadásig",
  );
  const { content: heroSubtitle } = useContentBlock(
    "/",
    "hero.subtitle",
    "Teljes körű szolgáltatással állunk ügyfeleink rendelkezésére.",
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const textVisible = !loading;

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setResetKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, resetKey]);

  return (
    <section
      className="relative h-[85vh] min-h-[400px] flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
      aria-roledescription="carousel"
      aria-label="Hero képváltó"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden={i !== activeIndex}
          className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
          style={{
            objectPosition: "center 80%",
            transitionDuration: `${TRANSITION_MS}ms`,
            opacity: i === activeIndex ? 1 : 0,
          }}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={i === 0 ? "high" : "auto"}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Text content */}
      <div
        className={`relative z-10 text-center px-4 max-w-4xl mx-auto w-full transition-opacity duration-500 ${textVisible ? "opacity-100" : "opacity-0"}`}
      >
        <h1
          id="hero-title"
          data-editable="hero.title"
          data-page="/"
          className="text-3xl md:text-6xl lg:text-7xl font-heading font-bold"
          style={{
            background: "linear-gradient(135deg, #996515 0%, #D4AF37 35%, #E5C466 50%, #D4AF37 65%, #A67C00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
          }}
        >
          {heroTitle || "Az első gondolattól kulcsátadásig"}
        </h1>
        <p
          data-editable="hero.subtitle"
          data-page="/"
          className="text-xl md:text-3xl lg:text-4xl font-semibold mt-6"
          style={{
            color: "#FFFFFF",
            textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 1px 3px rgba(0,0,0,0.6)",
          }}
        >
          {heroSubtitle ||
            "Teljes körű szolgáltatással állunk ügyfeleink rendelkezésére."}
        </p>
      </div>

      {/* Navigation dots */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2.5"
        role="tablist"
        aria-label="Dia navigáció"
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`${i + 1}. dia`}
            onClick={() => goToSlide(i)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-8 h-2.5 bg-amber-400"
                : "w-2.5 h-2.5 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
