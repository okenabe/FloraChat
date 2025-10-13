import { ChatInput } from "../ChatInput";

export default function ChatInputExample() {
  return (
    <div className="h-40">
      <ChatInput
        onSendMessage={(msg) => console.log("Send message:", msg)}
        onUploadPhoto={() => console.log("Upload photo clicked")}
      />
    </div>
  );
}
