import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onUploadPhoto: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onUploadPhoto, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed lg:sticky bottom-16 lg:bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-40">
      <div className="max-w-4xl mx-auto flex gap-2 items-end p-4">
        <Button
          size="icon"
          variant="outline"
          onClick={onUploadPhoto}
          disabled={disabled}
          data-testid="button-upload-photo"
          className="flex-shrink-0"
        >
          <Camera className="h-4 w-4" />
        </Button>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me about your plants or ask a question..."
          className="min-h-[56px] max-h-[120px] resize-none"
          disabled={disabled}
          data-testid="input-message"
        />

        <Button
          size="icon"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          data-testid="button-send"
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
