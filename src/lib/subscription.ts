// MIRROR — subscription tiers shared between the context, pricing checkout,
// feature gating and the persistence layer.

export type SubscriptionTier = "atelier" | "couture" | "pro";

export const SUBSCRIPTION_TIERS: readonly SubscriptionTier[] = [
  "atelier",
  "couture",
  "pro",
] as const;

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  atelier: "Atelier",
  couture: "Couture",
  pro: "Couture Annual",
};

export const TIER_DESCRIPTIONS: Record<SubscriptionTier, string> = {
  atelier: "Gratis — tot 3 AI-scans",
  couture: "Premium maandelijks — onbeperkte AI-scans",
  pro: "Jaarlijks — alles, inclusief AI Outfit Generator",
};

// Higher number = more access. Used for `isAtLeast` gating checks.
const TIER_RANK: Record<SubscriptionTier, number> = {
  atelier: 0,
  couture: 1,
  pro: 2,
};

export function tierRank(tier: SubscriptionTier): number {
  return TIER_RANK[tier];
}

export function isTierAtLeast(current: SubscriptionTier, required: SubscriptionTier): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}

export function isSubscriptionTier(value: string): value is SubscriptionTier {
  return (SUBSCRIPTION_TIERS as readonly string[]).includes(value);
}

// Free tier may scan at most this many wardrobe items.
export const FREE_SCAN_LIMIT = 3;

// Pricing plan ids (src/routes/pricing.tsx) mapped to subscription tiers.
export type PlanId = "free" | "pro_monthly" | "pro_yearly";

export const PLAN_TO_TIER: Record<PlanId, SubscriptionTier> = {
  free: "atelier",
  pro_monthly: "couture",
  pro_yearly: "pro",
};
