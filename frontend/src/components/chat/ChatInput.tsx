import { useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  maxLength?: number;
}

const MAX_ROWS = 5;
const LINE_HEIGHT_PX = 20;

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  maxLength,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = MAX_ROWS * LINE_HEIGHT_PX;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
    onChange(newValue);
  };

  const showCounter = maxLength && value.length >= maxLength - 200;
  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="flex items-end gap-2 px-4 py-3 border-t">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Pl. Hány szobás? Van a közelben iskola?"
          disabled={isLoading}
          rows={1}
          className="w-full resize-none px-3 py-2 rounded-lg border border-input bg-background text-sm leading-5 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          aria-label="Üzenet bevitele"
          maxLength={maxLength}
        />
        {showCounter && (
          <span
            className="absolute bottom-1 right-2 text-[10px] text-muted-foreground"
            aria-live="polite"
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <Button
        type="button"
        size="icon"
        disabled={!canSend}
        onClick={onSend}
        className="h-10 w-10 shrink-0 bg-dark-green hover:bg-dark-green/90"
        aria-label="Küldés"
      >
        <Send size={16} aria-hidden="true" />
      </Button>
    </div>
  );
};

export default ChatInput;
