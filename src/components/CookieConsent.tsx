import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "mirror.cookie_consent.v1";

type Preferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

function loadPrefs(): Preferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Preferences) : null;
  } catch {
    return null;
  }
}

function savePrefs(prefs: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent("mirror:consent-change", { detail: prefs }));
  } catch {
    /* ignore */
  }
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = loadPrefs();
    if (!existing) {
      setOpen(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
    const reopen = () => {
      const p = loadPrefs();
      if (p) {
        setAnalytics(p.analytics);
        setMarketing(p.marketing);
      }
      setShowCustomize(true);
      setOpen(true);
    };
    window.addEventListener("mirror:open-consent", reopen);
    return () => window.removeEventListener("mirror:open-consent", reopen);
  }, []);

  if (!open) return null;

  const commit = (a: boolean, m: boolean) => {
    savePrefs({
      necessary: true,
      analytics: a,
      marketing: m,
      decidedAt: new Date().toISOString(),
    });
    setOpen(false);
    setShowCustomize(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div
        className="mx-auto max-w-2xl rounded-2xl border border-foreground/15 p-5 shadow-2xl"
        style={{ background: "var(--color-background)" }}
      >
        <h2
          className="text-lg"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Cookies, tailored.
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          We use strictly necessary cookies to run MIRROR. With your permission
          we'd also use analytics to improve the experience. We don't use
          marketing cookies today, but the category is here for the day we
          might. See our <Link to="/cookies" className="underline">Cookie Policy</Link>.
        </p>

        {showCustomize && (
          <div className="mt-4 space-y-3">
            <Row
              title="Strictly necessary"
              desc="Required for sign-in, security, and core features. Always on."
              checked
              disabled
            />
            <Row
              title="Analytics"
              desc="Helps us understand how MIRROR is used so we can improve it."
              checked={analytics}
              onChange={setAnalytics}
            />
            <Row
              title="Marketing"
              desc="Not currently used. Reserved for future advertising features."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {!showCustomize && (
            <button
              type="button"
              onClick={() => setShowCustomize(true)}
              className="rounded-full border border-foreground/20 px-4 py-2 text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Customize
            </button>
          )}
          <button
            type="button"
            onClick={() => commit(false, false)}
            className="rounded-full border border-foreground/20 px-4 py-2 text-xs uppercase tracking-widest"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Reject non-essential
          </button>
          {showCustomize && (
            <button
              type="button"
              onClick={() => commit(analytics, marketing)}
              className="rounded-full px-4 py-2 text-xs uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-label)",
                background: "var(--color-foreground)",
                color: "var(--color-background)",
              }}
            >
              Save preferences
            </button>
          )}
          <button
            type="button"
            onClick={() => commit(true, true)}
            className="rounded-full px-4 py-2 text-xs uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-label)",
              background: "var(--color-gold, var(--color-foreground))",
              color: "var(--color-ink, var(--color-background))",
            }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-foreground/10 p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{desc}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4"
      />
    </label>
  );
}

export function openCookiePreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mirror:open-consent"));
  }
}
