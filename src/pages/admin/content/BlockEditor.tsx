import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, Trash2, Bold, Italic, Underline, Link, List, ListOrdered, Heading2, Heading3, Code, Eye, Maximize2, Minimize2 } from "lucide-react";

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
  } catch { /* non-JSON content, fall through */ }
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
  } catch { /* non-JSON content, fall through to heuristic */ }
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
  } catch { /* non-JSON content, return empty arrays */ }
  return { hu: [], en: [] };
}

const HTML_RE = /<[a-z][\s\S]*>/i;

function insertSnippet(textarea: HTMLTextAreaElement, before: string, after: string) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = before + (selected || "") + after;
  const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.value = newValue;
  const cursorPos = start + before.length + (selected ? selected.length : 0);
  textarea.setSelectionRange(cursorPos, cursorPos);
  textarea.focus();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

const SNIPPET_BUTTONS = [
  { label: "H2", title: "Címsor 2", before: "<h2>", after: "</h2>" },
  { label: "H3", title: "Címsor 3", before: "<h3>", after: "</h3>" },
  { label: "P", title: "Bekezdés", before: "<p>", after: "</p>" },
  { sep: true },
  { icon: "bold", title: "Félkövér", before: "<strong>", after: "</strong>" },
  { icon: "italic", title: "Dőlt", before: "<em>", after: "</em>" },
  { icon: "link", title: "Link", before: '<a href="">', after: "</a>" },
  { sep: true },
  { icon: "list", title: "Felsorolás", before: "<ul>\n  <li>", after: "</li>\n</ul>" },
  { icon: "listOrdered", title: "Számozott lista", before: "<ol>\n  <li>", after: "</li>\n</ol>" },
] as const;

