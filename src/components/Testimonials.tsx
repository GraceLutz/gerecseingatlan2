import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent, useContentBlock, useContentArray } from "@/contexts/ContentContext";
import { Star, Quote, Pencil, Check, X, Trash2, Plus, ExternalLink } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";

interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  rating: number;
}

interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  time: number;
  profilePhotoUrl: string;
  authorUrl: string;
}

interface GoogleReviewsResponse {
  reviews: GoogleReview[];
  cachedAt: string;
  placeRating: number;
  totalReviews: number;
}

const DEFAULT_TESTIMONIALS_HU: TestimonialItem[] = [
  { name: "Kovács János", role: "Eladó", text: "El sem tudom mondani, mekkora segítség volt a csapat! Az ingatlanom hónapokig nem mozdult, amíg egyedül hirdettem, ők pedig két hét alatt eladták – ráadásul jobb áron, mint amire számítottam.", rating: 5 },
  { name: "Nagy András", role: "Vásárló", text: "Nagyon örülök, hogy rájuk találtam! Segítettek hitelt intézni, eligazítottak a támogatások között, és végül megvettük álmaink otthonát.", rating: 5 },
  { name: "Laurinyecz Éva", role: "Eladó", text: "Az egész folyamat stresszmentes volt, ami nálam nagy szó! Precízen, pontosan dolgoznak.", rating: 5 },
  { name: "Szabó Beáta", role: "Vásárló", text: "Ami nekem napokig tartott volna, nekik pár óra volt. Megbízhatóak, őszinték, és tényleg segíteni akarnak.", rating: 5 },
];

const DEFAULT_TESTIMONIALS_EN: TestimonialItem[] = [
  { name: "János Kovács", role: "Seller", text: "I can't express how much the team helped! They sold it in two weeks – at a better price than I expected.", rating: 5 },
  { name: "András Nagy", role: "Buyer", text: "I'm so glad I found them! They helped arrange the mortgage, and we finally bought our dream home.", rating: 5 },
  { name: "Éva Laurinyecz", role: "Seller", text: "The entire process was stress-free, which is a big deal for me! They work precisely and accurately.", rating: 5 },
  { name: "Beáta Szabó", role: "Buyer", text: "What would have taken me days, took them just a few hours. Reliable, honest, and they genuinely want to help.", rating: 5 },
];

const PAGE = "/velemenyek";

