import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProperties } from "@/hooks/useProperties";
import ChatMessage from "./ChatMessage";
import type { Citation } from "./CitationChip";

interface ChatWidgetProps {
  propertyId?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

interface AgentResponse {
  reply: string;
  citations?: Citation[];
  suggestions?: string[];
  costEstimate?: number;
}

const SUGGESTED_QUESTIONS_PROPERTY = [
  "Milyen boltok vannak a közelben?",
  "Mennyi idő a városközpontig?",
  "Van-e iskola a környéken?",
  "Hasonló ingatlanok a környéken?",
];

const SUGGESTED_QUESTIONS_GLOBAL = [
  "Milyen ingatlanokat ajánlanak?",
  "Mely településeken vannak eladó házak?",
];

function generateId(): string {
  return crypto.randomUUID();
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ propertyId: propIdProp }) => {
  const location = useLocation();
  const { properties } = useProperties();

  const detectedPropertyId = useMemo(() => {
    if (propIdProp) return propIdProp;
    const match = location.pathname.match(/\/ingatlan\/([^/]+)/);
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
  const [sessionId] = useState(generateId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = detectedPropertyId ? SUGGESTED_QUESTIONS_PROPERTY : SUGGESTED_QUESTIONS_GLOBAL;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: generateId(), role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          propertyId: detectedPropertyId || undefined,
          message: text.trim(),
          history,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: AgentResponse = await res.json();
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
        citations: data.citations,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "Sajnálom, hiba történt. Kérjük próbálja újra később.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, detectedPropertyId, sessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const title = detectedPropertyId ? "Kérdezzen az ingatlanról" : "Kérdezzen tőlünk";

  return (
    <>
      {/* Floating trigger button */}
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

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-0 right-0 z-50 w-full sm:w-[400px] sm:bottom-6 sm:right-6 h-full sm:h-[600px] sm:max-h-[80vh] bg-background border border-border rounded-none sm:rounded-xl shadow-2xl flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-dark-green text-white rounded-none sm:rounded-t-xl">
            <h2 className="text-sm font-heading font-semibold">{title}</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewConversation}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                aria-label="Új beszélgetés"
              >
                <RotateCcw size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                aria-label="Chat bezárása"
              >
                <X size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
            <div className="flex flex-col gap-3" role="list" aria-label="Üzenetek">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-6">
                  <p className="mb-4">
                    {detectedPropertyId
                      ? "Kérdezzen az ingatlan környékéről!"
                      : "Miben segíthetek?"}
                  </p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendMessage(q)}
                        className="text-left px-3 py-2 rounded-lg border border-border text-xs hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  citations={msg.citations}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm" aria-live="polite">
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  <span>Gondolkodom...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Írja be kérdését..."
              disabled={isLoading}
              className="flex-1 min-h-[40px] px-3 py-2 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              aria-label="Üzenet bevitele"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 shrink-0 bg-dark-green hover:bg-dark-green/90"
              aria-label="Küldés"
            >
              <Send size={16} aria-hidden="true" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
