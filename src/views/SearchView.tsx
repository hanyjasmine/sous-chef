"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
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
import { useChat } from "@/hooks/useChat";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { ApiError, cacheSession, getResults, getSearchSession } from "@/lib/api";
import { takePendingAction } from "@/lib/pendingAction";
import type { Recipe, ResultsPage, SearchSession } from "@/types";

interface SearchViewProps {
  params: Promise<{ sessionId: string }>;
}

export function SearchView({ params }: SearchViewProps) {
  const { sessionId } = use(params);
  const { t } = useTranslation();
  const { user, requireAuth } = useAuth();
  const { recipes: savedRecipes, savedIds, save, unsave } = useSavedRecipes();

  const [session, setSession] = useState<SearchSession | null>(null);
  const [mobileTab, setMobileTab] = useState<"results" | "chat">("results");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  // bumps when chat swaps the results, so stale pages get dropped
  const [resultsVersion, setResultsVersion] = useState(0);
  const versionRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    getSearchSession(sessionId)
      .then((s) => {
        if (!cancelled) setSession(s);
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

  // write through so back/forward and reloads show the latest view
  useEffect(() => {
    if (session) cacheSession(session);
  }, [session]);

  const handleResults = useCallback((page: ResultsPage) => {
    versionRef.current += 1;
    setResultsVersion(versionRef.current);
    setSession((s) => s && { ...s, ...page });
  }, []);

  const { messages, pending, send } = useChat(
    sessionId,
    session?.query ?? null,
    handleResults,
  );

  async function loadMore() {
    if (!session || session.nextCursor === null || loadingMore) return;
    const version = versionRef.current;
    setLoadingMore(true);
    try {
      const page = await getResults(sessionId, session.nextCursor);
      if (version !== versionRef.current) return;
      setSession((s) => {
        if (!s) return s;
        const seen = new Set(s.recipes.map((r) => r.id));
        const fresh = page.recipes.filter((r) => !seen.has(r.id));
        return { ...s, ...page, recipes: [...s.recipes, ...fresh] };
      });
    } catch {
      toast.error(t("search.loadMoreFailed"));
    } finally {
      setLoadingMore(false);
    }
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
      key={resultsVersion}
      heading={
        session ? (
          <Trans
            i18nKey={session.narrowed ? "search.headingNarrowed" : "search.heading"}
            count={session.total}
            values={{ query: session.query, pool: session.poolSize }}
            components={{ query: <span className="text-foreground" /> }}
          />
        ) : (
          t("search.searching")
        )
      }
      recipes={session?.recipes ?? null}
      savedIds={savedIds}
      onToggleSave={handleToggleSave}
      hasMore={session?.nextCursor != null}
      loadingMore={loadingMore}
      onLoadMore={loadMore}
    />
  );
  const chat = <ChatPanel messages={messages} pending={pending} onSend={send} />;

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
