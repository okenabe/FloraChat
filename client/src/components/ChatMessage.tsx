import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sprout, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${role}`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0" data-testid="avatar-bot">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sprout className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1",
          isUser ? "items-end max-w-md" : "items-start max-w-lg"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-base",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-card-border text-card-foreground"
          )}
          data-testid={`bubble-${role}`}
        >
          {content}
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground px-1" data-testid="message-timestamp">
            {timestamp}
          </span>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0" data-testid="avatar-user">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
