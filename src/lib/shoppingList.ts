import type { Recipe } from "@/types";

export interface ShoppingItem {
  name: string;
  quantity: string | null;
  aisle: string | null;
  // salt, pepper, water and the like start unchecked
  staple: boolean;
}

export interface AisleGroup {
  aisle: string | null;
  items: { item: ShoppingItem; index: number }[];
}

const STAPLE =
  /^(?:(?:kosher|sea|table|flaky|coarse|fine)\s+)?salt$|^(?:(?:freshly\s+)?(?:ground|cracked)\s+)?(?:black\s+)?pepper(?:corns)?$|^salt\s+(?:and|&)\s+(?:black\s+)?pepper$|^(?:cold|warm|hot|boiling|ice|lukewarm)?\s*water$|^ice(?: cubes)?$|^(?:nonstick\s+)?cooking spray$/;

function isStaple(name: string): boolean {
  const core = name
    .toLowerCase()
    .split(",")[0]
    .replace(/\b(?:to taste|as needed|for serving|optional)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return STAPLE.test(core);
}

// one line per ingredient name, repeated ones merged
export function shoppingItems(recipe: Recipe): ShoppingItem[] {
  const byName = new Map<string, ShoppingItem>();
  for (const ing of recipe.ingredients) {
    const key = ing.name.trim().toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      if (ing.quantity) {
        existing.quantity = existing.quantity ? `${existing.quantity} + ${ing.quantity}` : ing.quantity;
      }
      continue;
    }
    byName.set(key, {
      name: ing.name.trim(),
      quantity: ing.quantity ?? null,
      aisle: ing.aisle ?? null,
      staple: isStaple(ing.name),
    });
  }
  return [...byName.values()];
}

// aisles in recipe order, unknown aisle last
export function groupByAisle(items: ShoppingItem[]): AisleGroup[] {
  const groups = new Map<string | null, AisleGroup>();
  items.forEach((item, index) => {
    const group = groups.get(item.aisle) ?? { aisle: item.aisle, items: [] };
    group.items.push({ item, index });
    groups.set(item.aisle, group);
  });
  const other = groups.get(null);
  groups.delete(null);
  return other ? [...groups.values(), other] : [...groups.values()];
}

export function aisleLabel(aisle: string): string {
  return aisle.charAt(0).toUpperCase() + aisle.slice(1);
}

export function shoppingText(
  recipe: Recipe,
  items: ShoppingItem[],
  picked: Set<number>,
  labels: { heading: string; other: string },
): string {
  const groups = groupByAisle(items)
    .map((g) => ({ ...g, items: g.items.filter(({ index }) => picked.has(index)) }))
    .filter((g) => g.items.length > 0);
  // headings only help when there's more than one aisle
  const showAisles = groups.length > 1 || (groups.length === 1 && groups[0].aisle !== null);

  const lines = [labels.heading];
  for (const group of groups) {
    lines.push("");
    if (showAisles) lines.push(group.aisle ? aisleLabel(group.aisle) : labels.other);
    for (const { item } of group.items) {
      lines.push(`• ${item.quantity ? `${item.quantity} ` : ""}${item.name}`);
    }
  }
  if (recipe.sourceUrl) lines.push("", recipe.sourceUrl);
  return lines.join("\n");
}

// "?&body=" is the form both ios and android accept
export function smsHref(text: string): string {
  return `sms:?&body=${encodeURIComponent(text)}`;
}
