import React, { useState, useRef, useCallback, useEffect } from "react";
import { useContent, useContentBlock } from "@/contexts/ContentContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Pencil, Check, X } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";
import RichTextEditor from "@/components/RichTextEditor";
import { sanitizeHtml } from "@/components/RichText";
import type { ResolvedContentType } from "@/types/content";

interface EditableTextProps {
  pagePath: string;
  blockKey: string;
  fallback: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  contentType?: "text" | "html" | "markdown";
}

const AUTO_SAVE_INTERVAL = 10000;

const BLOCK_TAGS = new Set([
  "div", "section", "article", "aside", "header", "footer", "main", "nav",
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "ul", "ol", "li",
  "figure", "figcaption", "details", "summary",
]);

/** Inline editable text/HTML component. Uses TipTap for rich editing in admin mode. */
export default function EditableText({
  pagePath,
  blockKey,
  fallback,
  as: Tag = "span",
  className = "",
  contentType: defaultContentType = "text",
}: EditableTextProps) {
  const isBlockTag = BLOCK_TAGS.has(Tag as string);
  const { isAdmin, updateBlockContent } = useContent();
  const { lang } = useLanguage();
  const { content, contentType, loading, existsInDb } = useContentBlock(
    pagePath,
    blockKey,
    fallback
  );

  const isHtml = contentType === "html" || defaultContentType === "html";
  const isEmpty = existsInDb && !content;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftRef = useRef(draft);
  const contentRef = useRef(content);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(content);
    draftRef.current = content;
    contentRef.current = content;
  }, [content]);

  const resolvedContentType = (contentType || defaultContentType) as ResolvedContentType;

  const saveContent = useCallback(
    async (newContent: string) => {
      setSaving(true);
      setError(null);
      try {
        const csrf = getCsrfToken();
        const normalizedPath = `/${pagePath.replace(/^\//, "")}`;
        const res = await fetch("/api/admin/content/by-path", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(csrf ? { "x-csrf-token": csrf } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            pagePath: normalizedPath,
            blockKey,
            content: newContent,
            contentType: resolvedContentType,
            lang,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Mentés sikertelen (${res.status})`);
        }
        updateBlockContent(pagePath, blockKey, newContent, resolvedContentType);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Hiba történt a mentés során."
        );
      } finally {
        setSaving(false);
      }
    },
    [pagePath, blockKey, resolvedContentType, lang, updateBlockContent]
  );

  const handleDraftChange = useCallback((newContent: string) => {
    setDraft(newContent);
    draftRef.current = newContent;
  }, []);

  const clearAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setError(null);
    autoSaveTimerRef.current = setInterval(() => {
      if (draftRef.current !== contentRef.current) {
        saveContent(draftRef.current);
      }
    }, AUTO_SAVE_INTERVAL);
    if (!isHtml) {
      setTimeout(() => textInputRef.current?.focus(), 0);
    }
  }, [isHtml, saveContent]);

  const stopEditing = useCallback(
    (save: boolean) => {
      clearAutoSave();
      setIsEditing(false);
      if (save && draftRef.current !== contentRef.current) {
        saveContent(draftRef.current);
      } else if (!save) {
        setDraft(contentRef.current);
        draftRef.current = contentRef.current;
      }
    },
    [saveContent, clearAutoSave]
  );

  const handleTextKeyDown = useCallback(
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

  useEffect(() => {
    return clearAutoSave;
  }, [clearAutoSave]);

  if (loading && !content) {
    return (
      <Tag className={className} aria-busy="true">
        {fallback}
      </Tag>
    );
  }

  if (!isAdmin) {
    if (isEmpty) return null;
    if (isHtml) {
      return (
        <Tag
          className={className}
          data-editable={blockKey}
          data-page={pagePath}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
        />
      );
    }
    return (
      <Tag className={className} data-editable={blockKey} data-page={pagePath}>
        {content}
      </Tag>
    );
  }

  const WrapperTag = isBlockTag ? "div" : "span";

  return (
    <WrapperTag
      className={`group relative ${isBlockTag ? "block" : "inline-block"} ${className}`}
      data-editable={blockKey}
      data-page={pagePath}
    >
      {isEditing ? (
        <>
          {isHtml ? (
            <RichTextEditor
              value={draft}
              onChange={handleDraftChange}
              mode="rich"
              placeholder={`${blockKey} szerkesztése`}
            />
          ) : (
            <input
              ref={textInputRef}
              type="text"
              value={draft}
              onChange={(e) => handleDraftChange(e.target.value)}
              onKeyDown={handleTextKeyDown}
              onBlur={() => stopEditing(true)}
              className="w-full outline-2 outline-dashed outline-blue-400 rounded px-2 py-1 min-w-[2rem] focus:outline-blue-600 bg-white text-inherit"
              aria-label={`${blockKey} szerkesztése`}
            />
          )}
          <span className="absolute -top-[3rem] right-0 flex gap-1 z-50">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopEditing(true);
              }}
              disabled={saving}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-green-600 text-white rounded-lg shadow hover:bg-green-700 active:bg-green-800 disabled:opacity-50"
              aria-label="Mentés"
              title="Mentés"
            >
              <Check className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopEditing(false);
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-red-600 text-white rounded-lg shadow hover:bg-red-700 active:bg-red-800"
              aria-label="Mégse"
              title="Mégse"
            >
              <X className="h-5 w-5" />
            </button>
          </span>
        </>
      ) : (
        <>
          {isEmpty ? (
            <Tag className="italic text-gray-400">[{blockKey}]</Tag>
          ) : isHtml ? (
            <Tag dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
          ) : (
            <Tag>{content}</Tag>
          )}
          <button
            type="button"
            onClick={startEditing}
            className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 absolute -top-5 -right-5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-opacity z-50"
            aria-label={`${blockKey} szerkesztése`}
            title="Szerkesztés"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <span className="opacity-40 sm:opacity-0 sm:group-hover:opacity-100 absolute inset-0 outline outline-2 outline-dashed outline-blue-300 rounded pointer-events-none transition-opacity" />
        </>
      )}
      {saving && (
        <span className="absolute -bottom-5 left-0 text-xs text-blue-600">
          Mentés...
        </span>
      )}
      {error && (
        <span className="absolute -bottom-5 left-0 text-xs text-red-600">
          {error}
        </span>
      )}
    </WrapperTag>
  );
}
