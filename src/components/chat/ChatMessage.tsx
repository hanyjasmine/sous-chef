import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

const bubble = "max-w-[85%] rounded-2xl animate-bubble";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          bubble,
          "px-4 py-2.5 text-base leading-relaxed whitespace-pre-wrap",
          isUser
            ? "origin-bottom-right rounded-br-md bg-primary text-primary-foreground"
            : "origin-bottom-left rounded-bl-md bg-muted",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

export function TypingBubble() {
  const { t } = useTranslation();

  return (
    <div className="flex justify-start" role="status" aria-label={t("chat.typing")}>
      <div
        className={cn(
          bubble,
          "flex origin-bottom-left items-center gap-1.5 rounded-bl-md bg-muted px-4 py-4",
        )}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-typing rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}
