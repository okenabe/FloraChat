import { ChatMessage } from "../ChatMessage";

export default function ChatMessageExample() {
  return (
    <div className="space-y-4 p-4 max-w-4xl mx-auto">
      <ChatMessage
        role="assistant"
        content="Hi! 👋 I'm your AI garden assistant. I can help you catalog your plants by identifying them from photos or just chatting about what's in your garden."
        timestamp="2:34 PM"
      />
      <ChatMessage
        role="user"
        content="I have some lavender and rosemary in my herb garden"
        timestamp="2:35 PM"
      />
      <ChatMessage
        role="assistant"
        content="Nice! 🌿 Lavender and rosemary are great together - both love sun and don't need much water. Let me set this up for you."
        timestamp="2:35 PM"
      />
    </div>
  );
}
