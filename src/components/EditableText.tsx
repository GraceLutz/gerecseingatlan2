import React, { useState, useRef, useCallback, useEffect } from "react";
import { useContent, useContentBlock } from "@/contexts/ContentContext";
import { Pencil, Check, X, Bold, Italic, Link } from "lucide-react";

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

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
 * Supports plain text and HTML with a floating formatting toolbar.
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

  const isHtml = contentType === "html" || defaultContentType === "html";

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

  const readDraft = useCallback(() => {
    if (!editableRef.current) return "";
    return isHtml
      ? editableRef.current.innerHTML
      : (editableRef.current.textContent ?? "");
  }, [isHtml]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setError(null);
    setTimeout(() => {
      if (editableRef.current) {
        if (isHtml) {
          editableRef.current.innerHTML = draft;
        }
        editableRef.current.focus();
      }
    }, 0);

    autoSaveTimerRef.current = setInterval(() => {
      if (draftRef.current !== content) {
        saveContent(draftRef.current);
      }
    }, AUTO_SAVE_INTERVAL);
  }, [content, draft, isHtml, saveContent]);

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
          if (isHtml) {
            editableRef.current.innerHTML = content;
          } else {
            editableRef.current.textContent = content;
          }
        }
      }
    },
    [draft, content, isHtml, saveContent]
  );

  const handleInput = useCallback(() => {
    const newContent = readDraft();
    setDraft(newContent);
    draftRef.current = newContent;
  }, [readDraft]);

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

  const execFormat = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      handleInput();
      editableRef.current?.focus();
    },
    [handleInput]
  );

  const handleLinkInsert = useCallback(() => {
    const url = window.prompt("Link URL:");
    if (url) {
      execFormat("createLink", url);
    }
  }, [execFormat]);

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
    if (isHtml) {
      return (
        <Tag
          className={className}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    return <Tag className={className}>{content}</Tag>;
  }

  return (
    <span
      className={`group relative inline-block ${className}`}
      data-editable={blockKey}
    >
      {isEditing ? (
        <>
          {isHtml && (
            <div
              className="absolute -top-10 left-0 flex gap-1 z-50 bg-white border border-gray-200 rounded shadow-lg p-1"
              role="toolbar"
              aria-label="Szövegformázás"
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execFormat("bold");
                }}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Félkövér"
                title="Félkövér"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execFormat("italic");
                }}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Dőlt"
                title="Dőlt"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleLinkInsert();
                }}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Link"
                title="Link"
              >
                <Link className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
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
            {isHtml ? undefined : draft}
          </Tag>
          <span className={`absolute ${isHtml ? "-top-[3.5rem]" : "-top-8"} right-0 flex gap-1 z-50`}>
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
          {isHtml ? (
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
