import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { parseBilingual, createBilingual } from "@/types/content";
import type { Lang, BilingualContent } from "@/types/content";

interface FaqItem {
  q: string;
  a: string;
}

interface BlockEditorProps {
  block: {
    id: string;
    blockKey: string;
    content: string;
    contentType: string;
  };
  onSave: (content: string, contentType: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

type EditorMode = "text" | "list" | "faq";

/**
 * Lenient bilingual parser for the editor — handles partial content where
 * only one language may be present, unlike the strict shared parseBilingual.
 */
function parseBilingualLenient(content: string): BilingualContent | null {
  const strict = parseBilingual(content);
  if (strict) return strict;
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) &&
        ("hu" in parsed || "en" in parsed)) {
      return { hu: String(parsed.hu ?? ""), en: String(parsed.en ?? "") };
    }
  } catch { /* not valid JSON */ }
  return null;
}

/** Keys that should always use the list editor (genuinely list-like data). */
const LIST_BLOCK_KEYS = ["benefits", "values", "items", "notRightFit"];

function isListBlock(blockKey: string): boolean {
  return LIST_BLOCK_KEYS.some((k) => blockKey.includes(k));
}

function detectArrayMode(content: string, blockKey: string): EditorMode {
  try {
    const parsed = JSON.parse(content);
    const data = parsed.hu ?? parsed;
    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === "object" && "q" in data[0]) return "faq";
      if (isListBlock(blockKey)) return "list";
      // Plain string arrays (paragraphs, descriptions) → single rich text editor
      return "text";
    }
  } catch { /* not JSON */ }
  if (blockKey.includes("faq")) return "faq";
  if (isListBlock(blockKey)) return "list";
  return "text";
}

/**
 * Join an array of paragraph strings into a single HTML string
 * for use in the TipTap rich text editor.
 */
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
  } catch { /* not JSON */ }
  return { hu: [], en: [] };
}

const SHORT_TEXT_KEYS = ["title", "cta", "subtitle", "placeholder", "submit", "name", "email", "label", "heading"];

function isShortTextField(blockKey: string): boolean {
  return SHORT_TEXT_KEYS.some((k) => blockKey.includes(k));
}

/**
 * Initialize bilingual text content — handles both string values and
 * paragraph arrays (joining them into HTML for the TipTap editor).
 */
function initBilingualText(content: string): { hu: string; en: string } {
  const bilingual = parseBilingualLenient(content);
  if (bilingual) return bilingual;
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      const hu = Array.isArray(parsed.hu) ? joinParagraphs(parsed.hu) : String(parsed.hu ?? "");
      const en = Array.isArray(parsed.en) ? joinParagraphs(parsed.en) : String(parsed.en ?? "");
      return { hu, en };
    }
  } catch { /* not JSON */ }
  return { hu: content, en: "" };
}

