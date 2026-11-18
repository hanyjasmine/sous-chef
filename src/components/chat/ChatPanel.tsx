"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType } from "@/types";
import { ChatInput } from "./ChatInput";
import { ChatMessage, TypingBubble } from "./ChatMessage";

interface ChatPanelProps {
  messages: ChatMessageType[];
  pending?: boolean;
  onSend: (text: string) => void;
}

export function ChatPanel({ messages, pending, onSend }: ChatPanelProps) {
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
        {pending && <TypingBubble />}
        <div ref={bottomRef} />
      </div>
      <ChatInput disabled={pending} onSend={onSend} />
    </div>
  );
}
