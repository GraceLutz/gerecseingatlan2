import { useState, useEffect, useCallback } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditTarget {
  blockKey: string;
  pagePath: string;
  content: string;
  tagName: string;
}

interface InlineEditPanelProps {
  target: EditTarget;
  lang: "hu" | "en";
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

function detectMode(blockKey: string, content: string, tagName: string): EditorMode {
  if (blockKey.includes("cta") && (blockKey.includes("label") || blockKey.includes("url"))) return "button";
  if (tagName === "a" || tagName === "button") return "button";

  try {
    const parsed = JSON.parse(content);
    const data = parsed.hu ?? parsed;
    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === "object" && "q" in data[0]) return "faq";
      return "list";
    }
  } catch {}

  if (blockKey.includes("items") || blockKey.includes("benefits")) return "list";
  if (blockKey.includes("faq")) return "faq";

  return "text";
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
  } catch {}
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
  const [activeLang, setActiveLang] = useState<"hu" | "en">(lang);
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
              setHuContent(parsed.hu || "");
              setEnContent(parsed.en || "");
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
        jsonContent = JSON.stringify({ hu: huContent, en: enContent });
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
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col flex-shrink-0 shadow-lg animate-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <code className="text-xs font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
            {target.blockKey}
          </code>
          <p className="text-xs text-gray-400 mt-0.5">{target.pagePath}</p>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">{mode}</span>
        </div>
        <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Bezárás">
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Language tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveLang("hu")}
          className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
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
          className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${
            activeLang === "en"
              ? "border-blue-500 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          English
        </button>
      </div>

      {/* Content editor */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Betöltés...</div>
        ) : (
          <div className="space-y-3">
            {mode === "text" && (
              <>
                {isShortText ? (
                  <Input
                    value={currentTextValue}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder={activeLang === "hu" ? "Magyar szöveg..." : "English text..."}
                    className="text-sm"
                  />
                ) : (
                  <Textarea
                    value={currentTextValue}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder={activeLang === "hu" ? "Magyar szöveg..." : "English text..."}
                    className="min-h-[10rem] text-sm resize-y"
                  />
                )}
              </>
            )}

            {mode === "button" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Felirat</label>
                  <Input
                    value={currentTextValue}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder={activeLang === "hu" ? "Gomb felirat..." : "Button label..."}
                    className="text-sm"
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
                  <div key={i} className="flex gap-1 items-start">
                    <Input
                      value={item}
                      onChange={(e) => updateListItem(i, e.target.value)}
                      placeholder={`Elem ${i + 1}`}
                      className="text-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => deleteListItem(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded shrink-0"
                      aria-label={`Elem ${i + 1} törlése`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addListItem}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
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
                  <div key={i} className="border border-gray-200 rounded p-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-gray-400 uppercase">#{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => deleteFaqItem(i)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        aria-label={`Kérdés ${i + 1} törlése`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <Input
                      value={item.q}
                      onChange={(e) => updateFaqItem(i, "q", e.target.value)}
                      placeholder="Kérdés..."
                      className="text-sm"
                    />
                    <Textarea
                      value={item.a}
                      onChange={(e) => updateFaqItem(i, "a", e.target.value)}
                      placeholder="Válasz..."
                      className="text-sm min-h-[4rem] resize-y"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFaqItem}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Új kérdés
                </button>
              </div>
            )}

            {/* Status indicators */}
            {mode === "text" && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className={huContent ? "text-green-600" : "text-orange-500"}>
                  HU: {huContent ? `${huContent.length} kar.` : "üres"}
                </span>
                <span className={enContent ? "text-green-600" : "text-orange-500"}>
                  EN: {enContent ? `${enContent.length} chars` : "empty"}
                </span>
              </div>
            )}

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200">
        <Button size="sm" variant="outline" onClick={onClose} className="flex-1">
          Mégse
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || loading} className="flex-1">
          <Save className="h-3.5 w-3.5 mr-1" />
          {saving ? "Mentés..." : "Mentés"}
        </Button>
      </div>
    </div>
  );
}
