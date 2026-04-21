import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText, Home, Info, Building2, Users, Mail, HelpCircle,
  Briefcase, MessageSquare, Monitor, Tablet, Smartphone,
  Save, Eye, Pencil, X, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_REGISTRY } from "./content/pageRegistry";
import InlineEditPanel from "./content/InlineEditPanel";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Info, Building2, Users, Mail, HelpCircle, Briefcase, MessageSquare, FileText,
};

type DeviceMode = "desktop" | "tablet" | "mobile";
type EditorMode = "edit" | "preview";

interface EditTarget {
  blockKey: string;
  pagePath: string;
  content: string;
  tagName: string;
}

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};


export default function ContentPage() {
  const { csrfToken } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [selectedPath, setSelectedPath] = useState("/");
  const [iframeLang, setIframeLang] = useState<"hu" | "en">("hu");
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [mode, setMode] = useState<EditorMode>("edit");
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    document.title = "Vizuális szerkesztő | Gerecse Ingatlan Admin";
  }, []);

  const getIframeUrl = useCallback((path: string) => {
    const langPrefix = iframeLang === "en" ? "/en" : "";
    const base = path === "/" ? "/" : path;
    return `${langPrefix}${base}?editMode=${mode === "edit" ? "1" : "0"}`;
  }, [iframeLang, mode]);

  useEffect(() => {
    setIframeReady(false);
    setEditTarget(null);
  }, [selectedPath, iframeLang, mode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data.type !== "string") return;

      switch (event.data.type) {
        case "ve:ready":
          setIframeReady(true);
          break;
        case "ve:element-clicked":
          if (mode === "edit") {
            setEditTarget(event.data.payload);
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [mode]);

  const handleSave = async (blockKey: string, pagePath: string, content: string) => {
    const res = await fetch("/api/admin/content/by-path", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ pagePath, blockKey, content, contentType: "json" }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Mentés sikertelen (${res.status})`);
    }

    // Update the iframe content live
    iframeRef.current?.contentWindow?.postMessage({
      type: "ve:update-content",
      payload: { blockKey, pagePath, content: getLangContent(content, iframeLang) },
    }, "*");

    setHasUnsaved(false);
  };

  const handleClose = () => {
    setEditTarget(null);
    iframeRef.current?.contentWindow?.postMessage({ type: "ve:deselect" }, "*");
  };

  const navigateIframe = (path: string) => {
    setSelectedPath(path);
  };

  const allPages = PAGE_REGISTRY;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar - Page list */}
      <aside className="w-56 border-r border-gray-200 bg-gray-50/50 overflow-y-auto flex-shrink-0">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Oldalak</h2>
        </div>
        <nav className="p-2 space-y-0.5">
          {allPages.map((page) => {
            const Icon = ICON_MAP[page.icon] || FileText;
            const isActive = selectedPath === page.path;
            return (
              <button
                key={page.path}
                type="button"
                onClick={() => navigateIframe(page.path)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                  isActive ? "bg-blue-100 text-blue-800 font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1 truncate text-xs">{page.nameHu}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setIframeLang("hu")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  iframeLang === "hu" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                HU
              </button>
              <button
                type="button"
                onClick={() => setIframeLang("en")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  iframeLang === "en" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                EN
              </button>
            </div>

            {/* Device preview */}
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`p-1.5 transition-colors ${
                    device === d ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  title={d}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            {/* Edit/Preview toggle */}
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium transition-colors ${
                  mode === "edit" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Pencil className="h-3 w-3" /> Szerkesztés
              </button>
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium transition-colors ${
                  mode === "preview" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Eye className="h-3 w-3" /> Előnézet
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsaved && (
              <span className="text-xs text-orange-600 font-medium">Mentetlen módosítások</span>
            )}
            <a
              href="/admin/tartalom-lista"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-3 w-3" /> Lista nézet
            </a>
          </div>
        </div>

        {/* Iframe + Edit panel container */}
        <div className="flex-1 flex overflow-hidden bg-gray-100">
          {/* Iframe container */}
          <div className="flex-1 flex items-start justify-center p-4 overflow-auto">
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
              style={{
                width: DEVICE_WIDTHS[device],
                maxWidth: "100%",
                height: device === "desktop" ? "100%" : "auto",
                minHeight: device !== "desktop" ? "600px" : undefined,
              }}
            >
              <iframe
                ref={iframeRef}
                src={getIframeUrl(selectedPath)}
                className="w-full h-full border-0"
                style={{ minHeight: "calc(100vh - 10rem)" }}
                title="Visual Editor"
              />
            </div>
          </div>

          {/* Inline edit panel (slides in from the right) */}
          {editTarget && (
            <InlineEditPanel
              target={editTarget}
              lang={iframeLang}
              csrfToken={csrfToken}
              onSave={handleSave}
              onClose={handleClose}
              onUnsavedChange={() => setHasUnsaved(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function getLangContent(jsonContent: string, lang: "hu" | "en"): string {
  try {
    const parsed = JSON.parse(jsonContent);
    return parsed[lang] ?? parsed["hu"] ?? jsonContent;
  } catch {
    return jsonContent;
  }
}
