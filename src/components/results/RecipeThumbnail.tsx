import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types";

interface RecipeThumbnailProps {
  recipe: Recipe;
  className?: string;
  sizes?: string;
}

export function RecipeThumbnail({
  recipe,
  className,
  sizes = "96px",
}: RecipeThumbnailProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-sunny/50 to-highlight/40",
        className,
      )}
    >
      {recipe.imageUrl ? (
        <Image
          src={recipe.imageUrl}
          alt=""
          fill
          sizes={sizes}
          // spoonacular tops out at 636px, re-encoding it through the optimizer only softens it
          unoptimized
          className="object-cover"
        />
      ) : (
        // placeholder until real images come from the provider
        <span className="absolute inset-0 grid place-items-center font-heading text-2xl text-foreground/50">
          {recipe.title[0]}
        </span>
      )}
    </div>
  );
}
