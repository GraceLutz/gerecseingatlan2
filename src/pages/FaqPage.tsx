import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent, useContentBlock, useContentArray } from "@/contexts/ContentContext";
import { useState, useCallback, useRef } from "react";
import { ChevronDown, Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";

interface FaqItem {
  q: string;
  a: string;
}

const PAGE = "/gyik";

const FaqPage = () => {
  const { t, lang } = useLanguage();
  const { isAdmin } = useContent();
  const { content: faqTitle } = useContentBlock(PAGE, "page.title", t.faq.title);
  const { content: faqSubtitle } = useContentBlock(PAGE, "page.subtitle", t.faq.subtitle);
  const { items: faqItems } = useContentArray<FaqItem>(PAGE, "faq.items", t.faq.items);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [localItems, setLocalItems] = useState<FaqItem[]>(faqItems);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsInitialized = useRef(false);

  if (!itemsInitialized.current && faqItems.length > 0) {
    itemsInitialized.current = true;
    setLocalItems(faqItems);
  }

  const toggle = (index: number) => {
    if (editingIndex !== null) return;
    setOpenIndex(openIndex === index ? null : index);
  };

  const saveItems = useCallback(
    async (newItems: FaqItem[]) => {
      setSaving(true);
      setError(null);
      try {
        const csrf = getCsrfToken();
        const res = await fetch(`/api/admin/content/by-path`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(csrf ? { "x-csrf-token": csrf } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            pagePath: PAGE,
            blockKey: "faq.items",
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
    },
    []
  );

  const startEditing = useCallback((index: number) => {
    setEditingIndex(index);
    setEditQ(localItems[index].q);
    setEditA(localItems[index].a);
    setOpenIndex(index);
    setError(null);
  }, [localItems]);

  const cancelEditing = useCallback(() => {
    setEditingIndex(null);
    setEditQ("");
    setEditA("");
    setError(null);
  }, []);

  const saveEditing = useCallback(() => {
    if (editingIndex === null) return;
    const updated = [...localItems];
    updated[editingIndex] = { q: editQ, a: editA };
    setLocalItems(updated);
    saveItems(updated);
    setEditingIndex(null);
  }, [editingIndex, editQ, editA, localItems, saveItems]);

  const addItem = useCallback(() => {
    const newItem: FaqItem = { q: "Új kérdés", a: "Válasz..." };
    const updated = [...localItems, newItem];
    setLocalItems(updated);
    saveItems(updated);
    setOpenIndex(updated.length - 1);
    startEditing(updated.length - 1);
  }, [localItems, saveItems, startEditing]);

  const deleteItem = useCallback((index: number) => {
    const updated = localItems.filter((_, i) => i !== index);
    setLocalItems(updated);
    saveItems(updated);
    if (editingIndex === index) setEditingIndex(null);
    if (openIndex === index) setOpenIndex(null);
  }, [localItems, editingIndex, openIndex, saveItems]);

  const seoTitle = lang === "hu"
    ? "Gyakori kérdések – Gerecse Ingatlan"
    : "FAQ – Gerecse Ingatlan";
  const seoDescription = lang === "hu"
    ? "Válaszok a leggyakrabban felmerülő kérdésekre az ingatlanügyletekkel és szolgáltatásainkkal kapcsolatban."
    : "Answers to frequently asked questions about real estate transactions and our services.";

  const displayItems = localItems.length > 0 ? localItems : faqItems;

  return (
    <Layout title={seoTitle} description={seoDescription} canonicalPath="/gyik">
      <section className="pt-28 pb-16 bg-light-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 data-editable="page.title" data-page={PAGE} className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-4">
              {faqTitle}
            </h1>
            <p data-editable="page.subtitle" data-page={PAGE} className="text-center text-muted-foreground font-body mb-10">
              {faqSubtitle}
            </p>

            <div className="space-y-3" data-editable="faq.items" data-page={PAGE}>
              {displayItems.map((item, index) => (
                <div
                  key={index}
                  className="group/faq bg-card rounded-lg shadow-sm border border-border overflow-hidden relative"
                >
                  {isAdmin && editingIndex === index ? (
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kérdés</label>
                        <input
                          type="text"
                          value={editQ}
                          onChange={(e) => setEditQ(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Kérdés szerkesztése"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Válasz</label>
                        <textarea
                          value={editA}
                          onChange={(e) => setEditA(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                          aria-label="Válasz szerkesztése"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                          aria-label="Mégse"
                        >
                          <X className="h-3 w-3 inline mr-1" />
                          Mégse
                        </button>
                        <button
                          type="button"
                          onClick={saveEditing}
                          disabled={saving}
                          className="px-3 py-1.5 text-sm text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                          aria-label="Mentés"
                        >
                          <Check className="h-3 w-3 inline mr-1" />
                          Mentés
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => toggle(index)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                        aria-expanded={openIndex === index}
                      >
                        <span className="font-heading font-semibold text-foreground pr-4">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`flex-shrink-0 text-primary transition-transform duration-200 ${
                            openIndex === index ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {openIndex === index && (
                        <div className="px-6 pb-5 pt-1">
                          <p className="font-body text-muted-foreground leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                      {isAdmin && (
                        <div className="invisible group-hover/faq:visible absolute top-2 right-12 flex gap-1 z-10">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); startEditing(index); }}
                            className="p-1.5 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
                            aria-label={`Kérdés ${index + 1} szerkesztése`}
                            title="Szerkesztés"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteItem(index); }}
                            className="p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-all"
                            aria-label={`Kérdés ${index + 1} törlése`}
                            title="Törlés"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={addItem}
                className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                aria-label="Új kérdés hozzáadása"
              >
                <Plus className="h-4 w-4" />
                Új kérdés
              </button>
            )}

            {saving && (
              <p className="text-xs text-blue-600 mt-2">Mentés...</p>
            )}
            {error && (
              <p className="text-xs text-red-600 mt-2">{error}</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FaqPage;
