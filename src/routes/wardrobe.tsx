import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Crown, Sparkles, Wand2 } from "lucide-react";

import { useSubscription } from "@/context/SubscriptionContext";
import { TIER_LABELS } from "@/lib/subscription";
import { fetchWardrobe, type WardrobeItem } from "@/lib/wardrobe";
import { WARDROBE_CATEGORIES, type WardrobeCategory } from "@/lib/wardrobe-categories";

interface WardrobeSearch {
  welcome?: true;
}

export const Route = createFileRoute("/wardrobe")({
  validateSearch: (search: Record<string, unknown>): WardrobeSearch => {
    const welcome = search.welcome === true || search.welcome === "true";
    return welcome ? { welcome: true } : {};
  },
  head: () => ({
    meta: [
      { title: "Garderobe — MIRROR" },
      {
        name: "description",
        content: "Je AI-getagde digitale kledingkast, georganiseerd per categorie.",
      },
    ],
  }),
  component: Wardrobe,
});

type TabValue = "Alle" | WardrobeCategory;

function Wardrobe() {
  const { welcome } = Route.useSearch();
  const { tier, isAtLeast } = useSubscription();
  const [tab, setTab] = useState<TabValue>("Alle");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["wardrobe"],
    queryFn: fetchWardrobe,
  });

  const visible = tab === "Alle" ? items : items.filter((i) => i.category === tab);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <header className="flex items-center justify-between">
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
          <span
            className="rounded-full px-3 py-1 text-[10px]"
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.2em",
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            }}
          >
            {TIER_LABELS[tier].toUpperCase()}
          </span>
        </header>

        {welcome && (
          <div
            className="mt-6 flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{
              background: "color-mix(in oklab, var(--color-gold) 18%, var(--color-surface))",
              border: "1px solid var(--color-gold)",
            }}
          >
            <Crown className="h-5 w-5" style={{ color: "var(--color-gold)" }} />
            <div>
              <p className="text-sm font-medium">Welkom bij {TIER_LABELS[tier]}.</p>
              <p className="text-[12px] text-muted-foreground">
                Je premium garderobe is ontgrendeld. Veel plezier met onbeperkt stylen.
              </p>
            </div>
          </div>
        )}

        <h1 className="mt-8 text-5xl leading-none" style={{ fontFamily: "var(--font-display)" }}>
          Garderobe
        </h1>
        <div className="mt-3 h-px w-12" style={{ background: "var(--color-gold)" }} />

        <ProSegment unlocked={isAtLeast("pro")} />

        {/* Category tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(["Alle", ...WARDROBE_CATEGORIES] as TabValue[]).map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={active ? "chip chip-active" : "chip"}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Items */}
        <section className="mt-6">
          {isLoading ? (
            <GridSkeleton />
          ) : visible.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {visible.map((item) => (
                <WardrobeCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProSegment({ unlocked }: { unlocked: boolean }) {
  if (unlocked) {
    return (
      <div
        className="mt-8 rounded-3xl p-6"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--color-gold) 22%, var(--color-surface)), var(--color-surface))",
          border: "1px solid var(--color-gold)",
        }}
      >
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" style={{ color: "var(--color-gold)" }} />
          <span
            className="text-[10px]"
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.25em",
              color: "var(--color-gold)",
            }}
          >
            COUTURE ANNUAL
          </span>
        </div>
        <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          AI Outfit Generator &amp; Personal Stylist Consultation
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Laat MIRROR complete looks samenstellen uit je garderobe en boek een één-op-één consult
          met je persoonlijke AI-stylist.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="pill-button">
            <Sparkles className="h-4 w-4" />
            Genereer outfit
          </button>
          <button type="button" className="pill-ghost">
            Boek stylist-consult
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mt-8 overflow-hidden rounded-3xl p-6"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 animate-pulse"
        style={{
          background:
            "linear-gradient(120deg, transparent, color-mix(in oklab, var(--color-gold) 22%, transparent), transparent)",
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5" style={{ color: "var(--color-gold)" }} />
          <span
            className="text-[10px]"
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.25em",
              color: "var(--color-gold)",
            }}
          >
            EXCLUSIEF VOOR COUTURE ANNUAL
          </span>
        </div>
        <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--font-display)" }}>
          AI Outfit Generator &amp; Personal Stylist Consultation
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Ontgrendel automatische outfitcreatie en een persoonlijk stylist-consult met het
          jaarabonnement.
        </p>
        <Link to="/pricing" className="pill-button mt-5">
          <Sparkles className="h-4 w-4" />
          Upgrade naar Couture Annual
        </Link>
      </div>
    </div>
  );
}

function WardrobeCard({ item }: { item: WardrobeItem }) {
  return (
    <article className="editorial-card overflow-hidden">
      <div
        className="aspect-square w-full overflow-hidden"
        style={{ background: "var(--color-secondary)" }}
      >
        <img src={item.image_url} alt={item.category} className="h-full w-full object-cover" />
      </div>
      <div className="p-3">
        <span
          className="text-[10px]"
          style={{
            fontFamily: "var(--font-label)",
            letterSpacing: "0.18em",
            color: "var(--color-gold)",
          }}
        >
          {item.category.toUpperCase()}
        </span>
        <p className="mt-1 text-sm font-medium">{item.style}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {item.color} · {item.fabric}
        </p>
      </div>
    </article>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="editorial-card overflow-hidden">
          <div
            className="aspect-square w-full animate-pulse"
            style={{ background: "var(--color-secondary)" }}
          />
          <div className="space-y-2 p-3">
            <div
              className="h-2 w-1/2 animate-pulse rounded"
              style={{ background: "var(--color-secondary)" }}
            />
            <div
              className="h-3 w-3/4 animate-pulse rounded"
              style={{ background: "var(--color-secondary)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-3xl p-10 text-center"
      style={{ background: "var(--color-surface)", border: "1px dashed var(--color-border)" }}
    >
      <Sparkles className="mx-auto h-6 w-6" style={{ color: "var(--color-gold)" }} />
      <h2 className="mt-3 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
        Nog geen stukken
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Scan je eerste kledingstukken tijdens de onboarding en ze verschijnen hier, netjes getagd
        per categorie.
      </p>
      <Link to="/onboarding" className="pill-button mt-5">
        Start AI-scan
      </Link>
    </div>
  );
}
