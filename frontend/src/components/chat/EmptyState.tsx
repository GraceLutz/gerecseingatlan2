import { Bot } from "lucide-react";
import SuggestedQuestions from "./SuggestedQuestions";

interface EmptyStateProps {
  hasPropertyContext: boolean;
  suggestions: string[];
  onSelectQuestion: (question: string) => void;
}

/**
 * Shown when the chat has no messages yet — welcome message + suggested questions.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  hasPropertyContext,
  suggestions,
  onSelectQuestion,
}) => (
  <div className="flex flex-col items-center text-center py-8 px-2 animate-fade-in-up">
    <div className="w-12 h-12 rounded-full bg-dark-green/10 flex items-center justify-center mb-4">
      <Bot size={24} className="text-dark-green" aria-hidden="true" />
    </div>
    <h3 className="text-sm font-heading font-semibold text-foreground mb-1">
      Gerecse Asszisztens
    </h3>
    <p className="text-xs text-muted-foreground mb-6 max-w-[260px]">
      {hasPropertyContext
        ? "Üdvözlöm! Tegye fel kérdését a most megtekintett ingatlannal vagy környékével kapcsolatban."
        : "Üdvözlöm! Segítek megtalálni az Önnek megfelelő ingatlant. Kérdezzen bátran a kínálatunkról!"}
    </p>
    <SuggestedQuestions questions={suggestions} onSelect={onSelectQuestion} />
  </div>
);

export default EmptyState;
