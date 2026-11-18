"use client";

import { CopyIcon, MessageCircleIcon, ShareIcon, ShoppingCartIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  aisleLabel,
  groupByAisle,
  shoppingItems,
  shoppingText,
  smsHref,
} from "@/lib/shoppingList";
import type { Recipe } from "@/types";
import { useTranslation } from "react-i18next";

interface ShoppingListButtonProps {
  recipe: Recipe;
  variant?: "outline" | "ghost" | "secondary";
}

export function ShoppingListButton({ recipe, variant = "outline" }: ShoppingListButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant={variant} onClick={() => setOpen(true)}>
        <ShoppingCartIcon data-icon="inline-start" />
        {t("recipe.shoppingList")}
      </Button>
      <DialogContent className="flex max-h-[min(85dvh,44rem)] flex-col gap-4 sm:max-w-md">
        {/* mounted per open so the checklist starts fresh each time */}
        {open && <ShoppingList recipe={recipe} />}
      </DialogContent>
    </Dialog>
  );
}

function ShoppingList({ recipe }: { recipe: Recipe }) {
  const { t } = useTranslation();
  const items = useMemo(() => shoppingItems(recipe), [recipe]);
  const groups = useMemo(() => groupByAisle(items), [items]);
  const [picked, setPicked] = useState(
    () => new Set(items.flatMap((item, i) => (item.staple ? [] : [i]))),
  );
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const showAisles = groups.some((g) => g.aisle !== null);

  const text = shoppingText(recipe, items, picked, {
    heading: t("shopping.messageHeading", { title: recipe.title }),
    other: t("shopping.otherAisle"),
  });
  const empty = picked.size === 0;

  function toggle(index: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("shopping.copied"));
    } catch {
      toast.error(t("shopping.copyFailed"));
    }
  }

  async function share() {
    try {
      await navigator.share({ title: recipe.title, text });
    } catch (err) {
      // closing the share sheet isn't a failure
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error(t("shopping.shareFailed"));
    }
  }

  return (
    <>
      <DialogHeader className="pr-8">
        <DialogTitle className="font-heading text-xl">{t("shopping.title")}</DialogTitle>
        <DialogDescription>{t("shopping.hint", { title: recipe.title })}</DialogDescription>
      </DialogHeader>

      <ScrollArea className="-mx-2 min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-2">
          {groups.map((group) => (
            <section key={group.aisle ?? "other"}>
              {showAisles && (
                <h3 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {group.aisle ? aisleLabel(group.aisle) : t("shopping.otherAisle")}
                </h3>
              )}
              <ul className="flex flex-col">
                {group.items.map(({ item, index }) => {
                  const on = picked.has(index);
                  return (
                    <li key={index}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg px-1 py-1.5 hover:bg-muted">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(index)}
                          className="mt-0.5 size-4 shrink-0 accent-primary"
                        />
                        <span className={cn("text-sm", !on && "text-muted-foreground line-through")}>
                          {item.quantity && <span className="font-medium">{item.quantity} </span>}
                          {item.name}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </ScrollArea>

      <DialogFooter className="flex-row flex-wrap gap-2 sm:justify-end">
        <Button size="sm" variant="ghost" onClick={copy} disabled={empty}>
          <CopyIcon data-icon="inline-start" />
          {t("shopping.copy")}
        </Button>
        {canShare && (
          <Button size="sm" variant="outline" onClick={share} disabled={empty}>
            <ShareIcon data-icon="inline-start" />
            {t("shopping.share")}
          </Button>
        )}
        {/* opens the user's own messages app with the list filled in */}
        <a
          href={empty ? undefined : smsHref(text)}
          aria-disabled={empty}
          className={cn(
            buttonVariants({ size: "sm" }),
            empty && "pointer-events-none opacity-50",
          )}
        >
          <MessageCircleIcon data-icon="inline-start" />
          {t("shopping.text")}
        </a>
      </DialogFooter>
    </>
  );
}
