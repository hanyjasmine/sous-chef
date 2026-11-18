"use client";

import { BookmarkIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types";
import { RecipeMeta } from "./RecipeMeta";
import { RecipePreview } from "./RecipePreview";
import { RecipeThumbnail } from "./RecipeThumbnail";
import { useTranslation } from "react-i18next";

interface RecipeCardProps {
  recipe: Recipe;
  saved: boolean;
  onToggleSave: (recipe: Recipe) => void;
  onOpenFullscreen: (recipe: Recipe) => void;
}

export function RecipeCard({
  recipe,
  saved,
  onToggleSave,
  onOpenFullscreen,
}: RecipeCardProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/card rounded-2xl border bg-card transition-colors hover:border-foreground/20"
    >
      {/* whole header toggles the preview; the buttons stop propagation */}
      <div
        className="flex cursor-pointer gap-3 p-3"
        onClick={() => {
          // don't toggle when the user is selecting text
          if (window.getSelection()?.toString()) return;
          setOpen((o) => !o);
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="line-clamp-2 font-heading leading-snug font-medium">
            {recipe.title}
          </h3>
          <RecipeMeta recipe={recipe} />
          <div className="flex min-w-0 flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <RecipeThumbnail recipe={recipe} className="size-20" />
        <div className="-my-1 -mr-1 flex shrink-0 flex-col items-center justify-between">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={saved ? t("recipe.unsave") : t("recipe.save")}
            aria-pressed={saved}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(recipe);
            }}
          >
            <BookmarkIcon className={cn(saved && "fill-current")} />
          </Button>
          <CollapsibleTrigger
            onClick={(e) => e.stopPropagation()}
            render={
              <Button variant="ghost" size="icon-sm" aria-label={t("recipe.preview")} />
            }
          >
            <ChevronDownIcon className="transition-transform group-data-[open]/card:rotate-180" />
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        <RecipePreview
          recipe={recipe}
          onOpenFullscreen={() => onOpenFullscreen(recipe)}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
