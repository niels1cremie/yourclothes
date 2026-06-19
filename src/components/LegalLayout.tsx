import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
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

        <header className="mt-8">
          <h1 className="text-5xl leading-none" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h1>
          <div className="mt-3 h-px w-12" style={{ background: "var(--color-gold)" }} />
          {updated && (
            <p
              className="mt-4 text-[11px]"
              style={{
                fontFamily: "var(--font-label)",
                letterSpacing: "0.2em",
                color: "var(--color-muted-foreground)",
              }}
            >
              {updated.toUpperCase()}
            </p>
          )}
        </header>

        <article className="legal-prose mt-10 space-y-4 text-[15px] leading-relaxed">
          {children}
        </article>

        <footer
          className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]"
          style={{
            fontFamily: "var(--font-label)",
            letterSpacing: "0.2em",
            color: "var(--color-muted-foreground)",
          }}
        >
          <Link to="/pricing">PRICING</Link>
          <Link to="/privacy">PRIVACY</Link>
          <Link to="/terms">TERMS</Link>
          <Link to="/cookies">COOKIES</Link>
          <Link to="/refunds">REFUNDS</Link>
          <Link to="/dpa">DPA</Link>
          <Link to="/privacy-rights">YOUR RIGHTS</Link>
        </footer>
      </div>
    </main>
  );
}
