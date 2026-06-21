import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Clock,
  ShieldCheck,
  Sparkles,
  Shirt,
} from "lucide-react";
import heroImage from "@/assets/welcome-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIRROR | Jouw Digitale Kledingkast" },
      {
        name: "description",
        content:
          "Een AI-stylist voor je kleding. Bouw je digitale kast, plan outfits en ontdek je stijl-DNA.",
      },
      { property: "og:title", content: "MIRROR | Jouw Digitale Kledingkast" },
      {
        property: "og:description",
        content:
          "Een AI-stylist voor je kleding. Bouw je digitale kast, plan outfits en ontdek je stijl-DNA.",
      },
    ],
  }),
  component: Welcome,
});

const FEATURE_CARDS = [
  {
    title: "Stijl-DNA",
    description:
      "Analyseer je silhouet, kleurtype en voorkeuren in een rustige, persoonlijke intake.",
    icon: Sparkles,
    accent: "bg-gold/10 text-gold",
  },
  {
    title: "Digitale kast",
    description:
      "Upload kledingstukken en laat MIRROR kleur, categorie en stijl automatisch herkennen.",
    icon: Camera,
    accent: "bg-secondary text-foreground",
  },
  {
    title: "Outfit planning",
    description:
      "Krijg combinaties die passen bij je week, budget en gelegenheden — zonder stress.",
    icon: CalendarDays,
    accent: "bg-gold/10 text-gold",
  },
  {
    title: "Privé by design",
    description:
      "Je voortgang wordt veilig en alleen lokaal op je apparaat opgeslagen.",
    icon: ShieldCheck,
    accent: "bg-secondary text-foreground",
  },
] as const;

const STATS = [
  { value: "7", label: "Stappen" },
  { value: "4 min", label: "Intake" },
  { value: "AI", label: "Styling" },
] as const;

