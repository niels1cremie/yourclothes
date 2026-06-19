import { useState } from "react";
import { FlaskConical, X } from "lucide-react";

import { useSubscription } from "@/context/SubscriptionContext";
import {
  SUBSCRIPTION_TIERS,
  TIER_DESCRIPTIONS,
  TIER_LABELS,
  type SubscriptionTier,
} from "@/lib/subscription";

// Floating developer-only control to switch the active subscription tier on the
// fly. Rendered exclusively in development builds.
export function DevSandboxController() {
  if (process.env.NODE_ENV !== "development") return null;
  return <DevSandboxPanel />;
}

function DevSandboxPanel() {
  const { tier, source, setTier } = useSubscription();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Dev Sandbox Controller"
        className="fixed bottom-5 right-5 z-[100] flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{ background: "var(--color-ink)", color: "var(--color-primary-foreground)" }}
      >
        <FlaskConical className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] w-72 rounded-2xl p-4 shadow-2xl"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px]"
          style={{
            fontFamily: "var(--font-label)",
            letterSpacing: "0.2em",
            color: "var(--color-gold)",
          }}
        >
          DEV SANDBOX
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close Dev Sandbox Controller"
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Wissel direct van abonnement om feature-gating te testen.
        <br />
        Bron: <span style={{ color: "var(--color-foreground)" }}>{source}</span>
      </p>

      <div className="mt-3 flex flex-col gap-1.5">
        {SUBSCRIPTION_TIERS.map((t: SubscriptionTier) => {
          const active = t === tier;
          return (
            <button
              key={t}
              type="button"
              onClick={() => void setTier(t)}
              className="rounded-lg px-3 py-2 text-left transition-colors"
              style={{
                background: active ? "var(--color-ink)" : "var(--color-surface-elevated)",
                color: active ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span className="block text-[13px] font-medium">{TIER_LABELS[t]}</span>
              <span
                className="block text-[10px]"
                style={{
                  color: active
                    ? "var(--color-primary-foreground)"
                    : "var(--color-muted-foreground)",
                }}
              >
                {TIER_DESCRIPTIONS[t]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
