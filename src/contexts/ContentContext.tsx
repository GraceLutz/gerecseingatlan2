import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useLanguage } from "./LanguageContext";
import { extractLang } from "@/types/content";
import type { ContentBlock, Lang, ResolvedContentType } from "@/types/content";

interface ContentPageData {
  blocks: Record<string, ContentBlock>;
  loading: boolean;
  error: string | null;
}

interface ContentContextValue {
  getPageContent: (pagePath: string) => ContentPageData;
  fetchPageContent: (pagePath: string) => Promise<void>;
  updateBlockContent: (pagePath: string, blockKey: string, content: string, contentType: ResolvedContentType) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<Record<string, ContentPageData>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const fetchingRef = useRef<Set<string>>(new Set());
  const { lang } = useLanguage();

  const fetchPageContent = useCallback(async (pagePath: string) => {
    const normalizedPath = `/${pagePath.replace(/^\//, "")}`;
    const cacheKey = `${normalizedPath}:${lang}`;

    if (fetchingRef.current.has(cacheKey)) return;
    fetchingRef.current.add(cacheKey);

    setPages((prev) => ({
      ...prev,
      [normalizedPath]: {
        blocks: prev[normalizedPath]?.blocks ?? {},
        loading: true,
        error: null,
      },
    }));

    try {
      const res = await fetch(
        `/api/content/${encodeURIComponent(normalizedPath.slice(1))}?lang=${lang}`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setPages((prev) => ({
        ...prev,
        [normalizedPath]: {
          blocks: data.blocks ?? {},
          loading: false,
          error: null,
        },
      }));
    } catch (err) {
      setPages((prev) => ({
        ...prev,
        [normalizedPath]: {
          blocks: prev[normalizedPath]?.blocks ?? {},
          loading: false,
          error: err instanceof Error ? err.message : "Ismeretlen hiba",
        },
      }));
    } finally {
      fetchingRef.current.delete(cacheKey);
    }
  }, [lang]);

  const getPageContent = useCallback(
    (pagePath: string): ContentPageData => {
      const normalizedPath = `/${pagePath.replace(/^\//, "")}`;
      return (
        pages[normalizedPath] ?? { blocks: {}, loading: false, error: null }
      );
    },
    [pages]
  );

  /** Optimistic update — patches a single block in local state after a successful API save. */
  const updateBlockContent = useCallback(
    (pagePath: string, blockKey: string, content: string, contentType: ResolvedContentType) => {
      const normalizedPath = `/${pagePath.replace(/^\//, "")}`;
      setPages((prev) => {
        const pageData = prev[normalizedPath];
        if (!pageData) return prev;
        return {
          ...prev,
          [normalizedPath]: {
            ...pageData,
            blocks: {
              ...pageData.blocks,
              [blockKey]: { content, contentType },
            },
          },
        };
      });
    },
    []
  );

  const value = useMemo(
    () => ({ getPageContent, fetchPageContent, updateBlockContent, isAdmin, setIsAdmin }),
    [getPageContent, fetchPageContent, updateBlockContent, isAdmin, setIsAdmin],
  );

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return ctx;
}

/**
 * Hook to get a specific content block for the current page.
 * Returns the block content or the fallback if not loaded yet.
 */
export function useContentBlock(
  pagePath: string,
  blockKey: string,
  fallback: string
): { content: string; contentType: ResolvedContentType; loading: boolean; existsInDb: boolean } {
  const { getPageContent, fetchPageContent } = useContent();
  const { lang } = useLanguage();
  const pageData = getPageContent(pagePath);
  const fetchedKeyRef = useRef("");

  React.useEffect(() => {
    const key = `${pagePath}:${lang}`;
    if (fetchedKeyRef.current !== key) {
      fetchedKeyRef.current = key;
      fetchPageContent(pagePath);
    }
  }, [pagePath, lang, fetchPageContent]);

  const block = pageData.blocks[blockKey];
  const existsInDb = block !== undefined;

  const rawContent = block?.content ?? fallback;
  const content = extractLang(rawContent, lang as Lang);

  return {
    content,
    contentType: block?.contentType ?? "text",
    loading: pageData.loading,
    existsInDb,
  };
}

export function useContentArray<T = string>(
  pagePath: string,
  blockKey: string,
  fallback: T[]
): { items: T[]; loading: boolean } {
  const { getPageContent, fetchPageContent } = useContent();
  const { lang } = useLanguage();
  const pageData = getPageContent(pagePath);
  const fetchedKeyRef = useRef("");

  React.useEffect(() => {
    const key = `${pagePath}:${lang}`;
    if (fetchedKeyRef.current !== key) {
      fetchedKeyRef.current = key;
      fetchPageContent(pagePath);
    }
  }, [pagePath, lang, fetchPageContent]);

  const block = pageData.blocks[blockKey];

  if (!block) return { items: fallback, loading: pageData.loading };

  // Extract language from bilingual JSON wrapper if present
  let rawContent = block.content;
  const extracted = extractLang(rawContent, lang as Lang);
  if (extracted !== rawContent) rawContent = extracted;

  if (block.contentType === "json-array" || extracted !== block.content) {
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed)) return { items: parsed, loading: false };
    } catch {}
  }

  return { items: fallback, loading: pageData.loading };
}
