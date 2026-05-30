import { useState, useEffect, useCallback } from "react";
import { FileText, Home, Info, Building2, Users, Mail, HelpCircle, Briefcase, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_REGISTRY } from "./content/pageRegistry";
import BlockList from "./content/BlockList";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Info, Building2, Users, Mail, HelpCircle, Briefcase, MessageSquare, FileText,
};

interface ContentBlock {
  id: string;
  pagePath: string;
  blockKey: string;
  content: string;
  contentType: string;
  updatedAt: string;
  updatedBy: string | null;
}

interface PageCount {
  pagePath: string;
  blockCount: number;
}

export default function ContentListPage() {
  const { csrfToken } = useAuth();
  const [selectedPath, setSelectedPath] = useState<string>(PAGE_REGISTRY[0]?.path ?? "/");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [pageCounts, setPageCounts] = useState<PageCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Tartalom lista | Gerecse Ingatlan Admin";
  }, []);

  const fetchPageCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content/pages", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPageCounts(data.pages || []);
      }
    } catch {}
  }, []);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const encodedPath = selectedPath === "/" ? "" : selectedPath.slice(1);
      const res = await fetch(`/api/admin/content/page/${encodedPath}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBlocks(data.blocks || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [selectedPath]);

  useEffect(() => { fetchPageCounts(); }, [fetchPageCounts]);
  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  const handleRefresh = () => { fetchBlocks(); fetchPageCounts(); };

  const getBlockCount = (path: string) => {
    const found = pageCounts.find((p) => p.pagePath === path);
    return found ? Number(found.blockCount) : 0;
  };

  const selectedPage = PAGE_REGISTRY.find((p) => p.path === selectedPath);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-60 border-r border-gray-200 bg-gray-50/50 overflow-y-auto flex-shrink-0">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Oldalak</h2>
          <a href="/admin/tartalom" className="text-xs text-blue-600 hover:underline">Vizuális</a>
        </div>
        <nav className="p-2 space-y-0.5">
          {PAGE_REGISTRY.map((page) => {
            const Icon = ICON_MAP[page.icon] || FileText;
            const count = getBlockCount(page.path);
            const isActive = selectedPath === page.path;
            return (
              <button
                key={page.path}
                type="button"
                onClick={() => setSelectedPath(page.path)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                  isActive ? "bg-blue-100 text-blue-800 font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{page.nameHu}</span>
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : selectedPage ? (
          <BlockList page={selectedPage} blocks={blocks} csrfToken={csrfToken} onRefresh={handleRefresh} />
        ) : (
          <p className="text-gray-500">Válasszon egy oldalt.</p>
        )}
      </main>
    </div>
  );
}
