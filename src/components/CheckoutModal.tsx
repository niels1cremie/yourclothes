import { useState } from "react";
import { CreditCard, Lock, X } from "lucide-react";

import { TIER_LABELS, type SubscriptionTier } from "@/lib/subscription";

// Simulated checkout — authorizes a fake card, no real payment is processed.
export function CheckoutModal({
  open,
  tier,
  price,
  cadence,
  processing,
  onClose,
  onConfirm,
}: {
  open: boolean;
  tier: SubscriptionTier;
  price: string;
  cadence: string;
  processing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12 / 28");
  const [cvc, setCvc] = useState("123");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Test checkout"
    >
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: "color-mix(in oklab, var(--color-ink) 40%, transparent)" }}
        onClick={processing ? undefined : onClose}
      />

      <div
        className="relative w-full max-w-sm rounded-3xl p-7 shadow-2xl"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        {!processing && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluiten"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <span
          className="text-[10px]"
          style={{
            fontFamily: "var(--font-label)",
            letterSpacing: "0.25em",
            color: "var(--color-gold)",
          }}
        >
          TEST CHECKOUT
        </span>
        <h2 className="mt-2 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          {TIER_LABELS[tier]}
        </h2>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            {price}
          </span>
          <span className="text-xs text-muted-foreground">{cadence}</span>
        </div>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="text-[11px] text-muted-foreground">Kaartnummer</span>
            <div
              className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
              }}
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <input
                value={card}
                onChange={(e) => setCard(e.target.value)}
                disabled={processing}
                className="w-full bg-transparent text-sm outline-none"
                inputMode="numeric"
              />
            </div>
          </label>

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="text-[11px] text-muted-foreground">Vervaldatum</span>
              <input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                disabled={processing}
                className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border)",
                }}
              />
            </label>
            <label className="block w-24">
              <span className="text-[11px] text-muted-foreground">CVC</span>
              <input
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                disabled={processing}
                className="mt-1 w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border)",
                }}
              />
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={processing}
          className="pill-button mt-6 w-full"
        >
          {processing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Autorisatie…
            </>
          ) : (
            "Bevestig Test Betaling"
          )}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3" />
          Gesimuleerde betaling · er wordt niets in rekening gebracht
        </p>
      </div>
    </div>
  );
}
