import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sprout, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  // todo: remove mock functionality - this will connect to real AI backend
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! 👋 I'm your AI garden assistant. I can help you catalog your plants by identifying them from photos or just chatting about what's in your garden.\n\nTo get started, you can:\n📷 Send me a photo of a plant\n💬 Tell me what you're growing (e.g., 'I have some roses in my front yard')\n🗺️ Describe a garden bed and I'll help organize it\n\nWhat works best for you?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);

    // todo: remove mock functionality - simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand you'd like to add plants to your garden! Could you tell me more details, or would you prefer to upload a photo?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, response]);
    }, 1500);
  };

  const handleUploadPhoto = () => {
    console.log("Photo upload clicked");
    // todo: remove mock functionality - implement real photo upload
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-display font-semibold" data-testid="text-app-title">
              Garden Catalog
            </h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6" data-testid="chat-messages-container">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onUploadPhoto={handleUploadPhoto}
        disabled={isTyping}
      />
    </div>
  );
}
