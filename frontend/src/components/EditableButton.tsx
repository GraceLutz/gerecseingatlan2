import React, { useState, useRef, useCallback, useEffect } from "react";
import { useContent, useContentBlock } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Pencil, Check, X } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";

interface EditableButtonProps {
  pagePath: string;
  labelKey: string;
  urlKey: string;
  fallbackLabel: string;
  fallbackUrl: string;
  className?: string;
}

/**
 * Inline-editable CTA button.
 * Admin click opens a popover with label and URL fields.
 */
export default function EditableButton({
  pagePath,
  labelKey,
  urlKey,
  fallbackLabel,
  fallbackUrl,
  className = "",
}: EditableButtonProps) {
  const { isAdmin, updateBlockContent } = useContent();
  const { lang } = useLanguage();
  const { content: label } = useContentBlock(pagePath, labelKey, fallbackLabel);
  const { content: url } = useContentBlock(pagePath, urlKey, fallbackUrl);

  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);
  const [draftUrl, setDraftUrl] = useState(url);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftLabel(label);
  }, [label]);

  useEffect(() => {
    setDraftUrl(url);
  }, [url]);

  const saveField = useCallback(
    async (blockKey: string, content: string) => {
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
          content,
          lang,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Mentés sikertelen (${res.status})`);
      }
      updateBlockContent(pagePath, blockKey, content, "text");
    },
    [pagePath, lang, updateBlockContent]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await Promise.all([
        draftLabel !== label ? saveField(labelKey, draftLabel) : Promise.resolve(),
        draftUrl !== url ? saveField(urlKey, draftUrl) : Promise.resolve(),
      ]);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Hiba történt a mentés során."
      );
    } finally {
      setSaving(false);
    }
  }, [draftLabel, draftUrl, label, url, labelKey, urlKey, saveField]);

  const handleCancel = useCallback(() => {
    setDraftLabel(label);
    setDraftUrl(url);
    setIsEditing(false);
    setError(null);
  }, [label, url]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleCancel, handleSave]
  );

  useEffect(() => {
    if (!isEditing) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        handleCancel();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, handleCancel]);

  if (!isAdmin) {
    return (
      <a href={url} className={className} data-editable={labelKey} data-page={pagePath}>
        {label}
      </a>
    );
  }

  return (
    <span
      className="group relative inline-block"
      data-editable={labelKey}
      data-page={pagePath}
    >
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={className}
        aria-label={`${labelKey} szerkesztése`}
      >
        {label}
      </button>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 absolute -top-5 -right-5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-opacity z-50"
        aria-label={`${labelKey} szerkesztése`}
        title="Szerkesztés"
      >
        <Pencil className="h-5 w-5" />
      </button>
      <span className="opacity-40 sm:opacity-0 sm:group-hover:opacity-100 absolute inset-0 outline outline-2 outline-dashed outline-blue-300 rounded pointer-events-none transition-opacity" />

      {isEditing && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[280px] max-w-[calc(100vw-2rem)]"
          role="dialog"
          aria-label="Gomb szerkesztése"
        >
          <div className="space-y-3">
            <div>
              <label
                htmlFor={`btn-label-${labelKey}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Felirat
              </label>
              <input
                id={`btn-label-${labelKey}`}
                type="text"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Gomb felirat"
              />
            </div>
            <div>
              <label
                htmlFor={`btn-url-${urlKey}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL
              </label>
              <input
                id={`btn-url-${urlKey}`}
                type="text"
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2.5 min-h-[44px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Gomb URL"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 min-h-[44px] text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 flex items-center gap-1"
                aria-label="Mégse"
              >
                <X className="h-4 w-4" />
                Mégse
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 min-h-[44px] text-sm text-white bg-green-600 rounded-md hover:bg-green-700 active:bg-green-800 disabled:opacity-50 flex items-center gap-1"
                aria-label="Mentés"
              >
                <Check className="h-4 w-4" />
                Mentés
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