async function fetchGoogleReviews(): Promise<GoogleReviewsResponse> {
  const res = await fetch("/api/reviews");
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const roundedUp = rating - fullStars >= 0.75;
  const totalFull = roundedUp ? fullStars + 1 : fullStars;
  const emptyStars = 5 - totalFull - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating} / 5`}>
      {Array.from({ length: totalFull }).map((_, i) => (
        <Star key={`f${i}`} size={size} className="fill-gold text-gold" aria-hidden="true" />
      ))}
      {hasHalf && (
        <span className="relative inline-block" style={{ width: size, height: size }} aria-hidden="true">
          <Star size={size} className="text-gold absolute inset-0" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <Star size={size} className="fill-gold text-gold" />
          </span>
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`e${i}`} size={size} className="text-gold/30" aria-hidden="true" />
      ))}
    </span>
  );
}

function GoogleReviewCard({ review }: { review: GoogleReview }) {
  const initials = review.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow relative">
      <div className="flex items-center gap-1 mb-1">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4285F4] bg-[#4285F4]/10 px-2 py-0.5 rounded-full">
          <GoogleIcon />
          Google
        </span>
      </div>
      <div className="flex gap-0.5 mb-3">
        <StarRating rating={review.rating} size={16} />
      </div>
      {review.text && (
        <blockquote className="text-muted-foreground font-body italic leading-relaxed mb-4 line-clamp-4">
          &ldquo;{review.text}&rdquo;
        </blockquote>
      )}
      <footer className="flex items-center gap-2">
        {review.profilePhotoUrl ? (
          <img
            src={review.profilePhotoUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              const fallback = el.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-10 h-10 rounded-full bg-[#4285F4]/10 items-center justify-center text-[#4285F4] font-heading font-bold text-sm"
          style={{ display: review.profilePhotoUrl ? "none" : "flex" }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0">
          {review.authorUrl ? (
            <a
              href={review.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="not-italic font-semibold text-foreground text-sm hover:text-[#4285F4] transition-colors"
            >
              {review.authorName}
            </a>
          ) : (
            <cite className="not-italic font-semibold text-foreground text-sm">
              {review.authorName}
            </cite>
          )}
          <p className="text-xs text-muted-foreground truncate">
            {review.relativeTimeDescription}
          </p>
        </div>
      </footer>
    </article>
  );
}

function GoogleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const Testimonials = () => {
  const { t, lang } = useLanguage();
  const { isAdmin } = useContent();
  const { content: testimonialsTitle } = useContentBlock(PAGE, "page.title", t.about.testimonials);
  const { content: testimonialsSubtitle } = useContentBlock(PAGE, "page.subtitle",
    lang === "hu" ? "Ügyfeleink tapasztalatai és visszajelzései" : "Experiences and feedback from our clients"
  );
  const { items: testimonials } = useContentArray<TestimonialItem>(
    PAGE,
    "testimonials.items",
    lang === "hu" ? DEFAULT_TESTIMONIALS_HU : DEFAULT_TESTIMONIALS_EN
  );

  const googleReviews = useQuery({
    queryKey: ["google-reviews"],
    queryFn: fetchGoogleReviews,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const hasGoogleReviews = googleReviews.data && googleReviews.data.reviews.length > 0;

  const [localItems, setLocalItems] = useState<TestimonialItem[]>(testimonials);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<TestimonialItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalItems(testimonials);
  }, [testimonials]);

  const saveItems = useCallback(async (newItems: TestimonialItem[]) => {
    setSaving(true);
    setError(null);
    try {
      const csrf = getCsrfToken();
      const res = await fetch("/api/admin/content/by-path", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "x-csrf-token": csrf } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          pagePath: PAGE,
          blockKey: "testimonials.items",
          content: JSON.stringify(newItems),
          contentType: "json",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (lang === "hu" ? `Mentés sikertelen (${res.status})` : `Save failed (${res.status})`));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (lang === "hu" ? "Hiba történt a mentés során." : "An error occurred while saving."));
    } finally {
      setSaving(false);
    }
  }, [lang]);

  const startEditing = useCallback((index: number) => {
    setEditingIndex(index);
    setEditDraft({ ...localItems[index] });
    setError(null);
  }, [localItems]);

  const cancelEditing = useCallback(() => {
    setEditingIndex(null);
    setEditDraft(null);
  }, []);

  const confirmEditing = useCallback(() => {
    if (editingIndex === null || !editDraft) return;
    const updated = [...localItems];
    updated[editingIndex] = editDraft;
    setLocalItems(updated);
    saveItems(updated);
    setEditingIndex(null);
    setEditDraft(null);
  }, [editingIndex, editDraft, localItems, saveItems]);

  const addItem = useCallback(() => {
    const newItem: TestimonialItem = {
      name: lang === "hu" ? "Új ügyfél" : "New client",
      role: lang === "hu" ? "Ügyfél" : "Client",
      text: lang === "hu" ? "Vélemény szövege..." : "Testimonial text...",
      rating: 5,
    };
    const updated = [...localItems, newItem];
    setLocalItems(updated);
    saveItems(updated);
    setTimeout(() => startEditing(updated.length - 1), 100);
  }, [localItems, saveItems, lang, startEditing]);

  const deleteItem = useCallback((index: number) => {
    const updated = localItems.filter((_, i) => i !== index);
    setLocalItems(updated);
    saveItems(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditDraft(null);
    }
  }, [localItems, editingIndex, saveItems]);

  const renderCard = (testimonial: TestimonialItem, i: number) => {
    const initials = testimonial.name
      .split(" ")
      .map((n) => n[0])
      .join("");

    const isEditing = isAdmin && editingIndex === i;

    if (isEditing && editDraft) {
      return (
        <article
          key={i}
          className="bg-card rounded-xl p-6 shadow-sm border-2 border-blue-400 relative"
        >
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            <button
              type="button"
              onClick={confirmEditing}
              disabled={saving}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-50"
              aria-label={lang === "hu" ? "Mentés" : "Save"}
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-red-600 text-white rounded shadow hover:bg-red-700"
              aria-label={lang === "hu" ? "Mégse" : "Cancel"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3 mt-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {lang === "hu" ? "Vélemény szövege" : "Testimonial text"}
              </label>
              <textarea
                value={editDraft.text}
                onChange={(e) => setEditDraft({ ...editDraft, text: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={4}
                aria-label={lang === "hu" ? "Vélemény szövege" : "Testimonial text"}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {lang === "hu" ? "Név" : "Name"}
                </label>
                <input
                  type="text"
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label={lang === "hu" ? "Név" : "Name"}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {lang === "hu" ? "Szerepkör" : "Role"}
                </label>
                <input
                  type="text"
                  value={editDraft.role}
                  onChange={(e) => setEditDraft({ ...editDraft, role: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label={lang === "hu" ? "Szerepkör" : "Role"}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {lang === "hu" ? "Értékelés (1-5)" : "Rating (1-5)"}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditDraft({ ...editDraft, rating: star })}
                    className="p-2"
                    aria-label={`${star} ${lang === "hu" ? "csillag" : "star"}`}
                  >
                    <Star
                      size={18}
                      className={star <= editDraft.rating ? "fill-gold text-gold" : "text-muted-foreground"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article
        key={i}
        className={`bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow relative ${isAdmin ? "group/testimonial" : ""}`}
      >
        {isAdmin && (
          <span className="absolute top-2 right-2 flex gap-1 z-10">
            <button
              type="button"
              onClick={() => startEditing(i)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
              aria-label={lang === "hu" ? `${testimonial.name} szerkesztése` : `Edit ${testimonial.name}`}
              title={lang === "hu" ? "Szerkesztés" : "Edit"}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => deleteItem(i)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-all"
              aria-label={lang === "hu" ? `${testimonial.name} törlése` : `Delete ${testimonial.name}`}
              title={lang === "hu" ? "Törlés" : "Delete"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </span>
        )}
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
          &ldquo;{testimonial.text}&rdquo;
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
              {testimonial.name}
            </cite>
            {testimonial.role && (
              <p className="text-xs text-muted-foreground">
                {testimonial.role}
              </p>
            )}
          </div>
        </footer>
      </article>
    );
  };

  return (
    <section id="velemenyek" className="py-16 bg-background" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4">
        <h2
          id="testimonials-heading"
          data-editable="page.title"
          data-page={PAGE}
          className="text-3xl md:text-4xl font-heading font-bold text-dark-green text-center mb-3"
        >
          {testimonialsTitle}
        </h2>
        <p data-editable="page.subtitle" data-page={PAGE} className="text-center text-muted-foreground font-body mb-10 max-w-2xl mx-auto">
          {testimonialsSubtitle}
        </p>

        {hasGoogleReviews && (
          <div className="max-w-5xl mx-auto mb-12" aria-labelledby="google-reviews-heading">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h3 id="google-reviews-heading" className="text-xl md:text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                  <GoogleIcon />
                  Google {lang === "hu" ? "Vélemények" : "Reviews"}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-heading font-bold text-foreground">
                    {googleReviews.data!.placeRating.toFixed(1)}
                  </span>
                  <div className="flex flex-col">
                    <StarRating rating={googleReviews.data!.placeRating} size={18} />
                    <span className="text-xs text-muted-foreground">
                      ({googleReviews.data!.totalReviews} {lang === "hu" ? "vélemény" : "reviews"})
                    </span>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/search/Gerecse+Ingatlan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#4285F4] hover:text-[#1a73e8] font-medium transition-colors"
                  aria-label={lang === "hu" ? "Összes Google vélemény megtekintése" : "View all Google reviews"}
                >
                  {lang === "hu" ? "Összes vélemény" : "All reviews"}
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {googleReviews.data!.reviews.map((review) => (
                <GoogleReviewCard key={review.time} review={review} />
              ))}
            </div>
          </div>
        )}

        {hasGoogleReviews && (
          <div className="max-w-5xl mx-auto mb-8">
            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <h3 className="text-lg font-heading font-semibold text-muted-foreground whitespace-nowrap">
                {lang === "hu" ? "Ügyfeleink mondták" : "What our clients say"}
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto" data-editable="testimonials.items" data-page={PAGE}>
          {localItems.map((testimonial, i) => renderCard(testimonial, i))}
        </div>
        {isAdmin && (
          <div className="max-w-5xl mx-auto mt-4">
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              aria-label={lang === "hu" ? "Új vélemény hozzáadása" : "Add new testimonial"}
            >
              <Plus className="h-4 w-4" />
              {lang === "hu" ? "Új vélemény" : "New testimonial"}
            </button>
            {saving && <span className="text-xs text-blue-600 mt-1 block">{lang === "hu" ? "Mentés..." : "Saving..."}</span>}
            {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
