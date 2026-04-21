import React, { useState, useRef, useCallback, useEffect } from "react";
import { useContent, useContentArray } from "@/contexts/ContentContext";
import { Pencil, Check, X, Trash2, Plus } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";

interface EditableListProps {
  pagePath: string;
  blockKey: string;
  fallback: string[];
  className?: string;
  itemClassName?: string;
  ordered?: boolean;
}

/**
 * Inline-editable list component.
 * Each item is individually editable. Admins can add/delete items.
 */
export default function EditableList({
  pagePath,
  blockKey,
  fallback,
  className = "",
  itemClassName = "",
  ordered = false,
}: EditableListProps) {
  const { isAdmin } = useContent();
  const { items, loading } = useContentArray<string>(
    pagePath,
    blockKey,
    fallback
  );

  const [localItems, setLocalItems] = useState<string[]>(items);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editableRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const saveItems = useCallback(
    async (newItems: string[]) => {
      setSaving(true);
      setError(null);
      try {
        const csrf = getCsrfToken();
        const res = await fetch(`/api/admin/content/by-path`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(csrf ? { "x-csrf-token": csrf } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            pagePath: `/${pagePath.replace(/^\//, "")}`,
            blockKey,
            content: JSON.stringify(newItems),
            contentType: "json",
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.error || `Mentés sikertelen (${res.status})`
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Hiba történt a mentés során."
        );
      } finally {
        setSaving(false);
      }
    },
    [pagePath, blockKey]
  );

  const startEditing = useCallback((index: number) => {
    setEditingIndex(index);
    setError(null);
    setTimeout(() => {
      editableRef.current?.focus();
    }, 0);
  }, []);

  const stopEditing = useCallback(
    (save: boolean) => {
      if (save && editingIndex !== null && editableRef.current) {
        const newText = editableRef.current.textContent ?? "";
        const updated = [...localItems];
        updated[editingIndex] = newText;
        setLocalItems(updated);
        saveItems(updated);
      } else if (!save && editingIndex !== null) {
        setLocalItems(items);
      }
      setEditingIndex(null);
    },
    [editingIndex, localItems, items, saveItems]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        stopEditing(false);
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        stopEditing(true);
      }
    },
    [stopEditing]
  );

  const addItem = useCallback(() => {
    const updated = [...localItems, "Új elem"];
    setLocalItems(updated);
    saveItems(updated);
    setTimeout(() => {
      setEditingIndex(updated.length - 1);
    }, 100);
  }, [localItems, saveItems]);

  const deleteItem = useCallback(
    (index: number) => {
      const updated = localItems.filter((_, i) => i !== index);
      setLocalItems(updated);
      saveItems(updated);
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    },
    [localItems, editingIndex, saveItems]
  );

  const ListTag = ordered ? "ol" : "ul";

  if (loading && items.length === 0) {
    return (
      <ListTag className={className} aria-busy="true">
        {fallback.map((item, i) => (
          <li key={i} className={itemClassName}>
            {item}
          </li>
        ))}
      </ListTag>
    );
  }

  if (!isAdmin) {
    return (
      <ListTag className={className} data-editable={blockKey} data-page={pagePath}>
        {localItems.map((item, i) => (
          <li key={i} className={itemClassName}>
            {item}
          </li>
        ))}
      </ListTag>
    );
  }

  return (
    <div className="relative" data-editable={blockKey} data-page={pagePath}>
      <ListTag className={className}>
        {localItems.map((item, i) => (
          <li
            key={i}
            className={`group/item relative ${itemClassName}`}
          >
            {editingIndex === i ? (
              <span className="relative inline-block w-full">
                <span
                  ref={editableRef}
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  onBlur={() => stopEditing(true)}
                  className="outline-2 outline-dashed outline-blue-400 rounded px-1 min-w-[2rem] focus:outline-blue-600 inline-block w-full"
                  role="textbox"
                  aria-label={`${blockKey} elem ${i + 1} szerkesztése`}
                >
                  {item}
                </span>
                <span className="absolute -top-7 right-0 flex gap-1 z-50">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      stopEditing(true);
                    }}
                    disabled={saving}
                    className="p-1 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-50"
                    aria-label="Mentés"
                    title="Mentés"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      stopEditing(false);
                    }}
                    className="p-1 bg-red-600 text-white rounded shadow hover:bg-red-700"
                    aria-label="Mégse"
                    title="Mégse"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </span>
            ) : (
              <span className="relative inline-block w-full">
                {item}
                <span className="invisible group-hover/item:visible absolute right-0 top-0 flex gap-1 z-50">
                  <button
                    type="button"
                    onClick={() => startEditing(i)}
                    className="p-1 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-all"
                    aria-label={`${blockKey} elem ${i + 1} szerkesztése`}
                    title="Szerkesztés"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(i)}
                    className="p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-all"
                    aria-label={`${blockKey} elem ${i + 1} törlése`}
                    title="Törlés"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
                <span className="invisible group-hover/item:visible absolute inset-0 outline outline-2 outline-dashed outline-blue-300 rounded pointer-events-none" />
              </span>
            )}
          </li>
        ))}
      </ListTag>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        aria-label="Új elem hozzáadása"
      >
        <Plus className="h-4 w-4" />
        Új elem
      </button>
      {saving && (
        <span className="text-xs text-blue-600 mt-1 block">Mentés...</span>
      )}
      {error && (
        <span className="text-xs text-red-600 mt-1 block">{error}</span>
      )}
    </div>
  );
}
