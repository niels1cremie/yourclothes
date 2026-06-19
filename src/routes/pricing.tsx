import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Prijzen — MIRROR" },
      { name: "description", content: "Kies het MIRROR abonnement dat bij je garderobekast past. Gratis, Couture (€9/maand) en Pro Yearly (€79/jaar)." },
      { property: "og:title", content: "Prijzen — MIRROR" },
      { property: "og:description", content: "Kies het MIRROR abonnement dat bij je garderobekast past." },
    ],
  }),
  component: Pricing,
});

type PlanId = "free" | "pro_monthly" | "pro_yearly";

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
    tagline: "Begin je digitale garderobekast.",
    price: "€0",
    cadence: "altijd gratis",
    features: [
      "Tot 30 kledingstukken",
      "Basis lichaam- en kleuranalyse",
      "3 outfitsuggesties per week",
      "Community stijlinspiratie",
    ],
    cta: "Huidig abonnement",
  },
  {
    id: "pro_monthly",
    name: "Couture",
    tagline: "Voor de dagelijkse styliste.",
    price: "€9",
    cadence: "per maand",
    note: "7 dagen gratis uitproberen",
    features: [
      "Onbeperkte kledingstukken",
      "Geavanceerde AI styling",
      "Dagelijkse outfits rond je agenda",
      "Seizoensgebonden capsule planning",
      "Prioriteitsondersteuning",
    ],
    cta: "Gratis proberen",
    highlight: true,
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    tagline: "Twee maanden gratis.",
    price: "€79",
    cadence: "per jaar",
    note: "Bespaar 27% · 14 dagen gratis uitproberen",
    features: [
      "Alles uit Couture",
      "Exclusieve seizoensgebonden lookbooks",
      "Vroege toegang tot nieuwe functies",
      "Garderobe export & backup",
    ],
    cta: "Gratis proberen",
  },
];

function Pricing() {
  const [selected, setSelected] = useState<PlanId | null>(null);

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
            Abonnementen
          </h1>
          <div className="mx-auto mt-3 h-px w-12" style={{ background: "var(--color-gold)" }} />
          <p
            className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Subtiel afgestemd op hoe vaak je met doelbewustzijn je kleding kiest.
          </p>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selected === plan.id;
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
                    MEEST GEKOZEN
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
                  onClick={() => setSelected(plan.id)}
                  className="pill-button mt-8 w-full"
                  style={
                    plan.id === "free" && !isSelected
                      ? { opacity: 0.7 }
                      : undefined
                  }
                >
                  {isSelected ? "Geselecteerd ✓" : plan.cta}
                </button>
              </article>
            );
          })}
        </section>

        {selected && selected !== "free" && (
          <div
            className="mx-auto mt-8 max-w-xl rounded-2xl border border-foreground/10 p-5 text-center text-sm"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            MIRROR is momenteel in early access — alle abonnementen zijn gratis terwijl we de ervaring verbeteren. Je bent de eerste die ervan hoort wanneer betaalde abonnementen live gaan.
          </div>
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
          <Link to="/terms">VOORWAARDEN</Link>
          <Link to="/cookies">COOKIES</Link>
          <Link to="/refunds">TERUGBETALINGEN</Link>
        </footer>
      </div>
    </main>
  );
}
