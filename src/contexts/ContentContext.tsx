import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

interface ContentBlock {
  content: string;
  contentType: string;
}

interface ContentPageData {
  blocks: Record<string, ContentBlock>;
  loading: boolean;
  error: string | null;
}

interface ContentContextValue {
  getPageContent: (pagePath: string) => ContentPageData;
  fetchPageContent: (pagePath: string) => Promise<void>;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<Record<string, ContentPageData>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const fetchingRef = useRef<Set<string>>(new Set());

  const fetchPageContent = useCallback(async (pagePath: string) => {
    const normalizedPath = `/${pagePath.replace(/^\//, "")}`;

    if (fetchingRef.current.has(normalizedPath)) return;
    fetchingRef.current.add(normalizedPath);

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
        `/api/content/${encodeURIComponent(normalizedPath.slice(1))}`
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
      fetchingRef.current.delete(normalizedPath);
    }
  }, []);

  const getPageContent = useCallback(
    (pagePath: string): ContentPageData => {
      const normalizedPath = `/${pagePath.replace(/^\//, "")}`;
      return (
        pages[normalizedPath] ?? { blocks: {}, loading: false, error: null }
      );
    },
    [pages]
  );

  return (
    <ContentContext.Provider
      value={{ getPageContent, fetchPageContent, isAdmin, setIsAdmin }}
    >
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
): { content: string; contentType: string; loading: boolean } {
  const { getPageContent, fetchPageContent } = useContent();
  const pageData = getPageContent(pagePath);
  const fetchedRef = useRef(false);

  React.useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchPageContent(pagePath);
    }
  }, [pagePath, fetchPageContent]);

  const block = pageData.blocks[blockKey];

  return {
    content: block?.content ?? fallback,
    contentType: block?.contentType ?? "text",
    loading: pageData.loading,
  };
}
