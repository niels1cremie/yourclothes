import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";
import { isTierAtLeast, type SubscriptionTier } from "@/lib/subscription";
import { loadSubscription, persistSubscription } from "@/lib/subscription-store";

type TierSource = "database" | "local" | "default";

interface SubscriptionContextValue {
  tier: SubscriptionTier;
  source: TierSource;
  isLoading: boolean;
  /** Persists the tier (DB when signed in, always localStorage) and updates state. */
  setTier: (tier: SubscriptionTier) => Promise<void>;
  /** True when the active tier meets or exceeds `required`. */
  isAtLeast: (required: SubscriptionTier) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<SubscriptionTier>("atelier");
  const [source, setSource] = useState<TierSource>("default");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const sync = () => {
      loadSubscription()
        .then((result) => {
          if (!active) return;
          setTierState(result.tier);
          setSource(result.source);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    };

    sync();

    const { data } = supabase.auth.onAuthStateChange(() => sync());
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const setTier = useCallback(async (next: SubscriptionTier) => {
    setTierState(next);
    const result = await persistSubscription(next);
    setSource(result.source);
  }, []);

  const isAtLeast = useCallback(
    (required: SubscriptionTier) => isTierAtLeast(tier, required),
    [tier],
  );

  const value = useMemo<SubscriptionContextValue>(
    () => ({ tier, source, isLoading, setTier, isAtLeast }),
    [tier, source, isLoading, setTier, isAtLeast],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return ctx;
}
