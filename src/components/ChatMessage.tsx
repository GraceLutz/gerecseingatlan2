import { User, Bot } from "lucide-react";
import CitationChip, { type Citation } from "./CitationChip";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

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
    .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-dark-green">$1</a>')
    .replace(/\n/g, "<br />");
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, citations }) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      role="listitem"
      aria-label={isUser ? "Saját üzenet" : "Válasz"}
    >
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser ? "bg-dark-green text-white" : "bg-muted text-foreground"
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
            isUser
              ? "bg-dark-green text-white rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          }`}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
        {citations && citations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1" aria-label="Hivatkozott helyek">
            {citations.map((c) => (
              <CitationChip key={c.placeId} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { renderMarkdown };
export default ChatMessage;
