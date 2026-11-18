"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { copy } from "@/data/copy";
import type { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { RecipeFullscreen } from "./RecipeFullscreen";

interface ResultListProps {
  heading: React.ReactNode;
  recipes: Recipe[] | null;
  savedIds: Set<string>;
  onToggleSave: (recipe: Recipe) => void;
  emptyMessage?: string;
}

export function ResultList({
  heading,
  recipes,
  savedIds,
  onToggleSave,
  emptyMessage = copy.noResults,
}: ResultListProps) {
  const [fullscreen, setFullscreen] = useState<Recipe | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b px-4 py-3">
        <p className="text-sm text-muted-foreground">{heading}</p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {recipes?.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {emptyMessage}
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
          {/* backlink required by the spoonacular free plan */}
          {recipes?.some((r) => r.source === "spoonacular") && (
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Recipe data from{" "}
              <a
                href="https://spoonacular.com/food-api"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                spoonacular
              </a>
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
