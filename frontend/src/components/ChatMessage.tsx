import { User, Bot, RefreshCw } from "lucide-react";
import CitationChip, { type Citation } from "./CitationChip";
import { sanitizeHtml } from "./RichText";

type MessageRole = "user" | "assistant" | "system";

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  citations?: Citation[];
  timestamp?: Date;
  onRetry?: () => void;
}

const ERROR_MESSAGES = {
  network: "Nem sikerült kapcsolódni. Próbálja újra.",
  rate_limit: "Túl sok kérdés. Próbálja újra később.",
  budget: "A szolgáltatás átmenetileg nem elérhető.",
  api_down: "Az asszisztens jelenleg nem elérhető.",
} as const;

type ErrorType = keyof typeof ERROR_MESSAGES;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
    .replace(
      /\[(.+?)\]\((\/[^\s)]+)\)/g,
      '<a href="$2" class="underline text-dark-green font-medium">$1 →</a>',
    )
    .replace(
      /\[(.+?)\]\((https?:\/\/.+?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-dark-green">$1</a>',
    )
    .replace(/\n/g, "<br />");
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "most";
  if (diffMin < 60) return `${diffMin} perce`;

  return date.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  citations,
  timestamp,
  onRetry,
}) => {
  if (role === "system") {
    const isRetryable = onRetry != null;
    return (
      <div
        className="flex justify-center animate-fade-in-up"
        role="listitem"
        aria-label="Rendszerüzenet"
      >
        <div className="flex flex-col items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
          <span>{content}</span>
          {isRetryable && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              aria-label="Újrapróbálás"
            >
              <RefreshCw size={12} aria-hidden="true" />
              Újra
            </button>
          )}
        </div>
      </div>
    );
  }

  const isUser = role === "user";

  return (
    <div
      className={`flex gap-2 animate-fade-in-up ${isUser ? "flex-row-reverse" : "flex-row"}`}
      role="listitem"
      aria-label={isUser ? "Saját üzenet" : "Válasz"}
    >
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 ${
          isUser ? "bg-dark-green text-white" : "bg-muted text-foreground"
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={`flex flex-col gap-1 ${isUser ? "max-w-[75%] items-end" : "max-w-[85%] items-start"}`}
      >
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-dark-green text-white rounded-tr-sm"
              : "bg-white dark:bg-muted text-foreground rounded-tl-sm shadow-sm"
          }`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(renderMarkdown(content)) }}
        />
        {citations && citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5" aria-label="Hivatkozott helyek">
            {citations.map((c) => (
              <CitationChip key={c.placeId} citation={c} />
            ))}
          </div>
        )}
        {timestamp && (
          <time
            className="text-[10px] text-muted-foreground px-1"
            dateTime={timestamp.toISOString()}
          >
            {formatTimestamp(timestamp)}
          </time>
        )}
      </div>
    </div>
  );
};

export { renderMarkdown, ERROR_MESSAGES };
export type { ErrorType, ChatMessageProps };
export default ChatMessage;
