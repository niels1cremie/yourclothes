import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import confetti from "canvas-confetti";

import { useSubscription } from "@/context/SubscriptionContext";
import { PLAN_TO_TIER, type PlanId } from "@/lib/subscription";
import { CheckoutModal } from "@/components/CheckoutModal";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — MIRROR" },
      { name: "description", content: "Choose the MIRROR plan that fits your wardrobe. Free, Pro Monthly, and Pro Yearly options." },
      { property: "og:title", content: "Pricing — MIRROR" },
      { property: "og:description", content: "Choose the MIRROR plan that fits your wardrobe." },
    ],
  }),
  component: Pricing,
});

const plans: Array<{
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  note?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}> = [
  {
    id: "free",
    name: "Atelier",
    tagline: "Begin your wardrobe.",
    price: "$0",
    cadence: "forever",
    features: [
      "Up to 30 wardrobe items",
      "Basic body & color analysis",
      "3 outfit suggestions per week",
      "Community style inspiration",
    ],
    cta: "Current plan",
  },
  {
    id: "pro_monthly",
    name: "Couture",
    tagline: "For the daily dresser.",
    price: "$9",
    cadence: "per month",
    note: "7-day free trial",
    features: [
      "Unlimited wardrobe items",
      "Advanced AI styling",
      "Daily outfits around your calendar",
      "Seasonal capsule planning",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    id: "pro_yearly",
    name: "Couture Annual",
    tagline: "Two months on us.",
    price: "$90",
    cadence: "per year",
    note: "Save 17% · 14-day free trial",
    features: [
      "Everything in Couture",
      "Exclusive seasonal lookbooks",
      "Early access to new features",
      "Wardrobe export & backup",
    ],
    cta: "Start free trial",
  },
];

function Pricing() {
  const navigate = useNavigate();
  const { tier, setTier } = useSubscription();
  const [checkoutPlan, setCheckoutPlan] = useState<PlanId | null>(null);
  const [processing, setProcessing] = useState(false);

  const activePlan = plans.find((p) => p.id === checkoutPlan) ?? null;

  const handleCtaClick = (planId: PlanId) => {
    if (planId === "free") {
      void setTier("atelier");
      return;
    }
    setCheckoutPlan(planId);
  };

  const fireConfetti = () => {
    const burst = (originX: number) =>
      confetti({
        particleCount: 90,
        spread: 70,
        startVelocity: 45,
        origin: { x: originX, y: 0.7 },
        colors: ["#C8A96A", "#0A0A0A", "#F7F5F2", "#8C6E3F"],
      });
    burst(0.25);
    burst(0.5);
    burst(0.75);
  };

  const confirmPayment = async () => {
    if (!activePlan) return;
    setProcessing(true);
    // Simulated authorization delay.
    await new Promise((resolve) => window.setTimeout(resolve, 1600));
    await setTier(PLAN_TO_TIER[activePlan.id]);
    setProcessing(false);
    setCheckoutPlan(null);
    fireConfetti();
    void navigate({ to: "/wardrobe", search: { welcome: true } });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <header className="text-center">
          <Link
            to="/"
            className="text-xs"
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.3em",
              color: "var(--color-muted-foreground)",
            }}
          >
            ← MIRROR
          </Link>
          <h1
            className="mt-6 text-5xl leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Plans
          </h1>
          <div className="mx-auto mt-3 h-px w-12" style={{ background: "var(--color-gold)" }} />
          <p
            className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Quietly tailored to how often you dress with intention.
          </p>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = PLAN_TO_TIER[plan.id] === tier;
            return (
              <article
                key={plan.id}
                className={`flex flex-col rounded-2xl border p-6 transition-colors ${
                  plan.highlight ? "border-foreground/30" : "border-foreground/10"
                }`}
                style={{ background: "var(--color-card, transparent)" }}
              >
                {plan.highlight && (
                  <span
                    className="self-start rounded-full px-2 py-1 text-[10px]"
                    style={{
                      fontFamily: "var(--font-label)",
                      letterSpacing: "0.2em",
                      background: "var(--color-gold)",
                      color: "var(--color-ink)",
                    }}
                  >
                    MOST CHOSEN
                  </span>
                )}
                <h2
                  className="mt-4 text-2xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                    {plan.price}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    {plan.cadence}
                  </span>
                </div>
                {plan.note && (
                  <p
                    className="mt-1 text-[11px]"
                    style={{
                      fontFamily: "var(--font-label)",
                      letterSpacing: "0.15em",
                      color: "var(--color-gold)",
                    }}
                  >
                    {plan.note.toUpperCase()}
                  </p>
                )}

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span
                        className="mt-2 inline-block h-1 w-3 flex-none"
                        style={{ background: "var(--color-gold)" }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleCtaClick(plan.id)}
                  disabled={isCurrent}
                  className="pill-button mt-8 w-full"
                  style={isCurrent ? { opacity: 0.6 } : undefined}
                >
                  {isCurrent ? "Huidig plan ✓" : plan.cta}
                </button>
              </article>
            );
          })}
        </section>

        {activePlan && (
          <CheckoutModal
            open={Boolean(activePlan)}
            tier={PLAN_TO_TIER[activePlan.id]}
            price={activePlan.price}
            cadence={activePlan.cadence}
            processing={processing}
            onClose={() => setCheckoutPlan(null)}
            onConfirm={() => void confirmPayment()}
          />
        )}

        <footer
          className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px]"
          style={{
            fontFamily: "var(--font-label)",
            letterSpacing: "0.2em",
            color: "var(--color-muted-foreground)",
          }}
        >
          <Link to="/privacy">PRIVACY</Link>
          <Link to="/terms">TERMS</Link>
          <Link to="/cookies">COOKIES</Link>
          <Link to="/refunds">REFUNDS</Link>
        </footer>
      </div>
    </main>
  );
}
