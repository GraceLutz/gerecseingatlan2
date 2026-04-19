import { useState, useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PropertyGalleryProps {
  images: string[];
  alt: string;
}

/**
 * Image gallery with embla-carousel, thumbnail strip, and fullscreen lightbox.
 * Falls back to placeholder when no images are available.
 */
const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, alt }) => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const hasImages = images.length > 0;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setActiveIndex(idx);
    thumbApi?.scrollTo(idx);
  }, [emblaApi, thumbApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // Focus trap + scroll lock for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus lightbox
    lightboxRef.current?.focus();

    // Focus trap: keep Tab inside the lightbox
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !lightboxRef.current) return;
      const focusable = lightboxRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleFocusTrap);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleFocusTrap);
      // Restore focus to the trigger button
      triggerRef.current?.focus();
    };
  }, [lightboxOpen]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const goToSlide = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  // Lightbox navigation
  const lightboxPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const lightboxNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handleLightboxKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") lightboxPrev();
      else if (e.key === "ArrowRight") lightboxNext();
      else if (e.key === "Escape") setLightboxOpen(false);
    },
    [lightboxPrev, lightboxNext],
  );

  if (!hasImages) {
    return (
      <div className="aspect-video bg-muted rounded-xl flex items-center justify-center" role="img" aria-label={alt}>
        <Home size={64} className="text-primary/20" />
      </div>
    );
  }

  return (
    <>
      {/* Main carousel */}
      <div
        className="relative group rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        role="region"
        aria-roledescription="carousel"
        aria-label={t.properties.gallery}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); scrollPrev(); }
          else if (e.key === "ArrowRight") { e.preventDefault(); scrollNext(); }
        }}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((src, i) => (
              <div key={src} className="flex-[0_0_100%] min-w-0">
                <img
                  src={src}
                  alt={`${alt} — ${i + 1}/${images.length}`}
                  className="w-full aspect-video object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label={t.properties.prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-foreground/50 hover:bg-foreground/70 text-background rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label={t.properties.nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-foreground/50 hover:bg-foreground/70 text-background rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </>
        )}

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={t.properties.gallery}
          className="absolute bottom-3 right-3 bg-foreground/50 hover:bg-foreground/70 text-background rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-gold"
        >
          <Expand size={18} aria-hidden="true" />
        </button>

        <span className="absolute bottom-3 left-3 bg-foreground/60 text-background text-xs px-2 py-1 rounded" aria-live="polite">
          {activeIndex + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-3 overflow-hidden" ref={thumbRef}>
          <div className="flex gap-2" role="tablist" aria-label={t.properties.gallery}>
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`${t.properties.imageCount} ${i + 1}`}
                onClick={() => goToSlide(i)}
                className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 ${
                  i === activeIndex ? "border-primary" : "border-transparent hover:border-primary/40"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox with focus trap + scroll lock */}
      {lightboxOpen && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={t.properties.gallery}
          onClick={() => setLightboxOpen(false)}
          onKeyDown={handleLightboxKeyDown}
          tabIndex={-1}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label={t.common.close}
            className="absolute top-4 right-4 text-background hover:text-background/80 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
          >
            <X size={32} />
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              aria-label={t.properties.prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-background hover:text-background/80 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
            >
              <ChevronLeft size={40} />
            </button>
          )}

          <img
            src={images[activeIndex]}
            alt={`${alt} — ${activeIndex + 1}/${images.length}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              aria-label={t.properties.nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-background hover:text-background/80 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
            >
              <ChevronRight size={40} />
            </button>
          )}

          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-background text-sm" aria-live="polite">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
};

export default PropertyGallery;
