"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { listSaved, saveRecipe, unsaveRecipe } from "@/lib/api";
import type { Recipe } from "@/types";
import { useAuth } from "./useAuth";
import { useTranslation } from "react-i18next";

interface SavedState {
  userId: string;
  recipes: Recipe[];
}

export function useSavedRecipes() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [state, setState] = useState<SavedState | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listSaved()
      .then((recipes) => {
        if (!cancelled) setState({ userId: user.id, recipes });
      })
      .catch(() => {
        if (!cancelled) toast.error(t("saved.loadFailed"));
      });
    return () => {
      cancelled = true;
    };
  }, [user, t]);

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
        toast.success(t("saved.saved", { title: recipe.title }));
      } catch {
        update((prev) => prev.filter((r) => r.id !== recipe.id));
        toast.error(t("saved.saveFailed"));
      }
    },
    [update, t],
  );

  const unsave = useCallback(
    async (recipe: Recipe) => {
      update((prev) => prev.filter((r) => r.id !== recipe.id));
      try {
        await unsaveRecipe(recipe.id);
      } catch {
        update((prev) => [recipe, ...prev]);
        toast.error(t("saved.removeFailed"));
      }
    },
    [update, t],
  );

  return { recipes, savedIds, save, unsave };
}
