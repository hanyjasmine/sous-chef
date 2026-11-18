import { Maximize2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Recipe } from "@/types";
import { useTranslation } from "react-i18next";
import { ShoppingListButton } from "./ShoppingListButton";

const PREVIEW_INGREDIENTS = 5;

interface RecipePreviewProps {
  recipe: Recipe;
  onOpenFullscreen: () => void;
}

export function RecipePreview({ recipe, onOpenFullscreen }: RecipePreviewProps) {
  const { t } = useTranslation();
  const extra = recipe.ingredients.length - PREVIEW_INGREDIENTS;

  return (
    <div className="flex flex-col gap-3 px-3 pb-3">
      <Separator />
      <p className="text-sm text-muted-foreground">{recipe.summary}</p>
      <div>
        <h4 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("recipe.ingredients")}
        </h4>
        <ul className="list-disc pl-5 text-sm marker:text-highlight">
          {recipe.ingredients.slice(0, PREVIEW_INGREDIENTS).map((ing, i) => (
            <li key={`${i}-${ing.name}`}>
              {ing.quantity && (
                <span className="text-muted-foreground">{ing.quantity} </span>
              )}
              {ing.name}
            </li>
          ))}
          {extra > 0 && (
            <li className="list-none text-muted-foreground">{t("recipe.moreIngredients", { count: extra })}</li>
          )}
        </ul>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onOpenFullscreen}>
          <Maximize2Icon data-icon="inline-start" />
          {t("recipe.fullRecipe")}
        </Button>
        <ShoppingListButton recipe={recipe} />
      </div>
    </div>
  );
}
