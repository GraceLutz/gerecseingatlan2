import { useState, useEffect, useCallback } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { createBilingual } from "@/types/content";
import type { Lang } from "@/types/content";

interface EditTarget {
  blockKey: string;
  pagePath: string;
  content: string;
  tagName: string;
}

interface InlineEditPanelProps {
  target: EditTarget;
  lang: Lang;
  csrfToken: string | null;
  onSave: (blockKey: string, pagePath: string, content: string) => Promise<void>;
  onClose: () => void;
  onUnsavedChange: () => void;
}

type EditorMode = "text" | "list" | "faq" | "button";

interface FaqItem {
  q: string;
  a: string;
}

const LIST_BLOCK_KEYS = ["benefits", "values", "items", "notRightFit"];

function isListBlock(blockKey: string): boolean {
  return LIST_BLOCK_KEYS.some((k) => blockKey.includes(k));
}

function detectMode(blockKey: string, content: string, tagName: string): EditorMode {
  if (blockKey.includes("cta") && (blockKey.includes("label") || blockKey.includes("url"))) return "button";
  if (tagName === "a" || tagName === "button") return "button";

  try {
    const parsed = JSON.parse(content);
    const data = parsed.hu ?? parsed;
    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === "object" && "q" in data[0]) return "faq";
      if (isListBlock(blockKey)) return "list";
      return "text";
    }
  } catch { /* not JSON */ }

  if (blockKey.includes("faq")) return "faq";
  if (isListBlock(blockKey)) return "list";

  return "text";
}

function joinParagraphs(paragraphs: string[]): string {
  if (paragraphs.length === 0) return "";
  return paragraphs.map((p) => `<p>${p}</p>`).join("");
}

function parseBilingualArray<T>(raw: string): { hu: T[]; en: T[] } {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.hu || parsed.en) {
      return {
        hu: Array.isArray(parsed.hu) ? parsed.hu : [],
        en: Array.isArray(parsed.en) ? parsed.en : [],
      };
    }
    if (Array.isArray(parsed)) return { hu: parsed as T[], en: [] };
  } catch { /* non-JSON content, return empty arrays */ }
  return { hu: [], en: [] };
}

