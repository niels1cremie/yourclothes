import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "./auth";
import { isSubscriptionTier, type SubscriptionTier } from "./subscription";

// Persists the active tier to Supabase `user_subscriptions` when a user is
// signed in, and always mirrors it to localStorage so the UI survives reloads
// and remains functional for anonymous visitors (no login UI exists yet).

const STORAGE_KEY = "mirror.subscription.tier";

function readLocalTier(): SubscriptionTier | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw && isSubscriptionTier(raw)) return raw;
  return null;
}

function writeLocalTier(tier: SubscriptionTier): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, tier);
}

export interface LoadedSubscription {
  tier: SubscriptionTier;
  source: "database" | "local" | "default";
}

export async function loadSubscription(): Promise<LoadedSubscription> {
  const userId = await getCurrentUserId();

  if (userId) {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("tier")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data && isSubscriptionTier(data.tier)) {
      writeLocalTier(data.tier);
      return { tier: data.tier, source: "database" };
    }
  }

  const local = readLocalTier();
  if (local) return { tier: local, source: "local" };

  return { tier: "atelier", source: "default" };
}

export async function persistSubscription(tier: SubscriptionTier): Promise<LoadedSubscription> {
  writeLocalTier(tier);

  const userId = await getCurrentUserId();
  if (!userId) return { tier, source: "local" };

  const { error } = await supabase
    .from("user_subscriptions")
    .upsert(
      { user_id: userId, tier, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );

  return { tier, source: error ? "local" : "database" };
}
