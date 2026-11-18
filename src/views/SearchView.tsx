"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ChatPanel } from "@/components/chat";
import { NavBar } from "@/components/navigation";
import { ResultList } from "@/components/results";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAuth } from "@/hooks/useAuth";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { ApiError, getSearchSession } from "@/lib/api";
import { takePendingAction } from "@/lib/pendingAction";
import type { ChatMessage, Recipe, SearchSession } from "@/types";

interface SearchViewProps {
  params: Promise<{ sessionId: string }>;
}

export function SearchView({ params }: SearchViewProps) {
  const { sessionId } = use(params);
  const { t } = useTranslation();
  const { user, requireAuth } = useAuth();
  const { recipes: savedRecipes, savedIds, save, unsave } = useSavedRecipes();

  const [session, setSession] = useState<SearchSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [mobileTab, setMobileTab] = useState<"results" | "chat">("results");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSearchSession(sessionId)
      .then((s) => {
        if (cancelled) return;
        setSession(s);
        // the query is the first message, sous greets back
        setMessages([
          { id: "q", role: "user", content: s.query },
          { id: "greet", role: "assistant", content: t("chat.greeting", { query: s.query }) },
        ]);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e instanceof ApiError && e.status === 404
            ? t("search.sessionExpired")
            : t("search.sessionLoadFailed"),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, t]);

  function handleSend(text: string) {
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
    setPending(true);
    // canned reply until /chat streams from sous-svc
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: t("chat.mockReply") },
      ]);
      setPending(false);
    }, 600);
  }

  // finish a save the user started as a guest, once they're back from google
  useEffect(() => {
    if (!user || !session || savedRecipes === null) return;
    const pending = takePendingAction();
    if (pending?.kind !== "save") return;
    const recipe = session.recipes.find((r) => r.id === pending.recipeId);
    if (recipe && !savedIds.has(recipe.id)) save(recipe);
  }, [user, session, savedRecipes, savedIds, save]);

  function handleToggleSave(recipe: Recipe) {
    requireAuth(
      () => (savedIds.has(recipe.id) ? unsave(recipe) : save(recipe)),
      { kind: "save", recipeId: recipe.id },
    );
  }

  const results = (
    <ResultList
      heading={
        session ? (
          <Trans
            i18nKey="search.heading"
            count={session.recipes.length}
            values={{ query: session.query }}
            components={{ query: <span className="text-foreground" /> }}
          />
        ) : (
          t("search.searching")
        )
      }
      recipes={session?.recipes ?? null}
      savedIds={savedIds}
      onToggleSave={handleToggleSave}
    />
  );
  const chat = (
    <ChatPanel messages={messages} pending={pending} onSend={handleSend} />
  );

  if (error) {
    return (
      <div className="flex h-dvh flex-col">
        <NavBar />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="max-w-sm text-muted-foreground">{error}</p>
          <Button nativeButton={false} render={<Link href="/" />}>
            {t("search.startNew")}
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <NavBar />

      {/* desktop: side by side, resizable */}
      <div className="hidden min-h-0 flex-1 md:flex">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="55%" minSize="35%">
            {results}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="45%" minSize="30%">
            {chat}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* mobile: tab between results and chat */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <div className="flex shrink-0 gap-1 border-b p-2">
          {(["results", "chat"] as const).map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={mobileTab === tab ? "secondary" : "ghost"}
              className="flex-1"
              onClick={() => setMobileTab(tab)}
            >
              {t(`search.tabs.${tab}`)}
            </Button>
          ))}
        </div>
        <div className="min-h-0 flex-1">
          {mobileTab === "results" ? results : chat}
        </div>
      </div>
    </div>
  );
}
