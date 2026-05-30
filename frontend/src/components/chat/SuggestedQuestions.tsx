import { Sparkles } from "lucide-react";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  compact?: boolean;
}

/**
 * Clickable question chips. Used in EmptyState and optionally after assistant replies.
 * `compact` renders smaller chips for inline use within the message area.
 */
const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelect,
  compact = false,
}) => {
  if (questions.length === 0) return null;

  return (
    <div
      className={`flex flex-col gap-2 ${compact ? "" : "w-full"}`}
      role="group"
      aria-label="Javasolt kérdések"
    >
      {!compact && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
          <Sparkles size={10} aria-hidden="true" />
          <span>Javasolt kérdések</span>
        </div>
      )}
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          className={`text-left rounded-lg border border-border hover:bg-muted hover:border-dark-green/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"
          }`}
        >
          {q}
        </button>
      ))}
    </div>
  );
};

export default SuggestedQuestions;
