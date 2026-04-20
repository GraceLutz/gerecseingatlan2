import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, ChevronRight, History, RotateCcw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface ContentBlock {
  id: string;
  pagePath: string;
  blockKey: string;
  content: string;
  contentType: string;
  updatedAt: string;
  updatedBy: string | null;
}

interface ContentVersion {
  id: string;
  blockId: string;
  content: string;
  contentType: string;
  version: number;
  editedBy: string | null;
  createdAt: string;
}

interface GroupedBlocks {
  [pagePath: string]: ContentBlock[];
}

export default function ContentPage() {
  const { csrfToken } = useAuth();

  useEffect(() => {
    document.title = "Tartalom kezelés | Gerecse Ingatlan Admin";
  }, []);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [grouped, setGrouped] = useState<GroupedBlocks>({});
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [editContent, setEditContent] = useState("");
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [showVersions, setShowVersions] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/content?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBlocks(data.blocks);
      setGrouped(data.grouped);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Hiba történt a betöltés során."
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const togglePage = (pagePath: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pagePath)) {
        next.delete(pagePath);
      } else {
        next.add(pagePath);
      }
      return next;
    });
  };

  const startEdit = (block: ContentBlock) => {
    setEditingBlock(block);
    setEditContent(block.content);
  };

  const saveEdit = async () => {
    if (!editingBlock) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/content/${editingBlock.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(csrfToken ? { "x-csrf-token": csrfToken } : {}) },
        credentials: "include",
        body: JSON.stringify({ content: editContent }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Mentés sikertelen (${res.status})`);
      }
      setEditingBlock(null);
      fetchBlocks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Hiba történt a mentés során."
      );
    } finally {
      setSaving(false);
    }
  };

  const loadVersions = async (blockId: string) => {
    if (showVersions === blockId) {
      setShowVersions(null);
      return;
    }
    try {
      const res = await fetch(`/api/admin/content/${blockId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVersions(data.versions);
      setShowVersions(blockId);
    } catch (err) {
      setError("Nem sikerült a verziók betöltése.");
    }
  };

  const rollback = async (blockId: string, versionId: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/content/${blockId}/rollback/${versionId}`,
        {
          method: "POST",
          headers: csrfToken ? { "x-csrf-token": csrfToken } : {},
          credentials: "include",
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || `Visszaállítás sikertelen (${res.status})`
        );
      }
      setShowVersions(null);
      fetchBlocks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Hiba történt a visszaállítás során."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!window.confirm("Biztosan törölni szeretné ezt a tartalmat?")) return;
    try {
      const res = await fetch(`/api/admin/content/${blockId}`, {
        method: "DELETE",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : {},
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Törlés sikertelen (${res.status})`);
      }
      fetchBlocks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Hiba történt a törlés során."
      );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("hu-HU", {
      timeZone: "Europe/Budapest",
    });
  };

  const pageGroups = Object.keys(grouped).sort();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tartalom kezelés
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Összesen {total} tartalom blokk
          </p>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded"
          role="alert"
        >
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 text-red-900 font-bold"
            aria-label="Hiba bezárása"
          >
            ×
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keresés oldal, blokk vagy tartalom szerint..."
            className="pl-10"
            aria-label="Tartalom keresése"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12" role="status" aria-label="Betöltés">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="mt-2 text-gray-500">Tartalom betöltése...</p>
        </div>
      ) : pageGroups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nincs találat.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pageGroups.map((pagePath) => {
            const pageBlocks = grouped[pagePath] ?? [];
            const isExpanded = expandedPages.has(pagePath);

            return (
              <div
                key={pagePath}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => togglePage(pagePath)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {pagePath}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {pageBlocks.length} blokk
                  </span>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-gray-100">
                    {pageBlocks.map((block) => (
                      <div key={block.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-blue-700">
                                {block.blockKey}
                              </code>
                              <Badge variant="secondary">
                                {block.contentType}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 truncate max-w-xl">
                              {block.content.slice(0, 150)}
                              {block.content.length > 150 ? "..." : ""}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Módosítva: {formatDate(block.updatedAt)}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(block)}
                              aria-label={`${block.blockKey} szerkesztése`}
                              title="Szerkesztés"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => loadVersions(block.id)}
                              aria-label={`${block.blockKey} verziói`}
                              title="Verziók"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBlock(block.id)}
                              className="text-destructive hover:text-destructive"
                              aria-label={`${block.blockKey} törlése`}
                              title="Törlés"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Version history panel */}
                        {showVersions === block.id && (
                          <div className="mt-3 ml-4 border-l-2 border-gray-200 pl-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Korábbi verziók
                            </h4>
                            {versions.length === 0 ? (
                              <p className="text-sm text-gray-400">
                                Nincs korábbi verzió.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {versions.map((v) => (
                                  <div
                                    key={v.id}
                                    className="flex items-start justify-between gap-2 bg-gray-50 p-2 rounded"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-500">
                                        v{v.version} —{" "}
                                        {formatDate(v.createdAt)}
                                      </p>
                                      <p className="text-sm text-gray-600 truncate">
                                        {v.content.slice(0, 100)}
                                        {v.content.length > 100 ? "..." : ""}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        rollback(block.id, v.id)
                                      }
                                      disabled={saving}
                                      className="p-1 text-orange-600 hover:bg-orange-50 rounded disabled:opacity-50"
                                      aria-label={`Visszaállítás v${v.version}-re`}
                                      title={`Visszaállítás v${v.version}`}
                                    >
                                      <RotateCcw className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog
        open={!!editingBlock}
        onOpenChange={(open) => {
          if (!open) setEditingBlock(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tartalom szerkesztése</DialogTitle>
            {editingBlock && (
              <DialogDescription>
                {editingBlock.pagePath} /{" "}
                <code className="bg-muted px-1 rounded text-foreground">
                  {editingBlock.blockKey}
                </code>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="content-editor" className="sr-only">
              Tartalom
            </label>
            <Textarea
              id="content-editor"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[12rem] font-mono text-sm resize-y"
              placeholder="Tartalom..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingBlock(null)}
            >
              Mégse
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? "Mentés..." : "Mentés"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
