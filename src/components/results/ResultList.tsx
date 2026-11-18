"use client";

import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { RecipeFullscreen } from "./RecipeFullscreen";

interface ResultListProps {
  heading: React.ReactNode;
  recipes: Recipe[] | null;
  savedIds: Set<string>;
  onToggleSave: (recipe: Recipe) => void;
  emptyMessage?: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export function ResultList({
  heading,
  recipes,
  savedIds,
  onToggleSave,
  emptyMessage,
  hasMore,
  loadingMore,
  onLoadMore,
}: ResultListProps) {
  const { t } = useTranslation();
  const [fullscreen, setFullscreen] = useState<Recipe | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // fetch the next page as the end of the list scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMoreRef.current?.();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b px-4 py-3">
        <p className="text-sm text-muted-foreground">{heading}</p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {recipes?.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {emptyMessage ?? t("search.noResults")}
            </p>
          )}
          {recipes
            ? recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  saved={savedIds.has(recipe.id)}
                  onToggleSave={onToggleSave}
                  onOpenFullscreen={setFullscreen}
                />
              ))
            : Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-[106px] rounded-2xl" />
              ))}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-2">
              {loadingMore ? (
                <Skeleton className="h-[106px] w-full rounded-2xl" />
              ) : (
                <Button variant="ghost" size="sm" onClick={onLoadMore}>
                  {t("search.loadMore")}
                </Button>
              )}
            </div>
          )}
          {/* backlink required by the spoonacular free plan */}
          {recipes?.some((r) => r.source === "spoonacular") && (
            <p className="pt-2 text-center text-xs text-muted-foreground">
              <Trans
                i18nKey="search.attribution"
                components={{
                  link: (
                    <a
                      href="https://spoonacular.com/food-api"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    />
                  ),
                }}
              />
            </p>
          )}
        </div>
      </ScrollArea>
      <RecipeFullscreen
        recipe={fullscreen}
        onClose={() => setFullscreen(null)}
      />
    </div>
  );
}
