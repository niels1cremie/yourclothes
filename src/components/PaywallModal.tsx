import { Link } from "@tanstack/react-router";
import { Lock, X } from "lucide-react";

// Elegant blurred paywall used when a free-tier action hits its limit.
export function PaywallModal({
  open,
  onClose,
  title,
  message,
  ctaLabel = "Upgrade naar Couture",
  ctaTo = "/pricing",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaTo?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: "color-mix(in oklab, var(--color-ink) 35%, transparent)" }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-sm rounded-3xl p-7 text-center shadow-2xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluiten"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "var(--color-gold)", color: "var(--color-ink)" }}
        >
          <Lock className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-2xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h2>

        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{message}</p>

        <Link to={ctaTo} className="pill-button mt-6 w-full">
          {ctaLabel}
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-[11px]"
          style={{
            fontFamily: "var(--font-label)",
            letterSpacing: "0.2em",
            color: "var(--color-muted-foreground)",
          }}
        >
          MISSCHIEN LATER
        </button>
      </div>
    </div>
  );
}
