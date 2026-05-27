import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, ChevronDown } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import ChatHeader from "./chat/ChatHeader";
import ChatInput from "./chat/ChatInput";
import TypingIndicator from "./chat/TypingIndicator";
import EmptyState from "./chat/EmptyState";
import ChatMessage from "./ChatMessage";

interface ChatWidgetProps {
  propertyId?: string;
}

type MessageRole = "user" | "assistant" | "system";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface ChatApiResponse {
  reply: string;
  sources?: string[];
}

const MAX_MESSAGE_LENGTH = 500;

const SUGGESTED_QUESTIONS_PROPERTY = [
  "Mennyibe kerül és hány szobás?",
  "Milyen iskolák, boltok vannak a közelben?",
  "Mikor lehet megtekinteni?",
  "Milyen állapotban van az ingatlan?",
];

const SUGGESTED_QUESTIONS_GLOBAL = [
  "Milyen ingatlanok vannak Dorogon?",
  "Keresek egy 2 szobás lakást",
  "Melyik a legjobb ár-érték arányú ingatlanuk?",
  "Van olyan ingatlan ami CSOK Plusszal vehető?",
];

function generateId(): string {
  return crypto.randomUUID();
}

function errorMessageForStatus(status: number): string {
  if (status === 429)
    return "Túl sok kérdést küldött rövid idő alatt. Kérjük, várjon egy kicsit, majd próbálja újra.";
  if (status === 503)
    return "A szolgáltatás átmenetileg nem elérhető. Kérjük, próbálja később.";
  return "Sajnálom, hiba történt a válasz feldolgozása során.";
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ propertyId: propIdProp }) => {
  const location = useLocation();
  const { properties } = useProperties();

  const detectedPropertyId = useMemo(() => {
    if (propIdProp) return propIdProp;
    const match = location.pathname.match(/\/(?:ingatlan|en\/property)\/([^/]+)/);
    return match?.[1] || undefined;
  }, [propIdProp, location.pathname]);

  const property = useMemo(
    () => (detectedPropertyId ? properties.find((p) => p.id === detectedPropertyId) : undefined),
    [detectedPropertyId, properties],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  const suggestions = detectedPropertyId ? SUGGESTED_QUESTIONS_PROPERTY : SUGGESTED_QUESTIONS_GLOBAL;

  // Mobile detection
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Scroll tracking via IntersectionObserver
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    const container = scrollContainerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isAtBottom = entry.isIntersecting;
        setUserScrolledUp(!isAtBottom);
        if (isAtBottom) setHasNewMessage(false);
      },
      { root: container, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen]);

  // Auto-scroll to bottom on new messages (if not scrolled up)
  useEffect(() => {
    if (!userScrolledUp && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else if (userScrolledUp && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant") {
        setHasNewMessage(true);
      }
    }
  }, [messages, isLoading, userScrolledUp]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const textarea = document.querySelector<HTMLTextAreaElement>(
          '[aria-label="Üzenet bevitele"]',
        );
        textarea?.focus();
      }, 100);
    }
  }, [isOpen]);


  const scrollToBottom = useCallback(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
    setHasNewMessage(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const trimmed = text.trim();
    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setRetryMessage(null);

    try {
      const conversationHistory = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role === "user" ? "user" as const : "model" as const,
          parts: [{ text: m.content }],
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(detectedPropertyId && { propertyId: detectedPropertyId }),
          currentPath: location.pathname,
          userMessage: trimmed,
          conversationHistory: conversationHistory.slice(-10),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "system" as const,
            content: errorData?.reply || errorMessageForStatus(res.status),
            timestamp: new Date(),
          },
        ]);
        setRetryMessage(trimmed);
        setIsOnline(res.status !== 503);
        return;
      }

      const data: ChatApiResponse = await res.json();
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsOnline(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "system" as const,
          content: "Nem sikerült csatlakozni a szerverhez. Ellenőrizze az internetkapcsolatát.",
          timestamp: new Date(),
        },
      ]);
      setRetryMessage(trimmed);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, detectedPropertyId, location.pathname]);

  const handleRetry = useCallback(() => {
    if (retryMessage) {
      setMessages((prev) => prev.filter((m) => m.role !== "system"));
      sendMessage(retryMessage);
    }
  }, [retryMessage, sendMessage]);

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setInput("");
    setRetryMessage(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  const panelClasses = isMobile
    ? "fixed inset-0 z-50 bg-background flex flex-col"
    : "fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[80vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col";

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-dark-green text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          aria-label="Chat megnyitása"
        >
          <MessageCircle size={24} aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div
          className={panelClasses}
          style={isMobile ? { height: "100dvh", paddingBottom: "env(safe-area-inset-bottom)" } : undefined}
          role="dialog"
          aria-modal="true"
          aria-label="Gerecse Asszisztens chat"
          onKeyDown={handleKeyDown}
        >
          <ChatHeader
            propertyTitle={property?.title}
            isOnline={isOnline}
            onMinimize={() => setIsOpen(false)}
            onNewConversation={handleNewConversation}
            onClose={isMobile ? () => setIsOpen(false) : undefined}
            isMobile={isMobile}
          />

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-3 relative"
            role="log"
            aria-live="polite"
            aria-label="Üzenetek"
          >
            {messages.length === 0 && (
              <EmptyState
                hasPropertyContext={!!detectedPropertyId}
                suggestions={suggestions}
                onSelectQuestion={sendMessage}
              />
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="mb-3">
                <ChatMessage
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  onRetry={msg.role === "system" && retryMessage ? handleRetry : undefined}
                />
              </div>
            ))}

            {isLoading && (
              <div className="mb-3">
                <TypingIndicator />
              </div>
            )}

            <div ref={bottomSentinelRef} className="h-1" />
          </div>

          {hasNewMessage && userScrolledUp && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full bg-dark-green text-white text-xs shadow-lg hover:bg-dark-green/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Ugrás az új üzenethez"
            >
              <ChevronDown size={14} aria-hidden="true" />
              Új üzenet
            </button>
          )}

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            isLoading={isLoading}
            maxLength={MAX_MESSAGE_LENGTH}
          />

          <div className="px-4 py-2 border-t border-border text-center text-xs text-muted-foreground">
            Telefon: +36 70 613 2658
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
