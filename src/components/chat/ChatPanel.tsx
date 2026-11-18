"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType } from "@/types";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { useTranslation } from "react-i18next";

interface ChatPanelProps {
  messages: ChatMessageType[];
  pending?: boolean;
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, pending, onSend }: ChatPanelProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  // keep the latest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {pending && (
          <div className="flex gap-1 px-2 py-3" aria-label={t("chat.typing")}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput disabled={pending} onSend={onSend} />
    </div>
  );
}
