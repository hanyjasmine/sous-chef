"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ApiError, getMessages, streamChat } from "@/lib/api";
import type { ChatMessage, ResultsPage } from "@/types";

// outlives strict mode remounts so a session only gets greeted once
const greeted = new Set<string>();

type ChatBody = { greet: true } | { message: string };

export function useChat(
  sessionId: string,
  query: string | null,
  onResults: (page: ResultsPage) => void,
) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const onResultsRef = useRef(onResults);

  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  const run = useCallback(
    async (body: ChatBody) => {
      setPending(true);
      try {
        await streamChat(sessionId, body, (event) => {
          if (event.type === "message") {
            // swap the typing bubble for the reply in one render
            setPending(false);
            setMessages((m) => [
              ...m,
              { id: crypto.randomUUID(), role: "assistant", content: event.content },
            ]);
          } else if (event.type === "results") {
            onResultsRef.current(event.page);
          } else if (event.type === "error") {
            toast.error(event.message);
          }
        });
      } catch (e) {
        if (e instanceof ApiError && e.code === "already_started") {
          // another tab greeted first, show what it said
          setMessages(await getMessages(sessionId).catch(() => []));
        } else {
          toast.error(e instanceof ApiError ? e.message : t("chat.failed"));
        }
      } finally {
        setPending(false);
      }
    },
    [sessionId, t],
  );

  // load the conversation, or open it with the original query
  useEffect(() => {
    if (query === null) return;
    let cancelled = false;
    getMessages(sessionId)
      .then((history) => {
        if (cancelled) return;
        if (history.length > 0) {
          setMessages(history);
          return;
        }
        if (greeted.has(sessionId)) return;
        greeted.add(sessionId);
        setMessages([{ id: "query", role: "user", content: query }]);
        void run({ greet: true });
      })
      .catch(() => {
        if (!cancelled) toast.error(t("chat.loadFailed"));
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, query, run, t]);

  const send = useCallback(
    (text: string) => {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "user", content: text },
      ]);
      void run({ message: text });
    },
    [run],
  );

  return { messages, pending, send };
}
