"use client";

import { ArrowUpIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  disabled?: boolean;
  onSend: (text: string) => void;
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  function send() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="flex items-end gap-2 border-t p-3"
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          // enter sends, shift+enter adds a newline
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
        placeholder="Add details or change direction…"
        rows={1}
        className="max-h-40 min-h-10 resize-none"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!text.trim() || disabled}
        aria-label="Send"
      >
        <ArrowUpIcon />
      </Button>
    </form>
  );
}