function HtmlEditor({ value, onChange, placeholder, lang, fullscreen, onToggleFullscreen }: {
  value: string; onChange: (v: string) => void; placeholder: string; lang: string;
  fullscreen?: boolean; onToggleFullscreen?: () => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (editorRef.current && !sourceMode) {
      editorRef.current.innerHTML = value;
    }
  }, [sourceMode]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    handleInput();
    editorRef.current?.focus();
  }, [handleInput]);

  const handleLink = useCallback(() => {
    const url = window.prompt("Link URL:");
    if (url) exec("createLink", url);
  }, [exec]);

  const handleHeading = useCallback((tag: string) => {
    document.execCommand("formatBlock", false, tag);
    handleInput();
    editorRef.current?.focus();
  }, [handleInput]);

  const handleSnippet = useCallback((before: string, after: string) => {
    if (!sourceRef.current) return;
    insertSnippet(sourceRef.current, before, after);
    onChange(sourceRef.current.value);
  }, [onChange]);

  const iconMap: Record<string, React.ReactNode> = {
    bold: <Bold className="h-4 w-4" />,
    italic: <Italic className="h-4 w-4" />,
    link: <Link className="h-4 w-4" />,
    list: <List className="h-4 w-4" />,
    listOrdered: <ListOrdered className="h-4 w-4" />,
  };

  const btnCls = "p-1.5 hover:bg-gray-200 rounded min-w-[36px] min-h-[36px] flex items-center justify-center";

  const wysiwygToolbar = (
    <div className="flex flex-wrap gap-0.5 p-1 border-b border-gray-200 bg-gray-50" role="toolbar" aria-label="Formázás">
      <button type="button" onMouseDown={e => { e.preventDefault(); exec("bold"); }} className={btnCls} title="Félkövér"><Bold className="h-4 w-4" /></button>
      <button type="button" onMouseDown={e => { e.preventDefault(); exec("italic"); }} className={btnCls} title="Dőlt"><Italic className="h-4 w-4" /></button>
      <button type="button" onMouseDown={e => { e.preventDefault(); exec("underline"); }} className={btnCls} title="Aláhúzott"><Underline className="h-4 w-4" /></button>
      <span className="w-px bg-gray-300 mx-1 self-stretch" />
      <button type="button" onMouseDown={e => { e.preventDefault(); handleHeading("h2"); }} className={btnCls} title="Címsor 2"><Heading2 className="h-4 w-4" /></button>
      <button type="button" onMouseDown={e => { e.preventDefault(); handleHeading("h3"); }} className={btnCls} title="Címsor 3"><Heading3 className="h-4 w-4" /></button>
      <button type="button" onMouseDown={e => { e.preventDefault(); handleHeading("p"); }} className={`${btnCls} text-xs font-bold`} title="Bekezdés">P</button>
      <span className="w-px bg-gray-300 mx-1 self-stretch" />
      <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} className={btnCls} title="Felsorolás"><List className="h-4 w-4" /></button>
      <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertOrderedList"); }} className={btnCls} title="Számozott lista"><ListOrdered className="h-4 w-4" /></button>
      <button type="button" onMouseDown={e => { e.preventDefault(); handleLink(); }} className={btnCls} title="Link"><Link className="h-4 w-4" /></button>
      <span className="flex-1" />
      <button type="button" onClick={() => setSourceMode(true)} className={btnCls} title="HTML forrás"><Code className="h-4 w-4" /></button>
      {onToggleFullscreen && (
        <button type="button" onClick={onToggleFullscreen} className={btnCls} title={fullscreen ? "Kilépés" : "Megnagyobbítás"}>
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      )}
    </div>
  );

  const sourceToolbar = (
    <div className="flex flex-wrap gap-0.5 p-1 border-b border-gray-200 bg-gray-50" role="toolbar" aria-label="HTML beszúrás">
      {SNIPPET_BUTTONS.map((btn, i) => {
        if ("sep" in btn) return <span key={i} className="w-px bg-gray-300 mx-1 self-stretch" />;
        return (
          <button key={i} type="button" onClick={() => handleSnippet(btn.before, btn.after)} className={`${btnCls} ${btn.label ? "text-xs font-bold" : ""}`} title={btn.title}>
            {btn.icon ? iconMap[btn.icon] : btn.label}
          </button>
        );
      })}
      <span className="flex-1" />
      <button type="button" onClick={() => setShowPreview(!showPreview)} className={`${btnCls} ${showPreview ? "bg-blue-100 text-blue-700" : ""}`} title={showPreview ? "Előnézet elrejtése" : "Előnézet"}>
        <Eye className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => setSourceMode(false)} className={`${btnCls} bg-blue-100 text-blue-700`} title="Vizuális nézet">
        <Eye className="h-4 w-4" />
      </button>
      {onToggleFullscreen && (
        <button type="button" onClick={onToggleFullscreen} className={btnCls} title={fullscreen ? "Kilépés" : "Megnagyobbítás"}>
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      )}
    </div>
  );

  const editorHeight = fullscreen ? "flex-1" : "min-h-[14rem]";
  const previewHeight = fullscreen ? "max-h-[40vh]" : "max-h-[16rem]";

  if (sourceMode) {
    return (
      <div className={`border border-gray-300 rounded-md overflow-hidden flex flex-col ${fullscreen ? "h-full" : ""}`}>
        {sourceToolbar}
        <textarea
          ref={sourceRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${editorHeight} font-mono text-sm bg-white resize-y p-3 border-0 outline-none ${fullscreen ? "flex-1" : "min-h-[14rem]"}`}
          aria-label={`${lang === "hu" ? "Magyar" : "English"} HTML forrás`}
        />
        {showPreview && (
          <div className="border-t border-gray-200">
            <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-500 font-medium uppercase tracking-wide">Előnézet</div>
            <div
              className={`p-3 bg-white overflow-y-auto rich-content prose prose-sm max-w-none ${previewHeight}`}
              dangerouslySetInnerHTML={{ __html: value }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden flex flex-col ${fullscreen ? "h-full" : ""}`}>
      {wysiwygToolbar}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className={`p-3 bg-white text-sm focus:outline-none rich-content prose prose-sm max-w-none ${fullscreen ? "flex-1 overflow-y-auto" : "min-h-[14rem]"}`}
        style={fullscreen ? undefined : { overflowY: "auto", maxHeight: "28rem" }}
        data-placeholder={placeholder}
        role="textbox"
        aria-label={`${lang === "hu" ? "Magyar" : "English"} HTML szerkesztő`}
        aria-multiline="true"
      />
    </div>
  );
}

