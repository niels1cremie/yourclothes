import { createFileRoute, Link } from "@tanstack/react-router";
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

function Welcome() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
        {/* Header strip */}
        <header className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-4">
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-label)",
                letterSpacing: "0.3em",
                color: "var(--color-muted-foreground)",
              }}
            >
              EST. 2026
            </span>
            <Link
              to="/wardrobe"
              className="text-xs"
              style={{
                fontFamily: "var(--font-label)",
                letterSpacing: "0.3em",
                color: "var(--color-muted-foreground)",
              }}
            >
              MIJN KLEDINGKAST
            </Link>
          </div>
          <span
            className="text-xs"
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.3em",
              color: "var(--color-muted-foreground)",
            }}
          >
            VOL. I
          </span>
        </header>

        {/* Hero image */}
        <div className="relative mx-6 mt-6 overflow-hidden rounded-2xl">
          <img
            src={heroImage}
            alt="A cream cashmere sweater and tailored trousers on a wooden hanger in warm light"
            width={832}
            height={1216}
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span
              className="rounded-full px-3 py-1 text-[10px] backdrop-blur-md"
              style={{
                fontFamily: "var(--font-label)",
                letterSpacing: "0.2em",
                background: "rgba(255,255,255,0.85)",
                color: "var(--color-ink)",
              }}
            >
              AI · STYLE · PLANNER
            </span>
          </div>
        </div>

        {/* Wordmark + hero copy */}
        <div className="px-6 pt-10">
          <h1
            className="text-6xl leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            MIRROR
          </h1>
          <div className="mt-2 h-px w-12" style={{ background: "var(--color-gold)" }} />
          <p
            className="mt-5 text-[15px] leading-relaxed"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Een stille assistent voor wat je draagt.
            <br />
            Gebouwd rondom je lichaam, je kleuren en je week.
          </p>
        </div>

        {/* Value bullets */}
        <ul className="mt-8 space-y-3 px-6">
          {[
            "AI-lichaam- & kleuranalyse van twee foto’s",
            "Je garderobe, getagd en doorzoekbaar",
            "Dagelijkse outfits afgestemd op je agenda",
          ].map((line) => (
            <li
              key={line}
              className="flex items-start gap-3 text-sm"
              style={{ color: "var(--color-foreground)" }}
            >
              <span
                className="mt-2 inline-block h-1 w-3 flex-none"
                style={{ background: "var(--color-gold)" }}
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-auto px-6 pb-6 pt-10">
          <Link to="/onboarding" className="pill-button w-full">
            Ontdek je stijl
            <span aria-hidden>→</span>
          </Link>
          <p
            className="mt-4 text-center text-xs"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Duurt ongeveer 4 minuten · Je foto’s blijven privé
          </p>
        </div>

        <footer
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 pb-8 text-[10px]"
          style={{
            fontFamily: "var(--font-label)",
            letterSpacing: "0.2em",
            color: "var(--color-muted-foreground)",
          }}
        >
          <Link to="/pricing">PRIJZEN</Link>
          <span aria-hidden>·</span>
          <Link to="/privacy">PRIVACY</Link>
          <span aria-hidden>·</span>
          <Link to="/terms">VOORWAARDEN</Link>
          <span aria-hidden>·</span>
          <Link to="/cookies">COOKIES</Link>
          <span aria-hidden>·</span>
          <Link to="/refunds">TERUGBETALINGEN</Link>
        </footer>
      </div>
    </main>
  );
}
