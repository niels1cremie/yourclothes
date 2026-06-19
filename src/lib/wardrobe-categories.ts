// Canonical wardrobe categories (Dutch tab labels) shared by the scanner and
// the wardrobe UI. Kept free of client-only imports so the server scanner
// function can use it too.

export const WARDROBE_CATEGORIES = [
  "Bovenkleding",
  "Onderkleding",
  "Jassen",
  "Schoenen",
  "Accessoires",
] as const;

export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];

export function isWardrobeCategory(value: string): value is WardrobeCategory {
  return (WARDROBE_CATEGORIES as readonly string[]).includes(value);
}
