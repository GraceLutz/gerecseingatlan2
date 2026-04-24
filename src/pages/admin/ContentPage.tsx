import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText, Home, Info, Building2, Users, Mail, HelpCircle,
  Briefcase, MessageSquare, Monitor, Tablet, Smartphone,
  Eye, Pencil, X, ArrowLeft, Menu,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      if (event.origin !== window.location.origin) return;
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

    iframeRef.current?.contentWindow?.postMessage({
      type: "ve:update-content",
      payload: { blockKey, pagePath, content: getLangContent(content, iframeLang) },
    }, window.location.origin);

    setHasUnsaved(false);
  };

  const handleClose = () => {
    setEditTarget(null);
    iframeRef.current?.contentWindow?.postMessage({ type: "ve:deselect" }, window.location.origin);
  };

  const navigateIframe = (path: string) => {
    setSelectedPath(path);
    setSidebarOpen(false);
  };

  const allPages = PAGE_REGISTRY;
  const selectedPageName = allPages.find((p) => p.path === selectedPath)?.nameHu ?? "Oldal";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Page list */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 border-r border-gray-200 bg-gray-50/95 backdrop-blur
          overflow-y-auto flex-shrink-0 transition-transform duration-200
          md:static md:z-auto md:w-56 md:translate-x-0 md:backdrop-blur-none md:bg-gray-50/50
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="navigation"
        aria-label="Oldal navigáció"
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Oldalak</h2>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-2 -mr-1 hover:bg-gray-100 rounded-md md:hidden"
            aria-label="Oldalsáv bezárása"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
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
                className={`w-full flex items-center gap-2 px-3 py-2.5 md:py-2 rounded-md text-left text-sm transition-colors min-h-[44px] md:min-h-0 ${
                  isActive ? "bg-blue-100 text-blue-800 font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4 md:h-3.5 md:w-3.5 flex-shrink-0" />
                <span className="flex-1 truncate text-sm md:text-xs">{page.nameHu}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white flex-shrink-0">
          {/* Mobile: menu button + page name */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 hover:bg-gray-100 rounded-md md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Oldalak menü megnyitása"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700 md:hidden truncate max-w-[120px]">
            {selectedPageName}
          </span>

          <div className="flex items-center gap-2 flex-wrap flex-1 md:flex-none">
            {/* Language toggle */}
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setIframeLang("hu")}
                className={`px-3 py-2 md:py-1 text-xs font-medium transition-colors min-h-[44px] md:min-h-0 min-w-[44px] ${
                  iframeLang === "hu" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                aria-label="Magyar nyelv"
                aria-pressed={iframeLang === "hu"}
              >
                HU
              </button>
              <button
                type="button"
                onClick={() => setIframeLang("en")}
                className={`px-3 py-2 md:py-1 text-xs font-medium transition-colors min-h-[44px] md:min-h-0 min-w-[44px] ${
                  iframeLang === "en" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                aria-label="English language"
                aria-pressed={iframeLang === "en"}
              >
                EN
              </button>
            </div>

            {/* Device preview - hidden on mobile since they're already on a small screen */}
            <div className="hidden md:flex rounded-md border border-gray-300 overflow-hidden">
              {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`p-2 md:p-1.5 transition-colors min-h-[44px] md:min-h-0 min-w-[44px] md:min-w-0 ${
                    device === d ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                  aria-label={`${d} nézet`}
                  aria-pressed={device === d}
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
                className={`flex items-center gap-1 px-3 py-2 md:py-1 text-xs font-medium transition-colors min-h-[44px] md:min-h-0 ${
                  mode === "edit" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                aria-label="Szerkesztés mód"
                aria-pressed={mode === "edit"}
              >
                <Pencil className="h-3.5 w-3.5 md:h-3 md:w-3" />
                <span className="hidden sm:inline">Szerkesztés</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`flex items-center gap-1 px-3 py-2 md:py-1 text-xs font-medium transition-colors min-h-[44px] md:min-h-0 ${
                  mode === "preview" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                aria-label="Előnézet mód"
                aria-pressed={mode === "preview"}
              >
                <Eye className="h-3.5 w-3.5 md:h-3 md:w-3" />
                <span className="hidden sm:inline">Előnézet</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {hasUnsaved && (
              <span className="text-xs text-orange-600 font-medium hidden sm:inline">Mentetlen módosítások</span>
            )}
            {hasUnsaved && (
              <span className="h-2 w-2 rounded-full bg-orange-500 sm:hidden" aria-label="Mentetlen módosítások" />
            )}
            <a
              href="/admin/tartalom-lista"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 min-h-[44px] md:min-h-0 px-1"
              aria-label="Lista nézet"
            >
              <ArrowLeft className="h-4 w-4 md:h-3 md:w-3" />
              <span className="hidden sm:inline">Lista nézet</span>
            </a>
          </div>
        </div>

        {/* Iframe + Edit panel container */}
        <div className="flex-1 flex overflow-hidden bg-gray-100 relative">
          {/* Iframe container */}
          <div className="flex-1 flex items-start justify-center p-2 md:p-4 overflow-auto">
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 w-full md:w-auto"
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
                title="Vizuális szerkesztő"
              />
            </div>
          </div>

          {/* Inline edit panel (slides in from the right on desktop, full-screen overlay on mobile) */}
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