export default function BlockEditor({ block, onSave, onCancel, saving }: BlockEditorProps) {
  const isBilingual = block.contentType === "json";
  const arrayMode = isBilingual ? detectArrayMode(block.content, block.blockKey) : "text";
  const initText = isBilingual && arrayMode === "text" ? initBilingualText(block.content) : null;

  const [activeLang, setActiveLang] = useState<Lang>("hu");
  const [huContent, setHuContent] = useState(initText?.hu ?? (isBilingual ? "" : block.content));
  const [enContent, setEnContent] = useState(initText?.en ?? "");
  const [plainContent, setPlainContent] = useState(!isBilingual ? block.content : "");

  const initList = arrayMode === "list" ? parseBilingualArray<string>(block.content) : { hu: [], en: [] };
  const [huList, setHuList] = useState<string[]>(initList.hu);
  const [enList, setEnList] = useState<string[]>(initList.en);

  const initFaq = arrayMode === "faq" ? parseBilingualArray<FaqItem>(block.content) : { hu: [], en: [] };
  const [huFaq, setHuFaq] = useState<FaqItem[]>(initFaq.hu);
  const [enFaq, setEnFaq] = useState<FaqItem[]>(initFaq.en);

  const handleSave = () => {
    if (arrayMode === "list") {
      onSave(JSON.stringify({ hu: huList, en: enList }), "json");
    } else if (arrayMode === "faq") {
      onSave(JSON.stringify({ hu: huFaq, en: enFaq }), "json");
    } else if (isBilingual) {
      onSave(createBilingual(huContent, enContent), "json");
    } else {
      onSave(plainContent, block.contentType);
    }
  };

  const isShort = isShortTextField(block.blockKey);

  const currentList = activeLang === "hu" ? huList : enList;
  const setCurrentList = activeLang === "hu" ? setHuList : setEnList;
  const currentFaq = activeLang === "hu" ? huFaq : enFaq;
  const setCurrentFaq = activeLang === "hu" ? setHuFaq : setEnFaq;

  const updateListItem = useCallback((index: number, value: string) => {
    setCurrentList((prev) => prev.map((item, i) => (i === index ? value : item)));
  }, [setCurrentList]);

  const addListItem = useCallback(() => {
    setCurrentList((prev) => [...prev, ""]);
  }, [setCurrentList]);

  const deleteListItem = useCallback((index: number) => {
    setCurrentList((prev) => prev.filter((_, i) => i !== index));
  }, [setCurrentList]);

  const updateFaqItem = useCallback((index: number, field: "q" | "a", value: string) => {
    setCurrentFaq((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }, [setCurrentFaq]);

  const addFaqItem = useCallback(() => {
    setCurrentFaq((prev) => [...prev, { q: "", a: "" }]);
  }, [setCurrentFaq]);

  const deleteFaqItem = useCallback((index: number) => {
    setCurrentFaq((prev) => prev.filter((_, i) => i !== index));
  }, [setCurrentFaq]);

  const langTabs = (
    <div className="flex gap-1 mb-2" role="tablist" aria-label="Nyelv választó">
      <button
        type="button"
        onClick={() => setActiveLang("hu")}
        role="tab"
        aria-selected={activeLang === "hu"}
        className={`px-3 py-2.5 md:py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors min-h-[44px] md:min-h-0 ${
          activeLang === "hu"
            ? "border-blue-500 text-blue-700 bg-white"
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
        className={`px-3 py-2.5 md:py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors min-h-[44px] md:min-h-0 ${
          activeLang === "en"
            ? "border-blue-500 text-blue-700 bg-white"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        English
      </button>
    </div>
  );

  return (
    <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-3 md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-blue-700 break-all">
            {block.blockKey}
          </code>
          <Badge variant="secondary">{block.contentType}</Badge>
          {arrayMode !== "text" && (
            <Badge variant="outline" className="text-[10px]">{arrayMode}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="default"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
            className="min-h-[44px] px-3"
            aria-label="Szerkesztés megszakítása"
          >
            <X className="h-4 w-4 mr-1" /> Mégse
          </Button>
          <Button
            size="default"
            onClick={handleSave}
            disabled={saving}
            className="min-h-[44px] px-3"
            aria-label={saving ? "Mentés folyamatban..." : "Tartalom mentése"}
          >
            <Save className="h-4 w-4 mr-1" /> {saving ? "Mentés..." : "Mentés"}
          </Button>
        </div>
      </div>

      {arrayMode === "list" && isBilingual ? (
        <div>
          {langTabs}
          <div className="space-y-2" role="tabpanel">
            <p className="text-xs text-gray-500">{currentList.length} elem</p>
            {currentList.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={item}
                  onChange={(e) => updateListItem(i, e.target.value)}
                  placeholder={`Elem ${i + 1}`}
                  className="bg-white text-base md:text-sm flex-1 min-h-[44px]"
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
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 py-2 min-h-[44px]"
              aria-label="Új elem hozzáadása"
            >
              <Plus className="h-4 w-4" />
              Új elem
            </button>
          </div>
        </div>
      ) : arrayMode === "faq" && isBilingual ? (
        <div>
          {langTabs}
          <div className="space-y-3" role="tabpanel">
            <p className="text-xs text-gray-500">{currentFaq.length} kérdés-válasz pár</p>
            {currentFaq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 bg-white space-y-2">
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
                  className="bg-white text-base md:text-sm min-h-[44px]"
                  aria-label={`Kérdés ${i + 1}`}
                />
                <RichTextEditor
                  value={item.a}
                  onChange={(html) => updateFaqItem(i, "a", html)}
                  placeholder="Válasz..."
                  mode="plain"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addFaqItem}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 py-2 min-h-[44px]"
              aria-label="Új kérdés hozzáadása"
            >
              <Plus className="h-4 w-4" />
              Új kérdés
            </button>
          </div>
        </div>
      ) : isBilingual ? (
        <div>
          {langTabs}
          <div role="tabpanel">
            {activeLang === "hu" ? (
              isShort ? (
                <Input
                  value={huContent}
                  onChange={(e) => setHuContent(e.target.value)}
                  placeholder="Magyar tartalom..."
                  className="bg-white text-base md:text-sm min-h-[44px]"
                  aria-label="Magyar tartalom"
                />
              ) : (
                <RichTextEditor
                  key="hu"
                  value={huContent}
                  onChange={setHuContent}
                  placeholder="Magyar tartalom..."
                  mode="rich"
                />
              )
            ) : isShort ? (
              <Input
                value={enContent}
                onChange={(e) => setEnContent(e.target.value)}
                placeholder="English content..."
                className="bg-white text-base md:text-sm min-h-[44px]"
                aria-label="English content"
              />
            ) : (
              <RichTextEditor
                key="en"
                value={enContent}
                onChange={setEnContent}
                placeholder="English content..."
                mode="rich"
              />
            )}
          </div>

          <div className="flex gap-2 mt-2 text-xs text-gray-500" aria-live="polite">
            <span className={huContent ? "text-green-600" : "text-orange-500"}>
              HU: {huContent ? `${huContent.length} karakter` : "üres"}
            </span>
            <span className={enContent ? "text-green-600" : "text-orange-500"}>
              EN: {enContent ? `${enContent.length} chars` : "empty"}
            </span>
          </div>
        </div>
      ) : (
        isShort ? (
          <Input
            value={plainContent}
            onChange={(e) => setPlainContent(e.target.value)}
            placeholder="Tartalom..."
            className="bg-white text-base md:text-sm min-h-[44px]"
            aria-label="Tartalom"
          />
        ) : (
          <RichTextEditor
            value={plainContent}
            onChange={setPlainContent}
            placeholder="Tartalom..."
            mode="rich"
          />
        )
      )}
    </div>
  );
}
