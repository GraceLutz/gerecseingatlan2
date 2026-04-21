import { useState, useCallback, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent, useContentBlock, useContentArray } from "@/contexts/ContentContext";
import { Star, Quote, Pencil, Check, X, Trash2, Plus } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";

interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  rating: number;
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
        throw new Error(data.error || `Mentés sikertelen (${res.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a mentés során.");
    } finally {
      setSaving(false);
    }
  }, []);

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
              className="p-1.5 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-50"
              aria-label="Mentés"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="p-1.5 bg-red-600 text-white rounded shadow hover:bg-red-700"
              aria-label="Mégse"
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
                    className="p-0.5"
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
          <span className="invisible group-hover/testimonial:visible absolute top-2 right-2 flex gap-1 z-10">
            <button
              type="button"
              onClick={() => startEditing(i)}
              className="p-1.5 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
              aria-label={`${testimonial.name} szerkesztése`}
              title="Szerkesztés"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => deleteItem(i)}
              className="p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-all"
              aria-label={`${testimonial.name} törlése`}
              title="Törlés"
            >
              <Trash2 className="h-3 w-3" />
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
