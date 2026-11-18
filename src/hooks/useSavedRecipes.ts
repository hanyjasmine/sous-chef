"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { listSaved, saveRecipe, unsaveRecipe } from "@/lib/api";
import type { Recipe } from "@/types";
import { useAuth } from "./useAuth";

interface SavedState {
  userId: string;
  recipes: Recipe[];
}

export function useSavedRecipes() {
  const { user } = useAuth();
  const [state, setState] = useState<SavedState | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listSaved()
      .then((recipes) => {
        if (!cancelled) setState({ userId: user.id, recipes });
      })
      .catch(() => {
        if (!cancelled) toast.error("Couldn't load your saved recipes");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ignore a list that belongs to a previous user
  const recipes = user && state?.userId === user.id ? state.recipes : null;
  const savedIds = useMemo(
    () => new Set(recipes?.map((r) => r.id) ?? []),
    [recipes],
  );

  const update = useCallback(
    (change: (prev: Recipe[]) => Recipe[]) =>
      setState((prev) =>
        prev ? { ...prev, recipes: change(prev.recipes) } : prev,
      ),
    [],
  );

  const save = useCallback(
    async (recipe: Recipe) => {
      update((prev) =>
        prev.some((r) => r.id === recipe.id) ? prev : [recipe, ...prev],
      );
      try {
        await saveRecipe(recipe.id);
        toast.success(`Saved ${recipe.title}`);
      } catch {
        update((prev) => prev.filter((r) => r.id !== recipe.id));
        toast.error("Couldn't save that recipe");
      }
    },
    [update],
  );

  const unsave = useCallback(
    async (recipe: Recipe) => {
      update((prev) => prev.filter((r) => r.id !== recipe.id));
      try {
        await unsaveRecipe(recipe.id);
      } catch {
        update((prev) => [recipe, ...prev]);
        toast.error("Couldn't remove that recipe");
      }
    },
    [update],
  );

  return { recipes, savedIds, save, unsave };
}