function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    const isCompleted = localStorage.getItem("onboarding_completed");
    if (!isCompleted) {
      navigate({ to: "/onboarding" });
    }
  }, [navigate]);

  return (
    <main className="page-gradient min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="sticky top-0 z-20 -mx-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex items-center justify-between py-4 sm:py-5">
            <Link
              to="/"
              className="text-sm text-foreground transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-label)", letterSpacing: "0.24em" }}
            >
              MIRROR
            </Link>
            <nav
              className="flex items-center gap-4 text-[10px] text-muted-foreground sm:gap-6"
              style={{ fontFamily: "var(--font-label)", letterSpacing: "0.18em" }}
            >
              <Link
                to="/pricing"
                className="rounded-full px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
              >
                PRIJZEN
              </Link>
              <Link
                to="/planner"
                className="rounded-full px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
              >
                PLANNER
              </Link>
              <Link
                to="/insights"
                className="rounded-full px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
              >
                INZICHTEN
              </Link>
              <Link
                to="/wardrobe"
                className="rounded-full px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
              >
                KAST
              </Link>
              <Link
                to="/profile"
                className="rounded-full px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
              >
                PROFIEL
              </Link>
              <Link to="/onboarding" className="pill-button pill-button-sm hidden sm:inline-flex">
                Begin
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="grid flex-1 items-center gap-12 pb-12 pt-8 sm:gap-14 sm:pb-16 sm:pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.72fr)] lg:gap-20 lg:pb-20">
          <div className="order-2 flex flex-col lg:order-1">
            <p
              className="text-[10px] text-muted-foreground"
              style={{ fontFamily: "var(--font-label)", letterSpacing: "0.28em" }}
            >
              AI STYLIST · DIGITALE KLEDINGKAST
            </p>

            <h1 className="mt-4 max-w-2xl text-[3.25rem] leading-[0.92] tracking-tight sm:mt-5 sm:text-[5rem] lg:text-[6.5rem]">
              Minder zoeken.
              <br />
              <span className="text-muted-foreground">Beter dragen.</span>
            </h1>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-px w-12 bg-gold sm:w-16" />
              <p
                className="text-[10px] text-gold"
                style={{ fontFamily: "var(--font-label)", letterSpacing: "0.2em" }}
              >
                PREMIUM BETA
              </p>
            </div>

            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:mt-8 sm:text-lg sm:leading-8">
              Een stille, persoonlijke stylist voor wat je al hebt en wat je nog zoekt. Ontdek je
              stijl-DNA, bouw je digitale kast en plan outfits rondom je echte week.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <Link to="/onboarding" className="pill-button min-h-12 w-full px-8 text-center sm:w-auto">
                Begin met onboarding
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/wardrobe" className="pill-ghost min-h-12 w-full px-8 text-center sm:w-auto">
                <Shirt className="h-4 w-4" />
                Bekijk kledingkast
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                ± 4 minuten
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-gold" />
                7 rustige stappen
              </span>
            </div>

            {/* Stats — desktop inline, mobile row */}
            <div className="mt-10 grid grid-cols-3 gap-3 sm:max-w-sm">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/70 bg-surface/60 px-4 py-3 text-center backdrop-blur-sm"
                >
                  <p className="text-2xl leading-none sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                    {value}
                  </p>
                  <p
                    className="mt-1 text-[9px] text-muted-foreground"
                    style={{ fontFamily: "var(--font-label)", letterSpacing: "0.15em" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface shadow-lift sm:rounded-[2rem]">
              <img
                src={heroImage}
                alt="Warme editorial foto van kleding op een hanger"
                width={832}
                height={1216}
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/6] lg:aspect-[3/4]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent p-5 sm:p-7">
                <div className="flex items-end justify-between gap-4 text-white">
                  <div>
                    <p
                      className="text-[10px] opacity-75"
                      style={{ fontFamily: "var(--font-label)", letterSpacing: "0.22em" }}
                    >
                      VOL. I — EDITORIAL
                    </p>
                    <p
                      className="mt-1.5 text-xl leading-tight sm:text-2xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Jouw kledingkast, digitaal.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/90 px-3 py-1.5 text-[9px] text-ink backdrop-blur-sm">
                    BETA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pb-14 sm:pb-20">
          <div className="mb-8 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className="text-[10px] text-muted-foreground"
                style={{ fontFamily: "var(--font-label)", letterSpacing: "0.24em" }}
              >
                WAT MIRROR DOET
              </p>
              <h2 className="mt-2 text-3xl leading-tight sm:text-4xl lg:text-5xl">
                Alles voor je stijl, op één plek.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground sm:text-right">
              Vier kernfuncties die samen je persoonlijke stylist vormen.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {FEATURE_CARDS.map(({ title, description, icon: Icon, accent }) => (
              <article key={title} className="feature-card group flex flex-col p-6 sm:p-7">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-300 group-hover:bg-ink group-hover:text-primary-foreground ${accent}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-xl leading-tight sm:text-2xl">{title}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
                <div className="mt-5 h-px w-8 bg-gold/60 transition-all duration-300 group-hover:w-12" />
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-10 overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface px-6 py-8 shadow-soft sm:rounded-[2rem] sm:px-10 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <p
              className="text-[10px] text-muted-foreground"
              style={{ fontFamily: "var(--font-label)", letterSpacing: "0.22em" }}
            >
              KLAAR VOOR JE STIJL-DNA?
            </p>
            <h2 className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Begin met zeven rustige stappen.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Geen account nodig om te starten. Je voortgang blijft bewaard tijdens de intake.
            </p>
          </div>
          <Link
            to="/onboarding"
            className="pill-button mt-6 w-full min-h-12 lg:mt-0 lg:w-auto lg:shrink-0 lg:px-10"
          >
            Start onboarding
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Footer */}
        <footer
          className="safe-bottom flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-6 text-[10px] text-muted-foreground sm:pb-8"
          style={{ fontFamily: "var(--font-label)", letterSpacing: "0.18em" }}
        >
          <Link to="/privacy" className="rounded px-1 transition-colors hover:text-foreground">
            PRIVACY
          </Link>
          <span aria-hidden>·</span>
          <Link to="/terms" className="rounded px-1 transition-colors hover:text-foreground">
            VOORWAARDEN
          </Link>
          <span aria-hidden>·</span>
          <Link to="/cookies" className="rounded px-1 transition-colors hover:text-foreground">
            COOKIES
          </Link>
          <span aria-hidden>·</span>
          <Link to="/refunds" className="rounded px-1 transition-colors hover:text-foreground">
            TERUGBETALINGEN
          </Link>
        </footer>
      </div>
    </main>
  );
}
