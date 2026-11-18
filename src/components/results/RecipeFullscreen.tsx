"use client";

import { ExternalLinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Recipe } from "@/types";
import { RecipeMeta } from "./RecipeMeta";
import { RecipeThumbnail } from "./RecipeThumbnail";
import { useTranslation } from "react-i18next";

interface RecipeFullscreenProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export function RecipeFullscreen({ recipe, onClose }: RecipeFullscreenProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={recipe !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[min(90dvh,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        {recipe && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-6 p-6">
              {/* image stays small enough that spoonacular's 636px source renders sharp */}
              <div className="flex flex-col gap-5 sm:flex-row-reverse sm:items-start">
                <RecipeThumbnail
                  recipe={recipe}
                  className="aspect-video w-full rounded-2xl sm:mr-10 sm:aspect-4/3 sm:w-60"
                  sizes="(min-width: 640px) 240px, 100vw"
                />
                <DialogHeader className="min-w-0 flex-1 gap-2">
                  <DialogTitle className="font-heading text-2xl">
                    {recipe.title}
                  </DialogTitle>
                  <RecipeMeta recipe={recipe} />
                  <DialogDescription>{recipe.summary}</DialogDescription>
                </DialogHeader>
              </div>

              <div className="grid gap-8 md:grid-cols-[1fr_1.6fr]">
                <section>
                  <h3 className="mb-2 font-heading text-lg">{t("recipe.ingredients")}</h3>
                  <ul className="flex list-disc flex-col gap-1.5 pl-5 text-base marker:text-highlight">
                    {recipe.ingredients.map((ing, i) => (
                      // spoonacular can list an ingredient twice (e.g. split across sauce and topping)
                      <li key={`${i}-${ing.name}`}>
                        {ing.quantity && (
                          <span className="font-medium">{ing.quantity} </span>
                        )}
                        {ing.name}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="mb-2 font-heading text-lg">{t("recipe.steps")}</h3>
                  <ol className="flex flex-col gap-3 text-base leading-relaxed">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>

              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  {t("recipe.viewOriginal")}
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
