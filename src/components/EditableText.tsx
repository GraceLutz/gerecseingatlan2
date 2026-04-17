import React, { useState, useRef, useCallback, useEffect } from "react";
import { useContent, useContentBlock } from "@/contexts/ContentContext";
import { Pencil, Check, X, RotateCcw } from "lucide-react";

interface EditableTextProps {
  pagePath: string;
  blockKey: string;
  fallback: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  contentType?: "text" | "html" | "markdown";
}

const AUTO_SAVE_INTERVAL = 10000;

/**
 * Inline-editable content block.
 * Public visitors see plain rendered content.
 * Admins see hover outlines + pencil icon for inline editing.
 */
export default function EditableText({
  pagePath,
  blockKey,
  fallback,
  as: Tag = "span",
  className = "",
  contentType: defaultContentType = "text",
}: EditableTextProps) {
  const { isAdmin } = useContent();
  const { content, contentType, loading } = useContentBlock(
    pagePath,
    blockKey,
    fallback
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editableRef = useRef<HTMLElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const draftRef = useRef(draft);

  useEffect(() => {
    setDraft(content);
    draftRef.current = content;
  }, [content]);

  const saveContent = useCallback(
    async (newContent: string) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/content/by-path`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            pagePath: `/${pagePath.replace(/^\//, "")}`,
            blockKey,
            content: newContent,
            contentType: contentType || defaultContentType,
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
    [pagePath, blockKey, contentType, defaultContentType]
  );

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setError(null);
    setTimeout(() => {
      if (editableRef.current) {
        editableRef.current.focus();
      }
    }, 0);

    autoSaveTimerRef.current = setInterval(() => {
      if (draftRef.current !== content) {
        saveContent(draftRef.current);
      }
    }, AUTO_SAVE_INTERVAL);
  }, [content, saveContent]);

  const stopEditing = useCallback(
    (save: boolean) => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      setIsEditing(false);
      if (save && draft !== content) {
        saveContent(draft);
      } else if (!save) {
        setDraft(content);
        if (editableRef.current) {
          editableRef.current.textContent = content;
        }
      }
    },
    [draft, content, saveContent]
  );

  const handleInput = useCallback(() => {
    if (editableRef.current) {
      const newContent = editableRef.current.textContent ?? "";
      setDraft(newContent);
      draftRef.current = newContent;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        stopEditing(false);
      }
      if (e.key === "Enter" && !e.shiftKey && contentType === "text") {
        e.preventDefault();
        stopEditing(true);
      }
    },
    [stopEditing, contentType]
  );

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  if (loading && !content) {
    return (
      <Tag className={className} aria-busy="true">
        {fallback}
      </Tag>
    );
  }

  if (!isAdmin) {
    if (contentType === "html") {
      return (
        <Tag
          className={className}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return <Tag className={className}>{content}</Tag>;
  }

  // Admin view with editing capabilities
  return (
    <span className={`group relative inline-block ${className}`}>
      {isEditing ? (
        <>
          <Tag
            ref={editableRef as React.Ref<HTMLElement>}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={() => stopEditing(true)}
            className="outline-2 outline-dashed outline-blue-400 rounded px-1 min-w-[2rem] focus:outline-blue-600"
            role="textbox"
            aria-label={`${blockKey} szerkesztése`}
            aria-multiline={contentType !== "text"}
          >
            {draft}
          </Tag>
          <span className="absolute -top-8 right-0 flex gap-1 z-50">
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
        </>
      ) : (
        <>
          {contentType === "html" ? (
            <Tag dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <Tag>{content}</Tag>
          )}
          <button
            type="button"
            onClick={startEditing}
            className="invisible group-hover:visible absolute -top-3 -right-3 p-1 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
            aria-label={`${blockKey} szerkesztése`}
            title="Szerkesztés"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <span className="invisible group-hover:visible absolute inset-0 outline outline-2 outline-dashed outline-blue-300 rounded pointer-events-none" />
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
    </span>
  );
}
