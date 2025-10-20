import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useUser } from "@/lib/userContext";
import { apiRequest } from "@/lib/queryClient";
import { Sprout, Menu, X, MessageSquare, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const { user, isLoading: userLoading } = useUser();
  const [location] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && messages.length === 0 && !isLoadingHistory) {
      // Try to load existing conversation
      setIsLoadingHistory(true);
      fetch(`/api/conversations/${user.id}`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          return null;
        })
        .then((conversation) => {
          if (conversation && conversation.messages) {
            const parsed = JSON.parse(conversation.messages);
            const formattedMessages = parsed.map((msg: any, idx: number) => ({
              id: `${conversation.id}-${idx}`,
              role: msg.role,
              content: msg.content,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }));
            setMessages(formattedMessages);
            setConversationId(conversation.id);
          } else {
            // Add initial greeting
            setMessages([
              {
                id: "1",
                role: "assistant",
                content:
                  "Hi! 👋 I'm your AI garden assistant. I can help you catalog your plants by identifying them from photos or just chatting about what's in your garden.\n\nTo get started, you can:\n📷 Send me a photo of a plant\n💬 Tell me what you're growing (e.g., 'I have some roses in my front yard')\n🗺️ Describe a garden bed and I'll help organize it\n\nWhat works best for you?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }
          setIsLoadingHistory(false);
        })
        .catch((error) => {
          console.error("Failed to load conversation:", error);
          setIsLoadingHistory(false);
        });
    }
  }, [user, messages.length, isLoadingHistory]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          userId: user?.id,
          conversationId,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Chat request failed");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      const response: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, response]);
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    },
    onError: (error: any) => {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. This feature requires OpenAI API key to be configured. For now, you can still browse your garden beds!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    chatMutation.mutate(content);
  };

  const handlePhotoUpload = async (file: File) => {
    setShowPhotoUpload(false);
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: "📷 [Uploaded a photo]",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Upload the photo
      const formData = new FormData();
      formData.append("photo", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload photo");
      }

      const { url } = await uploadRes.json();

      // Convert to base64 for Plant.id API
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];

        // Identify the plant
        const identifyRes = await fetch("/api/identify-plant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64Image: base64, imageUrl: url }),
        });

        if (!identifyRes.ok) {
          throw new Error("Plant identification failed");
        }

        const data = await identifyRes.json();
        
        if (data.result?.is_plant?.binary) {
          const suggestions = data.result.classification.suggestions.slice(0, 3);
          const topMatch = suggestions[0];
          
          // Build context message for Gemini
          let contextMessage = `I just analyzed a plant photo using Plant.id API. Here's what I found:\n\n`;
          contextMessage += `Primary identification: ${topMatch.name}`;
          if (topMatch.details?.common_names?.length > 0) {
            contextMessage += ` (commonly known as: ${topMatch.details.common_names.slice(0, 3).join(", ")})`;
          }
          contextMessage += `\nConfidence: ${Math.round(topMatch.probability * 100)}%\n`;
          
          if (topMatch.details?.taxonomy) {
            const tax = topMatch.details.taxonomy;
            contextMessage += `\nTaxonomy:`;
            if (tax.family) contextMessage += `\n- Family: ${tax.family}`;
            if (tax.genus) contextMessage += `\n- Genus: ${tax.genus}`;
          }
          
          if (suggestions.length > 1) {
            contextMessage += `\n\nAlternative possibilities:`;
            suggestions.slice(1).forEach((alt: any, idx: number) => {
              contextMessage += `\n${idx + 2}. ${alt.name} (${Math.round(alt.probability * 100)}% confidence)`;
            });
          }
          
          // Send identification context to Gemini via chat API
          const chatResponse = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: contextMessage,
              userId: user?.id,
            }),
          });
          
          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            
            // Add Gemini's response (which now has context about the plant)
            const assistantMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: chatData.message,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages((prev) => [...prev, assistantMsg]);
          } else {
            // Fallback if chat API fails
            let responseContent = `Great photo! 📸 I've identified this plant:\n\n`;
            responseContent += `**${topMatch.name}**\n`;
            responseContent += `Confidence: ${Math.round(topMatch.probability * 100)}%\n\n`;
            
            if (topMatch.details?.common_names?.length > 0) {
              responseContent += `Common names: ${topMatch.details.common_names.slice(0, 3).join(", ")}\n\n`;
            }
            
            if (suggestions.length > 1) {
              responseContent += `It could also be:\n`;
              suggestions.slice(1).forEach((alt: any, idx: number) => {
                responseContent += `${idx + 2}. ${alt.name} (${Math.round(alt.probability * 100)}%)\n`;
              });
              responseContent += `\n`;
            }
            
            responseContent += `Would you like to add this to Clorofil? Tell me which bed it's in, or I can help you create a new bed!`;

            const assistantMsg: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: responseContent,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setMessages((prev) => [...prev, assistantMsg]);
          }
        } else {
          throw new Error("Not a plant image");
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Photo processing error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message.includes("not configured")
          ? "Plant identification requires PLANTID_API_KEY to be configured. For now, you can describe your plant and I'll help you catalog it!"
          : "I had trouble identifying that plant. Could you describe it for me? What does it look like?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <Sprout className="h-8 w-8 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Setting up your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-display font-semibold" data-testid="text-app-title">
              Garden Catalog
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className={cn(location === "/" && "bg-accent")}
                data-testid="nav-chat-desktop"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </Link>
            <Link href="/beds">
              <Button
                variant="ghost"
                size="sm"
                className={cn(location === "/beds" && "bg-accent")}
                data-testid="nav-beds-desktop"
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Beds
              </Button>
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

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
          {chatMutation.isPending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        onUploadPhoto={() => setShowPhotoUpload(true)}
        disabled={chatMutation.isPending}
      />

      <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Plant Photo</DialogTitle>
          </DialogHeader>
          <PhotoUpload onPhotoSelect={handlePhotoUpload} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
