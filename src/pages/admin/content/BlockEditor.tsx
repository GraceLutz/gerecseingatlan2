import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, Trash2 } from "lucide-react";

interface BilingualContent {
  hu: string;
  en: string;
}

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

function parseBilingual(content: string): BilingualContent | null {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null && ("hu" in parsed || "en" in parsed)) {
      return { hu: parsed.hu ?? "", en: parsed.en ?? "" };
    }
  } catch {}
  return null;
}

function detectArrayMode(content: string, blockKey: string): EditorMode {
  try {
    const parsed = JSON.parse(content);
    const data = parsed.hu ?? parsed;
    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === "object" && "q" in data[0]) return "faq";
      return "list";
    }
  } catch {}
  if (blockKey.includes("faq") || blockKey.includes("items")) {
    if (blockKey.includes("faq")) return "faq";
    return "list";
  }
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

export default function BlockEditor({ block, onSave, onCancel, saving }: BlockEditorProps) {
  const isBilingual = block.contentType === "json";
  const bilingual = isBilingual ? parseBilingual(block.content) : null;
  const arrayMode = isBilingual ? detectArrayMode(block.content, block.blockKey) : "text";

  const [activeLang, setActiveLang] = useState<"hu" | "en">("hu");
  const [huContent, setHuContent] = useState(bilingual?.hu ?? (isBilingual ? "" : block.content));
  const [enContent, setEnContent] = useState(bilingual?.en ?? "");
  const [plainContent, setPlainContent] = useState(!isBilingual ? block.content : "");

  const initList = arrayMode === "list" ? parseBilingualArray<string>(block.content) : { hu: [], en: [] };
  const [huList, setHuList] = useState<string[]>(initList.hu);
  const [enList, setEnList] = useState<string[]>(initList.en);

  const initFaq = arrayMode === "faq" ? parseBilingualArray<FaqItem>(block.content) : { hu: [], en: [] };
  const [huFaq, setHuFaq] = useState<FaqItem[]>(initFaq.hu);
  const [enFaq, setEnFaq] = useState<FaqItem[]>(initFaq.en);

  const handleSave = () => {
    if (arrayMode === "list") {
      const json = JSON.stringify({ hu: huList, en: enList });
      onSave(json, "json");
    } else if (arrayMode === "faq") {
      const json = JSON.stringify({ hu: huFaq, en: enFaq });
      onSave(json, "json");
    } else if (isBilingual) {
      const json = JSON.stringify({ hu: huContent, en: enContent });
      onSave(json, "json");
    } else {
      onSave(plainContent, block.contentType);
    }
  };

  const isShortText = block.blockKey.includes("title") ||
    block.blockKey.includes("cta") ||
    block.blockKey.includes("subtitle") ||
    block.blockKey.includes("placeholder") ||
    block.blockKey.includes("submit") ||
    block.blockKey.includes("name") ||
    block.blockKey.includes("email");

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
    <div className="flex gap-1 mb-2">
      <button
        type="button"
        onClick={() => setActiveLang("hu")}
        className={`px-3 py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors ${
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
        className={`px-3 py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors ${
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
    <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-blue-700">
            {block.blockKey}
          </code>
          <Badge variant="secondary">{block.contentType}</Badge>
          {arrayMode !== "text" && (
            <Badge variant="outline" className="text-[10px]">{arrayMode}</Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
            <X className="h-4 w-4 mr-1" /> Mégse
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Mentés..." : "Mentés"}
          </Button>
        </div>
      </div>

      {arrayMode === "list" && isBilingual ? (
        <div>
          {langTabs}
          <div className="space-y-2">
            <p className="text-xs text-gray-500">{currentList.length} elem</p>
            {currentList.map((item, i) => (
              <div key={i} className="flex gap-1 items-center">
                <Input
                  value={item}
                  onChange={(e) => updateListItem(i, e.target.value)}
                  placeholder={`Elem ${i + 1}`}
                  className="bg-white text-sm flex-1"
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
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Új elem
            </button>
          </div>
        </div>
      ) : arrayMode === "faq" && isBilingual ? (
        <div>
          {langTabs}
          <div className="space-y-3">
            <p className="text-xs text-gray-500">{currentFaq.length} kérdés-válasz pár</p>
            {currentFaq.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded p-2 bg-white space-y-1.5">
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
                  className="bg-white text-sm"
                />
                <Textarea
                  value={item.a}
                  onChange={(e) => updateFaqItem(i, "a", e.target.value)}
                  placeholder="Válasz..."
                  className="text-sm min-h-[4rem] bg-white resize-y"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addFaqItem}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Új kérdés
            </button>
          </div>
        </div>
      ) : isBilingual ? (
        <div>
          {langTabs}
          {activeLang === "hu" ? (
            isShortText ? (
              <Input
                value={huContent}
                onChange={(e) => setHuContent(e.target.value)}
                placeholder="Magyar tartalom..."
                className="bg-white"
              />
            ) : (
              <Textarea
                value={huContent}
                onChange={(e) => setHuContent(e.target.value)}
                placeholder="Magyar tartalom..."
                className="min-h-[8rem] font-mono text-sm bg-white resize-y"
              />
            )
          ) : isShortText ? (
            <Input
              value={enContent}
              onChange={(e) => setEnContent(e.target.value)}
              placeholder="English content..."
              className="bg-white"
            />
          ) : (
            <Textarea
              value={enContent}
              onChange={(e) => setEnContent(e.target.value)}
              placeholder="English content..."
              className="min-h-[8rem] font-mono text-sm bg-white resize-y"
            />
          )}

          <div className="flex gap-2 mt-2 text-xs text-gray-500">
            <span className={huContent ? "text-green-600" : "text-orange-500"}>
              HU: {huContent ? `${huContent.length} karakter` : "üres"}
            </span>
            <span className={enContent ? "text-green-600" : "text-orange-500"}>
              EN: {enContent ? `${enContent.length} chars` : "empty"}
            </span>
          </div>
        </div>
      ) : (
        isShortText ? (
          <Input
            value={plainContent}
            onChange={(e) => setPlainContent(e.target.value)}
            placeholder="Tartalom..."
            className="bg-white"
          />
        ) : (
          <Textarea
            value={plainContent}
            onChange={(e) => setPlainContent(e.target.value)}
            placeholder="Tartalom..."
            className="min-h-[10rem] font-mono text-sm bg-white resize-y"
          />
        )
      )}
    </div>
  );
}