export default function InlineEditPanel({
  target,
  lang,
  csrfToken,
  onSave,
  onClose,
  onUnsavedChange,
}: InlineEditPanelProps) {
  const [activeLang, setActiveLang] = useState<Lang>(lang);
  const [huContent, setHuContent] = useState("");
  const [enContent, setEnContent] = useState("");
  const [huList, setHuList] = useState<string[]>([]);
  const [enList, setEnList] = useState<string[]>([]);
  const [huFaq, setHuFaq] = useState<FaqItem[]>([]);
  const [enFaq, setEnFaq] = useState<FaqItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<EditorMode>("text");

  useEffect(() => {
    setActiveLang(lang);
  }, [lang]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const encodedPath = target.pagePath === "/" ? "" : target.pagePath.slice(1);
    fetch(`/api/admin/content/page/${encodedPath}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const block = (data.blocks || []).find(
          (b: { blockKey: string }) => b.blockKey === target.blockKey
        );
        const rawContent = block?.content ?? target.content;
        const detectedMode = detectMode(target.blockKey, rawContent, target.tagName);
        setMode(detectedMode);

        if (detectedMode === "list") {
          const parsed = parseBilingualArray<string>(rawContent);
          setHuList(parsed.hu);
          setEnList(parsed.en);
        } else if (detectedMode === "faq") {
          const parsed = parseBilingualArray<FaqItem>(rawContent);
          setHuFaq(parsed.hu);
          setEnFaq(parsed.en);
        } else {
          if (block && block.contentType === "json") {
            try {
              const parsed = JSON.parse(block.content);
              const hu = Array.isArray(parsed.hu) ? joinParagraphs(parsed.hu) : (parsed.hu || "");
              const en = Array.isArray(parsed.en) ? joinParagraphs(parsed.en) : (parsed.en || "");
              setHuContent(hu);
              setEnContent(en);
            } catch {
              setHuContent(block.content);
              setEnContent("");
            }
          } else if (block) {
            setHuContent(block.content);
            setEnContent("");
          } else {
            setHuContent(target.content);
            setEnContent("");
          }
        }
      })
      .catch(() => {
        setHuContent(target.content);
        setEnContent("");
        setMode("text");
      })
      .finally(() => setLoading(false));
  }, [target.blockKey, target.pagePath, target.content, target.tagName]);

  const isShortText = target.tagName === "h1" || target.tagName === "h2" ||
    target.tagName === "h3" || target.tagName === "a" || target.tagName === "button" ||
    target.blockKey.includes("title") || target.blockKey.includes("cta") ||
    target.blockKey.includes("subtitle");

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let jsonContent: string;
      if (mode === "list") {
        jsonContent = JSON.stringify({ hu: huList, en: enList });
      } else if (mode === "faq") {
        jsonContent = JSON.stringify({ hu: huFaq, en: enFaq });
      } else {
        jsonContent = createBilingual(huContent, enContent);
      }
      await onSave(target.blockKey, target.pagePath, jsonContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mentési hiba");
    } finally {
      setSaving(false);
    }
  };

  const handleTextChange = (value: string) => {
    if (activeLang === "hu") setHuContent(value);
    else setEnContent(value);
    onUnsavedChange();
  };

  const currentTextValue = activeLang === "hu" ? huContent : enContent;
  const currentList = activeLang === "hu" ? huList : enList;
  const setCurrentList = activeLang === "hu" ? setHuList : setEnList;
  const currentFaq = activeLang === "hu" ? huFaq : enFaq;
  const setCurrentFaq = activeLang === "hu" ? setHuFaq : setEnFaq;

  const updateListItem = useCallback((index: number, value: string) => {
    setCurrentList((prev) => prev.map((item, i) => (i === index ? value : item)));
    onUnsavedChange();
  }, [setCurrentList, onUnsavedChange]);

  const addListItem = useCallback(() => {
    setCurrentList((prev) => [...prev, ""]);
    onUnsavedChange();
  }, [setCurrentList, onUnsavedChange]);

  const deleteListItem = useCallback((index: number) => {
    setCurrentList((prev) => prev.filter((_, i) => i !== index));
    onUnsavedChange();
  }, [setCurrentList, onUnsavedChange]);

  const updateFaqItem = useCallback((index: number, field: "q" | "a", value: string) => {
    setCurrentFaq((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    onUnsavedChange();
  }, [setCurrentFaq, onUnsavedChange]);

  const addFaqItem = useCallback(() => {
    setCurrentFaq((prev) => [...prev, { q: "", a: "" }]);
    onUnsavedChange();
  }, [setCurrentFaq, onUnsavedChange]);

  const deleteFaqItem = useCallback((index: number) => {
    setCurrentFaq((prev) => prev.filter((_, i) => i !== index));
    onUnsavedChange();
  }, [setCurrentFaq, onUnsavedChange]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: full-screen overlay on mobile, sidebar on desktop */}
      <div
        className="
          fixed inset-0 z-50 bg-white flex flex-col
          md:static md:z-auto md:w-80 md:border-l md:border-gray-200 md:flex-shrink-0 md:shadow-lg
          md:animate-in md:slide-in-from-right-5 md:duration-200
        "
        role="dialog"
        aria-label="Tartalom szerkesztése"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <code className="text-xs font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded break-all">
              {target.blockKey}
            </code>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{target.pagePath}</p>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">{mode}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-md ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Szerkesztő bezárása"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex border-b border-gray-200" role="tablist" aria-label="Nyelv választó">
          <button
            type="button"
            onClick={() => setActiveLang("hu")}
            role="tab"
            aria-selected={activeLang === "hu"}
            className={`flex-1 py-3 md:py-2 text-sm font-medium text-center border-b-2 transition-colors min-h-[44px] ${
              activeLang === "hu"
                ? "border-blue-500 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Magyar
          </button>
          <button
            type="button"
            onClick={() => setActiveLang("en")}
            role="tab"
            aria-selected={activeLang === "en"}
            className={`flex-1 py-3 md:py-2 text-sm font-medium text-center border-b-2 transition-colors min-h-[44px] ${
              activeLang === "en"
                ? "border-blue-500 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            English
          </button>
        </div>

        {/* Content editor */}
        <div className="flex-1 overflow-y-auto p-4" role="tabpanel">
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm" aria-live="polite">Betöltés...</div>
          ) : (
            <div className="space-y-3">
              {mode === "text" && (
                <>
                  {isShortText ? (
                    <Input
                      value={currentTextValue}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder={activeLang === "hu" ? "Magyar szöveg..." : "English text..."}
                      className="text-base md:text-sm min-h-[44px]"
                      aria-label={activeLang === "hu" ? "Magyar szöveg" : "English text"}
                    />
                  ) : (
                    <RichTextEditor
                      key={activeLang}
                      value={currentTextValue}
                      onChange={handleTextChange}
                      placeholder={activeLang === "hu" ? "Magyar szöveg..." : "English text..."}
                      mode="rich"
                    />
                  )}
                </>
              )}

              {mode === "button" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1" id="button-label-label">Felirat</label>
                    <Input
                      value={currentTextValue}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder={activeLang === "hu" ? "Gomb felirat..." : "Button label..."}
                      className="text-base md:text-sm min-h-[44px]"
                      aria-labelledby="button-label-label"
                    />
                  </div>
                </div>
              )}

              {mode === "list" && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">
                    {currentList.length} elem
                  </p>
                  {currentList.map((item, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <Input
                        value={item}
                        onChange={(e) => updateListItem(i, e.target.value)}
                        placeholder={`Elem ${i + 1}`}
                        className="text-base md:text-sm flex-1 min-h-[44px]"
                        aria-label={`Elem ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => deleteListItem(i)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-md shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={`Elem ${i + 1} törlése`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addListItem}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mt-1 py-2 min-h-[44px]"
                    aria-label="Új elem hozzáadása"
                  >
                    <Plus className="h-4 w-4" />
                    Új elem
                  </button>
                </div>
              )}

              {mode === "faq" && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500">
                    {currentFaq.length} kérdés-válasz pár
                  </p>
                  {currentFaq.map((item, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400 uppercase">#{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => deleteFaqItem(i)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`Kérdés ${i + 1} törlése`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Input
                        value={item.q}
                        onChange={(e) => updateFaqItem(i, "q", e.target.value)}
                        placeholder="Kérdés..."
                        className="text-base md:text-sm min-h-[44px]"
                        aria-label={`Kérdés ${i + 1}`}
                      />
                      <Textarea
                        value={item.a}
                        onChange={(e) => updateFaqItem(i, "a", e.target.value)}
                        placeholder="Válasz..."
                        className="text-base md:text-sm min-h-[5rem] resize-y"
                        aria-label={`Válasz ${i + 1}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mt-1 py-2 min-h-[44px]"
                    aria-label="Új kérdés hozzáadása"
                  >
                    <Plus className="h-4 w-4" />
                    Új kérdés
                  </button>
                </div>
              )}

              {/* Status indicators */}
              {mode === "text" && (
                <div className="flex items-center justify-between text-xs text-gray-500" aria-live="polite">
                  <span className={huContent ? "text-green-600" : "text-orange-500"}>
                    HU: {huContent ? `${huContent.length} kar.` : "üres"}
                  </span>
                  <span className={enContent ? "text-green-600" : "text-orange-500"}>
                    EN: {enContent ? `${enContent.length} chars` : "empty"}
                  </span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm" role="alert">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 bg-white safe-area-pb">
          <Button
            size="lg"
            variant="outline"
            onClick={onClose}
            className="flex-1 min-h-[48px] md:min-h-[40px] text-base md:text-sm"
            aria-label="Szerkesztés megszakítása"
          >
            Mégse
          </Button>
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 min-h-[48px] md:min-h-[40px] text-base md:text-sm"
            aria-label={saving ? "Mentés folyamatban..." : "Tartalom mentése"}
          >
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? "Mentés..." : "Mentés"}
          </Button>
        </div>
      </div>
    </>
  );
}