function FullscreenModal({ children, onClose, title, onSave, saving }: {
  children: React.ReactNode; onClose: () => void; title: string;
  onSave?: () => void; saving?: boolean;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", handleEsc); };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <div className="flex gap-2">
          {onSave && (
            <Button size="sm" onClick={onSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Mentés..." : "Mentés"}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-1" /> Bezárás
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function BlockEditor({ block, onSave, onCancel, saving }: BlockEditorProps) {
  const isBilingual = block.contentType === "json";
  const bilingual = isBilingual ? parseBilingual(block.content) : null;
  const arrayMode = isBilingual ? detectArrayMode(block.content, block.blockKey) : "text";

  const [activeLang, setActiveLang] = useState<"hu" | "en">("hu");
  const [huContent, setHuContent] = useState(bilingual?.hu ?? (isBilingual ? "" : block.content));
  const [enContent, setEnContent] = useState(bilingual?.en ?? "");
  const [plainContent, setPlainContent] = useState(!isBilingual ? block.content : "");

  const contentHasHtml = HTML_RE.test(huContent) || HTML_RE.test(enContent);
  const [htmlMode, setHtmlMode] = useState(contentHasHtml);
  const [fullscreen, setFullscreen] = useState(false);

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
      {/* Header: stacks vertically on mobile */}
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
                <Textarea
                  value={item.a}
                  onChange={(e) => updateFaqItem(i, "a", e.target.value)}
                  placeholder="Válasz..."
                  className="text-base md:text-sm min-h-[5rem] bg-white resize-y"
                  aria-label={`Válasz ${i + 1}`}
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
        <>
          <div style={htmlMode && !isShortText ? { minWidth: "600px" } : undefined}>
            <div className="flex items-center justify-between mb-2 gap-2">
              {langTabs}
              {!isShortText && (
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={htmlMode}
                      onChange={(e) => setHtmlMode(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    HTML
                  </label>
                  {htmlMode && (
                    <button
                      type="button"
                      onClick={() => setFullscreen(true)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      Megnagyobbítás
                    </button>
                  )}
                </div>
              )}
            </div>
            <div role="tabpanel">
              {activeLang === "hu" ? (
                isShortText ? (
                  <Input
                    value={huContent}
                    onChange={(e) => setHuContent(e.target.value)}
                    placeholder="Magyar tartalom..."
                    className="bg-white text-base md:text-sm min-h-[44px]"
                    aria-label="Magyar tartalom"
                  />
                ) : htmlMode ? (
                  <HtmlEditor
                    key="hu"
                    value={huContent}
                    onChange={setHuContent}
                    placeholder="Magyar tartalom..."
                    lang="hu"
                    onToggleFullscreen={() => setFullscreen(!fullscreen)}
                  />
                ) : (
                  <Textarea
                    value={huContent}
                    onChange={(e) => setHuContent(e.target.value)}
                    placeholder="Magyar tartalom..."
                    className="min-h-[8rem] font-mono text-base md:text-sm bg-white resize-y"
                    aria-label="Magyar tartalom"
                  />
                )
              ) : isShortText ? (
                <Input
                  value={enContent}
                  onChange={(e) => setEnContent(e.target.value)}
                  placeholder="English content..."
                  className="bg-white text-base md:text-sm min-h-[44px]"
                  aria-label="English content"
                />
              ) : htmlMode ? (
                <HtmlEditor
                  key="en"
                  value={enContent}
                  onChange={setEnContent}
                  placeholder="English content..."
                  lang="en"
                  onToggleFullscreen={() => setFullscreen(!fullscreen)}
                />
              ) : (
                <Textarea
                  value={enContent}
                  onChange={(e) => setEnContent(e.target.value)}
                  placeholder="English content..."
                  className="min-h-[8rem] font-mono text-base md:text-sm bg-white resize-y"
                  aria-label="English content"
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

          {fullscreen && htmlMode && (
            <FullscreenModal
              onClose={() => setFullscreen(false)}
              title={`${block.blockKey} — ${activeLang === "hu" ? "Magyar" : "English"} HTML`}
              onSave={handleSave}
              saving={saving}
            >
              <div className="h-full flex flex-col">
                <div className="flex gap-1 mb-3 shrink-0" role="tablist">
                  <button type="button" onClick={() => setActiveLang("hu")} className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 ${activeLang === "hu" ? "border-blue-500 text-blue-700 bg-white" : "border-transparent text-gray-500"}`}>Magyar</button>
                  <button type="button" onClick={() => setActiveLang("en")} className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 ${activeLang === "en" ? "border-blue-500 text-blue-700 bg-white" : "border-transparent text-gray-500"}`}>English</button>
                </div>
                <div className="flex-1 min-h-0">
                  {activeLang === "hu" ? (
                    <HtmlEditor
                      key="hu-fs"
                      value={huContent}
                      onChange={setHuContent}
                      placeholder="Magyar tartalom..."
                      lang="hu"
                      fullscreen
                      onToggleFullscreen={() => setFullscreen(false)}
                    />
                  ) : (
                    <HtmlEditor
                      key="en-fs"
                      value={enContent}
                      onChange={setEnContent}
                      placeholder="English content..."
                      lang="en"
                      fullscreen
                      onToggleFullscreen={() => setFullscreen(false)}
                    />
                  )}
                </div>
              </div>
            </FullscreenModal>
          )}
        </>
      ) : (
        isShortText ? (
          <Input
            value={plainContent}
            onChange={(e) => setPlainContent(e.target.value)}
            placeholder="Tartalom..."
            className="bg-white text-base md:text-sm min-h-[44px]"
            aria-label="Tartalom"
          />
        ) : (
          <Textarea
            value={plainContent}
            onChange={(e) => setPlainContent(e.target.value)}
            placeholder="Tartalom..."
            className="min-h-[10rem] font-mono text-base md:text-sm bg-white resize-y"
            aria-label="Tartalom"
          />
        )
      )}
    </div>
  );
}
