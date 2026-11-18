"use client";

import { SignInButtons } from "@/components/auth";
import { NavBar } from "@/components/navigation";
import { ResultList } from "@/components/results";
import { Skeleton } from "@/components/ui/skeleton";
import { copy } from "@/data/copy";
import { useAuth } from "@/hooks/useAuth";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import type { Recipe } from "@/types";

export function SavedView() {
  const { user, ready } = useAuth();
  const { recipes, savedIds, save, unsave } = useSavedRecipes();

  function handleToggle(recipe: Recipe) {
    if (savedIds.has(recipe.id)) unsave(recipe);
    else save(recipe);
  }

  return (
    <div className="flex h-dvh flex-col">
      <NavBar />
      {!ready ? (
        <div className="mx-auto w-full max-w-3xl p-4">
          <Skeleton className="h-[106px] rounded-2xl" />
        </div>
      ) : !user ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="max-w-sm text-muted-foreground">{copy.savedSignedOut}</p>
          <div className="w-full max-w-xs">
            <SignInButtons />
          </div>
        </main>
      ) : (
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
          <ResultList
            heading={
              recipes
                ? `${recipes.length} saved ${recipes.length === 1 ? "recipe" : "recipes"}`
                : "Loading saved recipes…"
            }
            recipes={recipes}
            savedIds={savedIds}
            onToggleSave={handleToggle}
            emptyMessage={copy.savedEmpty}
          />
        </div>
      )}
    </div>
  );
}
