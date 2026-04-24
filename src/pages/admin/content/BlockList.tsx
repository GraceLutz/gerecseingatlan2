import { useState } from "react";
import { Pencil, History, Trash2, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BlockEditor from "./BlockEditor";
import type { PageDefinition } from "./pageRegistry";

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
  content: string;
  contentType: string;
  version: number;
  createdAt: string;
}

interface BlockListProps {
  page: PageDefinition;
  blocks: ContentBlock[];
  csrfToken: string | null;
  onRefresh: () => void;
}

function getContentPreview(block: ContentBlock): string {
  if (block.contentType === "json") {
    try {
      const parsed = JSON.parse(block.content);
      return parsed.hu || parsed.en || block.content.slice(0, 80);
    } catch { /* non-JSON content, fall through */ }
  }
  return block.content.slice(0, 80);
}

function getBilingualStatus(block: ContentBlock): { hu: boolean; en: boolean } | null {
  if (block.contentType !== "json") return null;
  try {
    const parsed = JSON.parse(block.content);
    return { hu: !!parsed.hu, en: !!parsed.en };
  } catch {
    return null;
  }
}

export default function BlockList({ page, blocks, csrfToken, onRefresh }: BlockListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versionsFor, setVersionsFor] = useState<string | null>(null);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [creating, setCreating] = useState(false);
  const [newBlockKey, setNewBlockKey] = useState("");
  const [newBilingual, setNewBilingual] = useState(true);

  const missingBlocks = page.expectedBlocks.filter(
    (def) => !blocks.some((b) => b.blockKey === def.key)
  );

  const handleSave = async (blockId: string, content: string, contentType: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/content/${blockId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ content, contentType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Hiba: ${res.status}`);
      }
      setEditingId(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mentési hiba");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blockId: string) => {
    if (!window.confirm("Biztosan törölni szeretné?")) return;
    try {
      const res = await fetch(`/api/admin/content/${blockId}`, {
        method: "DELETE",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Törlés sikertelen");
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Törlési hiba");
    }
  };

  const loadVersions = async (blockId: string) => {
    if (versionsFor === blockId) {
      setVersionsFor(null);
      return;
    }
    try {
      const res = await fetch(`/api/admin/content/${blockId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Verziók betöltése sikertelen");
      const data = await res.json();
      setVersions(data.versions || []);
      setVersionsFor(blockId);
    } catch {
      setError("Verziók betöltése sikertelen");
    }
  };

  const rollback = async (blockId: string, versionId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/content/${blockId}/rollback/${versionId}`, {
        method: "POST",
        headers: csrfToken ? { "x-csrf-token": csrfToken } : {},
        credentials: "include",
      });
      if (!res.ok) throw new Error("Visszaállítás sikertelen");
      setVersionsFor(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Visszaállítási hiba");
    } finally {
      setSaving(false);
    }
  };

  const createBlock = async (key: string, bilingual: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const content = bilingual ? JSON.stringify({ hu: "", en: "" }) : "";
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          pagePath: page.path,
          blockKey: key,
          content,
          contentType: bilingual ? "json" : "text",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Hiba: ${res.status}`);
      }
      setCreating(false);
      setNewBlockKey("");
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Létrehozási hiba");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm" role="alert">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 font-bold p-1 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            aria-label="Hiba bezárása"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-lg font-semibold truncate">{page.nameHu}</h2>
        <Button
          size="default"
          variant="outline"
          onClick={() => setCreating(true)}
          className="min-h-[44px] px-3 shrink-0"
          aria-label="Új blokk létrehozása"
        >
          <Plus className="h-4 w-4 mr-1" /> Új blokk
        </Button>
      </div>

      {/* Missing blocks indicator */}
      {missingBlocks.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm font-medium text-amber-800 mb-2">
            Hiányzó blokkok ({missingBlocks.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {missingBlocks.map((def) => (
              <button
                key={def.key}
                type="button"
                onClick={() => createBlock(def.key, def.bilingual)}
                className="text-xs px-3 py-2 bg-amber-100 hover:bg-amber-200 rounded-md border border-amber-300 transition-colors min-h-[44px]"
                disabled={saving}
                aria-label={`${def.label} blokk létrehozása`}
              >
                + {def.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create new block inline form */}
      {creating && (
        <div className="mb-4 p-4 border border-green-200 bg-green-50/30 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block" htmlFor="new-block-key">
                Block Key
              </label>
              <input
                id="new-block-key"
                type="text"
                value={newBlockKey}
                onChange={(e) => setNewBlockKey(e.target.value)}
                placeholder="pl. section.title"
                className="w-full px-3 py-2 border rounded-md text-base md:text-sm min-h-[44px]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm min-h-[44px]">
              <input
                type="checkbox"
                checked={newBilingual}
                onChange={(e) => setNewBilingual(e.target.checked)}
                className="h-5 w-5 md:h-4 md:w-4"
              />
              Kétnyelvű
            </label>
            <div className="flex gap-2">
              <Button
                size="default"
                onClick={() => createBlock(newBlockKey, newBilingual)}
                disabled={!newBlockKey || saving}
                className="min-h-[44px] flex-1 sm:flex-none"
                aria-label="Blokk létrehozása"
              >
                Létrehozás
              </Button>
              <Button
                size="default"
                variant="ghost"
                onClick={() => setCreating(false)}
                className="min-h-[44px] flex-1 sm:flex-none"
                aria-label="Létrehozás megszakítása"
              >
                Mégse
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block list */}
      {blocks.length === 0 && missingBlocks.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nincsenek blokkok ezen az oldalon.</p>
      ) : (
        <div className="space-y-3">
          {blocks.map((block) => {
            if (editingId === block.id) {
              return (
                <BlockEditor
                  key={block.id}
                  block={block}
                  onSave={(content, contentType) => handleSave(block.id, content, contentType)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              );
            }

            const biStatus = getBilingualStatus(block);
            const preview = getContentPreview(block);

            return (
              <div
                key={block.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-blue-700 break-all">
                        {block.blockKey}
                      </code>
                      <Badge variant="secondary" className="text-xs">{block.contentType}</Badge>
                      {biStatus && (
                        <span className="flex gap-1 text-xs">
                          <span className={biStatus.hu ? "text-green-600" : "text-orange-500"}>HU</span>
                          <span className={biStatus.en ? "text-green-600" : "text-orange-500"}>EN</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{preview}{block.content.length > 80 ? "..." : ""}</p>
                    <p className="text-xs text-gray-400 mt-1">Módosítva: {formatDate(block.updatedAt)}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => setEditingId(block.id)}
                      className="min-h-[44px] min-w-[44px] p-2"
                      aria-label={`${block.blockKey} szerkesztése`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => loadVersions(block.id)}
                      className="min-h-[44px] min-w-[44px] p-2"
                      aria-label={`${block.blockKey} verziók`}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => handleDelete(block.id)}
                      className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px] p-2"
                      aria-label={`${block.blockKey} törlése`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {versionsFor === block.id && (
                  <div className="mt-3 ml-0 sm:ml-4 border-l-2 border-gray-200 pl-3 sm:pl-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Korábbi verziók</h4>
                    {versions.length === 0 ? (
                      <p className="text-sm text-gray-400">Nincs korábbi verzió.</p>
                    ) : (
                      <div className="space-y-2">
                        {versions.map((v) => (
                          <div key={v.id} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded-md">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500">v{v.version} — {formatDate(v.createdAt)}</p>
                              <p className="text-sm text-gray-600 truncate">{v.content.slice(0, 60)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => rollback(block.id, v.id)}
                              disabled={saving}
                              className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-md disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                              aria-label={`Visszaállítás v${v.version}`}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
