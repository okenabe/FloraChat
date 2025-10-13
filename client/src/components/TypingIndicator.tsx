import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sprout } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4" data-testid="typing-indicator">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <Sprout className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="bg-card border border-card-border rounded-2xl px-4 py-3 flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
