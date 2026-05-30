import { useState } from "react";
import { Minus, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatHeaderProps {
  propertyTitle?: string;
  isOnline: boolean;
  onMinimize: () => void;
  onNewConversation: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  propertyTitle,
  isOnline,
  onMinimize,
  onNewConversation,
  onClose,
  isMobile,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmNew = () => {
    onNewConversation();
    setConfirmOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-dark-green text-white rounded-none sm:rounded-t-xl">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`shrink-0 w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-gray-400"}`}
              aria-hidden="true"
            />
            <h2 className="text-sm font-heading font-semibold truncate">
              Gerecse Asszisztens
            </h2>
            <span className="text-xs text-white/70">
              {isOnline ? "Online" : "Nem elérhető"}
            </span>
          </div>
          {propertyTitle && (
            <p className="text-xs text-white/60 truncate mt-0.5">
              Téma: {propertyTitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Új beszélgetés"
            >
              <RotateCcw size={16} aria-hidden="true" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Új beszélgetés</AlertDialogTitle>
              <AlertDialogDescription>
                Biztosan új beszélgetést szeretne kezdeni? Az eddigi üzenetek törlődnek.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mégse</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmNew}>
                Igen, új beszélgetés
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
          aria-label="Chat kicsinyítése"
        >
          <Minus size={16} aria-hidden="true" />
        </Button>

        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Chat bezárása"
          >
            <X size={16} aria-hidden="true" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
