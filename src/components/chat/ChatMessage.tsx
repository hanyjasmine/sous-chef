import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-base leading-relaxed whitespace-pre-wrap",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
