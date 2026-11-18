import { ClockIcon, UsersIcon } from "lucide-react";
import type { Recipe } from "@/types";

export function RecipeMeta({ recipe }: { recipe: Recipe }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {!!recipe.totalMinutes && (
        <span className="flex items-center gap-1">
          <ClockIcon className="size-3.5" />
          {recipe.totalMinutes} min
        </span>
      )}
      {!!recipe.servings && (
        <span className="flex items-center gap-1">
          <UsersIcon className="size-3.5" />
          {recipe.servings}
        </span>
      )}
      {recipe.author && <span>by {recipe.author}</span>}
    </div>
  );
}
