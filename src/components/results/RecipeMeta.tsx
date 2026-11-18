import { ClockIcon, UsersIcon } from "lucide-react";
import type { Recipe } from "@/types";
import { useTranslation } from "react-i18next";

export function RecipeMeta({ recipe }: { recipe: Recipe }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {!!recipe.totalMinutes && (
        <span className="flex items-center gap-1">
          <ClockIcon className="size-3.5" />
          {t("recipe.minutes", { count: recipe.totalMinutes })}
        </span>
      )}
      {!!recipe.servings && (
        <span className="flex items-center gap-1">
          <UsersIcon className="size-3.5" />
          {recipe.servings}
        </span>
      )}
      {recipe.author && <span>{t("recipe.byAuthor", { author: recipe.author })}</span>}
    </div>
  );
}
