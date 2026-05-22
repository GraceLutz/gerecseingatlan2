import { Bot } from "lucide-react";

/**
 * Animated typing indicator shown while the AI assistant is generating a response.
 */
const TypingIndicator: React.FC = () => (
  <div
    className="flex gap-2 animate-fade-in-up"
    role="listitem"
    aria-label="Az asszisztens válaszol"
    aria-live="polite"
  >
    <div
      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 bg-muted text-foreground"
      aria-hidden="true"
    >
      <Bot size={14} />
    </div>
    <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-muted shadow-sm px-4 py-3 flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-dark-green/60 animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 rounded-full bg-dark-green/60 animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-dark-green/60 animate-bounce [animation-delay:300ms]" />
      <span className="sr-only">Gondolkodom...</span>
    </div>
  </div>
);

export default TypingIndicator;
