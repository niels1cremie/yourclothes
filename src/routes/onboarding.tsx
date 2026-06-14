import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to MIRROR — Set up your style" },
      {
        name: "description",
        content:
          "Tell MIRROR about your body, colors, wardrobe and goals. Seven quiet steps to your personal style DNA.",
      },
    ],
  }),
  component: Onboarding,
});

/* ------------------------------- types ---------------------------------- */

type Units = "metric" | "imperial";
type Region = "EU" | "US" | "UK";
type BodyShape =
  | "hourglass"
  | "pear"
  | "apple"
  | "rectangle"
  | "inverted-triangle"
  | "unsure";

interface OnboardingState {
  name: string;
  age: string;
  gender: string;
  styleTags: string[];
  units: Units;
  heightCm: string;
  weightKg: string;
  region: Region;
  size: string;
  bust: string;
  waist: string;
  hips: string;
  bodyShape: BodyShape;
  fullBodyPhoto: string | null;
  facePhoto: string | null;
  scanComplete: boolean;
  wardrobePhotos: string[];
  connectedBrands: string[];
  occasions: string[];
  budget: number;
  sustainable: boolean;
  capsule: boolean;
}

const initialState: OnboardingState = {
  name: "",
  age: "",
  gender: "",
  styleTags: [],
  units: "metric",
  heightCm: "",
  weightKg: "",
  region: "EU",
  size: "",
  bust: "",
  waist: "",
  hips: "",
  bodyShape: "unsure",
  fullBodyPhoto: null,
  facePhoto: null,
  scanComplete: false,
  wardrobePhotos: [],
  connectedBrands: [],
  occasions: [],
  budget: 150,
  sustainable: false,
  capsule: false,
};

const STEPS = [
  "Welcome",
  "About you",
  "Measurements",
  "Photo scan",
  "Your wardrobe",
  "Brands",
  "Style goals",
] as const;

/* ------------------------------- screen --------------------------------- */

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [s, setS] = useState<OnboardingState>(initialState);

  const update = <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1:
        return s.name.trim().length > 0 && s.gender.length > 0;
      case 2:
        return s.heightCm.length > 0;
      case 3:
        return s.scanComplete || (!!s.fullBodyPhoto && !!s.facePhoto);
      case 6:
        return s.occasions.length > 0;
      default:
        return true;
    }
  }, [step, s]);

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      // For now, route to a placeholder. The main app comes next iteration.
      navigate({ to: "/" });
    }
  };
  const back = () => (step > 0 ? setStep(step - 1) : navigate({ to: "/" }));

  return (
    <main className="h-[100dvh] overflow-hidden bg-background">
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between px-6 pt-4">
          <button
            onClick={back}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span
            className="truncate text-[10px]"
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.25em",
              color: "var(--color-muted-foreground)",
            }}
          >
            STEP {step + 1} OF {STEPS.length} · {STEPS[step].toUpperCase()}
          </span>
          <span className="h-9 w-9" />
        </header>

        {/* Progress */}
        <div className="mt-3 flex shrink-0 gap-1 px-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-[2px] flex-1 rounded-full transition-colors duration-500"
              style={{
                background:
                  i <= step ? "var(--color-gold)" : "var(--color-border)",
              }}
            />
          ))}
        </div>

        {/* Step body — fills remaining space, no page scroll */}
        <section className="flex min-h-0 flex-1 flex-col px-6 pt-4">
          {step === 0 && <StepWelcome />}
          {step === 1 && <StepBasics s={s} update={update} />}
          {step === 2 && <StepMeasurements s={s} update={update} />}
          {step === 3 && <StepScan s={s} update={update} />}
          {step === 4 && <StepWardrobe s={s} update={update} />}
          {step === 5 && <StepBrands s={s} update={update} />}
          {step === 6 && <StepGoals s={s} update={update} />}
        </section>

        {/* Footer CTA */}
        <div className="shrink-0 px-6 pb-5 pt-3">
          <button
            onClick={next}
            disabled={!canAdvance}
            className="pill-button w-full"
          >
            {step === STEPS.length - 1 ? "Enter MIRROR" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

/* =============================== STEPS ================================== */

function StepWelcome() {
  return (
    <div>
      <SectionTitle eyebrow="A new beginning" title="Let's build your digital wardrobe." />
      <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
        Seven short steps. We'll learn your body, your colors, what's already in
        your closet — then plan beautiful outfits around your week.
      </p>

      <div className="mt-8 space-y-3">
        {[
          { n: "01", t: "You", d: "Name, style tags, the basics." },
          { n: "02", t: "Body", d: "Measurements and a photo scan." },
          { n: "03", t: "Wardrobe", d: "Upload pieces — we tag them with AI." },
          { n: "04", t: "World", d: "Brands, calendar, weather, goals." },
        ].map((row) => (
          <div
            key={row.n}
            className="editorial-card flex items-baseline gap-4 px-5 py-4"
          >
            <span
              className="text-xs"
              style={{
                fontFamily: "var(--font-label)",
                letterSpacing: "0.2em",
                color: "var(--color-gold)",
              }}
            >
              {row.n}
            </span>
            <div>
              <h3
                className="text-xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {row.t}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{row.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- 1. Basics ---- */

const STYLE_TAGS = [
  "Casual",
  "Streetwear",
  "Minimalist",
  "Chic",
  "Business",
  "Sporty",
  "Bohemian",
  "Y2K",
  "Editorial",
  "Romantic",
];

const GENDER_OPTIONS = [
  "Woman",
  "Man",
  "Non-binary",
  "Prefer not to say",
];

function StepBasics({
  s,
  update,
}: {
  s: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const toggleTag = (t: string) =>
    update(
      "styleTags",
      s.styleTags.includes(t)
        ? s.styleTags.filter((x) => x !== t)
        : [...s.styleTags, t],
    );

  return (
    <div>
      <SectionTitle eyebrow="About you" title="Let's start with the basics." />

      <div className="mt-8 space-y-4">
        <FieldText
          label="First name"
          value={s.name}
          onChange={(v) => update("name", v)}
          placeholder="Your name"
        />
        <FieldText
          label="Age (optional)"
          value={s.age}
          onChange={(v) => update("age", v.replace(/\D/g, "").slice(0, 3))}
          placeholder="—"
          inputMode="numeric"
        />

        <FieldGroup label="Gender identity">
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => update("gender", g)}
                className={`chip ${s.gender === g ? "chip-active" : ""}`}
              >
                {g}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup
          label="Style tags"
          hint={`${s.styleTags.length} selected`}
        >
          <div className="flex flex-wrap gap-2">
            {STYLE_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`chip ${s.styleTags.includes(t) ? "chip-active" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </FieldGroup>
      </div>
    </div>
  );
}

/* ---- 2. Measurements ---- */

const BODY_SHAPES: { id: BodyShape; label: string; desc: string }[] = [
  { id: "hourglass", label: "Hourglass", desc: "Balanced bust & hips, defined waist" },
  { id: "pear", label: "Pear", desc: "Hips wider than shoulders" },
  { id: "apple", label: "Apple", desc: "Fuller midsection, slimmer legs" },
  { id: "rectangle", label: "Rectangle", desc: "Straight up and down" },
  { id: "inverted-triangle", label: "Inverted Triangle", desc: "Shoulders wider than hips" },
  { id: "unsure", label: "I'm not sure", desc: "The AI scan will tell us" },
];

function StepMeasurements({
  s,
  update,
}: {
  s: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  return (
    <div>
      <SectionTitle eyebrow="Measurements" title="A few proportions help us fit you." />

      {/* Unit toggle */}
      <div className="mt-6 inline-flex rounded-full border border-border bg-surface p-1">
        {(["metric", "imperial"] as Units[]).map((u) => (
          <button
            key={u}
            onClick={() => update("units", u)}
            className={`rounded-full px-4 py-1.5 text-[11px] ${
              s.units === u ? "bg-ink text-primary-foreground" : "text-muted-foreground"
            }`}
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              background: s.units === u ? "var(--color-ink)" : "transparent",
              color:
                s.units === u
                  ? "var(--color-primary-foreground)"
                  : "var(--color-muted-foreground)",
            }}
          >
            {u}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <FieldText
          label={s.units === "metric" ? "Height (cm)" : "Height (in)"}
          value={s.heightCm}
          onChange={(v) => update("heightCm", v.replace(/\D/g, "").slice(0, 3))}
          inputMode="numeric"
        />
        <FieldText
          label={s.units === "metric" ? "Weight (kg)" : "Weight (lb)"}
          value={s.weightKg}
          onChange={(v) => update("weightKg", v.replace(/\D/g, "").slice(0, 3))}
          inputMode="numeric"
        />
      </div>

      <FieldGroup label="Sizing region" className="mt-4">
        <div className="flex gap-2">
          {(["EU", "US", "UK"] as Region[]).map((r) => (
            <button
              key={r}
              onClick={() => update("region", r)}
              className={`chip flex-1 justify-center ${
                s.region === r ? "chip-active" : ""
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </FieldGroup>

      <div className="mt-4">
        <FieldText
          label={`Dress size (${s.region})`}
          value={s.size}
          onChange={(v) => update("size", v)}
          placeholder="e.g. 38"
        />
      </div>

      <details className="mt-4 editorial-card px-5 py-4">
        <summary
          className="cursor-pointer text-sm"
          style={{ fontFamily: "var(--font-label)", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Add bust / waist / hips
        </summary>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <FieldText label="Bust" value={s.bust} onChange={(v) => update("bust", v)} />
          <FieldText label="Waist" value={s.waist} onChange={(v) => update("waist", v)} />
          <FieldText label="Hips" value={s.hips} onChange={(v) => update("hips", v)} />
        </div>
      </details>

      <FieldGroup label="Body shape (you can change later)" className="mt-6">
        <div className="grid grid-cols-2 gap-2">
          {BODY_SHAPES.map((b) => (
            <button
              key={b.id}
              onClick={() => update("bodyShape", b.id)}
              className="rounded-2xl border p-4 text-left transition-colors"
              style={{
                borderColor:
                  s.bodyShape === b.id ? "var(--color-gold)" : "var(--color-border)",
                background:
                  s.bodyShape === b.id
                    ? "color-mix(in oklab, var(--color-gold) 8%, var(--color-surface))"
                    : "var(--color-surface)",
              }}
            >
              <div
                className="text-sm"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem" }}
              >
                {b.label}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {b.desc}
              </div>
            </button>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

/* ---- 3. Photo Scan ---- */

function StepScan({
  s,
  update,
}: {
  s: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const [scanning, setScanning] = useState(false);

  const onUpload =
    (which: "fullBodyPhoto" | "facePhoto") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      update(which, url);
    };

  const runScan = () => {
    setScanning(true);
    // Mocked AI for now — wired to Lovable AI Gateway in the next iteration.
    window.setTimeout(() => {
      setScanning(false);
      update("scanComplete", true);
    }, 2200);
  };

  if (s.scanComplete) {
    return <ScanResults />;
  }

  return (
    <div>
      <SectionTitle eyebrow="Photo scan" title="Two photos. The AI does the rest." />
      <p className="mt-4 text-sm text-muted-foreground">
        Your photos are analyzed for body shape, face shape, undertone and color
        season. They're never stored on third-party servers.
      </p>

      <div className="mt-8 space-y-4">
        <PhotoSlot
          letter="A"
          title="Full body"
          hint="Neutral pose · fitted clothing · good light"
          imageUrl={s.fullBodyPhoto}
          onUpload={onUpload("fullBodyPhoto")}
          onRemove={() => update("fullBodyPhoto", null)}
        />
        <PhotoSlot
          letter="B"
          title="Face close-up"
          hint="Natural light · no makeup if possible"
          imageUrl={s.facePhoto}
          onUpload={onUpload("facePhoto")}
          onRemove={() => update("facePhoto", null)}
        />
      </div>

      <button
        onClick={runScan}
        disabled={!s.fullBodyPhoto || !s.facePhoto || scanning}
        className="pill-ghost mt-6 w-full"
        style={{ borderColor: "var(--color-gold)", color: "var(--color-ink)" }}
      >
        {scanning ? (
          <>
            <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-gold" />
            Analyzing your style DNA…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Run AI Analysis
          </>
        )}
      </button>
    </div>
  );
}

function PhotoSlot({
  letter,
  title,
  hint,
  imageUrl,
  onUpload,
  onRemove,
}: {
  letter: string;
  title: string;
  hint: string;
  imageUrl: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <label className="editorial-card group flex cursor-pointer items-center gap-4 p-4">
      <div
        className="relative h-20 w-20 flex-none overflow-hidden rounded-xl"
        style={{ background: "var(--color-secondary)" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <span
          className="absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[10px]"
          style={{
            fontFamily: "var(--font-label)",
            background: "var(--color-ink)",
            color: "var(--color-primary-foreground)",
            letterSpacing: "0.15em",
          }}
        >
          {letter}
        </span>
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
      </div>
      {imageUrl ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          aria-label="Remove"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <Upload className="h-4 w-4 text-muted-foreground" />
      )}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onUpload}
      />
    </label>
  );
}

function ScanResults() {
  return (
    <div>
      <SectionTitle eyebrow="Your style DNA" title="Refined warm autumn." />
      <p className="mt-4 text-sm text-muted-foreground">
        A preview of what we learned. Your full profile lives in your account
        and updates as you wear more outfits.
      </p>

      <div className="mt-8 space-y-4">
        <ResultCard
          eyebrow="Body"
          rows={[
            ["Body shape", "Hourglass (confirmed)"],
            ["Shoulder–hip ratio", "1.02 — balanced"],
            ["Torso", "Standard length"],
            ["Emphasize", "Defined waist, hemlines mid-thigh"],
          ]}
        />
        <ResultCard
          eyebrow="Face"
          rows={[
            ["Face shape", "Oval"],
            ["Undertone", "Warm"],
            ["Color season", "Autumn"],
            ["Best collars", "V-neck, scoop, sweetheart"],
          ]}
        />
        <div className="editorial-card p-5">
          <span
            className="text-[10px]"
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.2em",
              color: "var(--color-gold)",
            }}
          >
            YOUR PALETTE
          </span>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {[
              "#7E3F1F",
              "#C8A97E",
              "#5B7A4A",
              "#2E3B4E",
              "#E8DCC4",
              "#A23B2A",
            ].map((c) => (
              <div
                key={c}
                className="aspect-square rounded-lg border border-border"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Warm earth tones with one cool anchor. Avoid icy pastels.
          </p>
        </div>
        <div className="editorial-card flex items-start gap-3 p-5">
          <Sparkles className="mt-0.5 h-4 w-4" style={{ color: "var(--color-gold)" }} />
          <div>
            <div
              className="text-sm"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem" }}
            >
              Closest style match
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sienna Miller meets The Row — softly tailored, earth-toned, lived-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  eyebrow,
  rows,
}: {
  eyebrow: string;
  rows: [string, string][];
}) {
  return (
    <div className="editorial-card p-5">
      <span
        className="text-[10px]"
        style={{
          fontFamily: "var(--font-label)",
          letterSpacing: "0.2em",
          color: "var(--color-gold)",
        }}
      >
        {eyebrow}
      </span>
      <dl className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="text-right text-sm">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---- 4. Wardrobe upload ---- */

function StepWardrobe({
  s,
  update,
}: {
  s: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    update("wardrobePhotos", [...s.wardrobePhotos, ...urls]);
  };

  return (
    <div>
      <SectionTitle
        eyebrow="Your wardrobe"
        title="Start with five favorite pieces."
      />
      <p className="mt-4 text-sm text-muted-foreground">
        Snap or upload items individually, or a flat-lay of several. The AI
        will detect category, color, fabric and formality — you can correct
        anything we get wrong.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-2">
        {s.wardrobePhotos.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-xl border border-border"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() =>
                update(
                  "wardrobePhotos",
                  s.wardrobePhotos.filter((_, j) => j !== i),
                )
              }
              aria-label="Remove"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90"
            >
              <X className="h-3 w-3" />
            </button>
            <span
              className="absolute bottom-1 left-1 rounded-full px-1.5 py-0.5 text-[9px] backdrop-blur"
              style={{
                fontFamily: "var(--font-label)",
                letterSpacing: "0.1em",
                background: "rgba(255,255,255,0.85)",
                color: "var(--color-ink)",
              }}
            >
              AI tagging…
            </span>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface text-muted-foreground transition-colors hover:border-gold">
          <Camera className="h-5 w-5" />
          <span
            className="text-[10px]"
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.15em",
            }}
          >
            ADD
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={onUpload}
          />
        </label>
      </div>

      <div className="mt-6 editorial-card p-4 text-xs text-muted-foreground">
        <span style={{ color: "var(--color-gold)" }}>Tip · </span>
        Shoot against a plain background in even light for the cleanest AI tags.
        You can keep building your wardrobe inside the app — no rush here.
      </div>
    </div>
  );
}

/* ---- 5. Brand connections ---- */

const BRANDS = [
  { id: "zara", name: "Zara", note: "Import past orders" },
  { id: "hm", name: "H&M", note: "Connect account" },
  { id: "zalando", name: "Zalando", note: "OAuth" },
  { id: "nike", name: "Nike", note: "OAuth" },
  { id: "adidas", name: "adidas", note: "OAuth" },
  { id: "asos", name: "ASOS", note: "CSV import" },
];

function StepBrands({
  s,
  update,
}: {
  s: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const toggle = (id: string) =>
    update(
      "connectedBrands",
      s.connectedBrands.includes(id)
        ? s.connectedBrands.filter((x) => x !== id)
        : [...s.connectedBrands, id],
    );

  return (
    <div>
      <SectionTitle
        eyebrow="Brands"
        title="Pull your purchase history in."
      />
      <p className="mt-4 text-sm text-muted-foreground">
        Past orders auto-import into your wardrobe with AI tags. Skip any —
        you can connect more later in Settings.
      </p>

      <div className="mt-8 space-y-2">
        {BRANDS.map((b) => {
          const on = s.connectedBrands.includes(b.id);
          return (
            <button
              key={b.id}
              onClick={() => toggle(b.id)}
              className="flex w-full items-center justify-between rounded-2xl border bg-surface px-5 py-4 text-left transition-colors"
              style={{
                borderColor: on ? "var(--color-gold)" : "var(--color-border)",
                background: on
                  ? "color-mix(in oklab, var(--color-gold) 6%, var(--color-surface))"
                  : "var(--color-surface)",
              }}
            >
              <div>
                <div
                  className="text-base"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}
                >
                  {b.name}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {b.note}
                </div>
              </div>
              <span
                className="flex h-9 items-center justify-center rounded-full px-4 text-[10px]"
                style={{
                  fontFamily: "var(--font-label)",
                  letterSpacing: "0.15em",
                  background: on ? "var(--color-ink)" : "transparent",
                  color: on
                    ? "var(--color-primary-foreground)"
                    : "var(--color-foreground)",
                  border: on ? "none" : "1px solid var(--color-border)",
                }}
              >
                {on ? (
                  <>
                    <Check className="mr-1 h-3 w-3" /> CONNECTED
                  </>
                ) : (
                  "CONNECT"
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- 6. Goals ---- */

const OCCASIONS = [
  "Work",
  "Weekend",
  "Going out",
  "Gym",
  "Travel",
  "Date night",
  "Events",
];

function StepGoals({
  s,
  update,
}: {
  s: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const toggle = (o: string) =>
    update(
      "occasions",
      s.occasions.includes(o)
        ? s.occasions.filter((x) => x !== o)
        : [...s.occasions, o],
    );

  return (
    <div>
      <SectionTitle eyebrow="Style goals" title="What should MIRROR optimize for?" />

      <FieldGroup label="Occasions to prioritize" className="mt-8">
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              onClick={() => toggle(o)}
              className={`chip ${s.occasions.includes(o) ? "chip-active" : ""}`}
            >
              {o}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label={`Budget per item: €${s.budget}`} className="mt-6">
        <input
          type="range"
          min={20}
          max={500}
          step={10}
          value={s.budget}
          onChange={(e) => update("budget", Number(e.target.value))}
          className="mt-2 w-full accent-foreground"
          style={{ accentColor: "var(--color-gold)" }}
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>€20</span>
          <span>€500+</span>
        </div>
      </FieldGroup>

      <ToggleRow
        label="Prioritize sustainable & secondhand"
        sub="We'll surface eco-friendly options first in Shop."
        on={s.sustainable}
        onChange={(v) => update("sustainable", v)}
      />
      <ToggleRow
        label="Building a capsule wardrobe"
        sub="MIRROR will favor versatile, mix-and-match recommendations."
        on={s.capsule}
        onChange={(v) => update("capsule", v)}
      />

      <div className="mt-8 editorial-card p-5 text-sm">
        <div
          className="text-[10px]"
          style={{
            fontFamily: "var(--font-label)",
            letterSpacing: "0.2em",
            color: "var(--color-gold)",
          }}
        >
          NEXT
        </div>
        <p className="mt-2 text-muted-foreground">
          Once you enter MIRROR you'll meet your wardrobe, outfit generator,
          and the smart planner — all tuned to what you just told us.
        </p>
      </div>
    </div>
  );
}

/* ============================ shared bits =============================== */

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span
        className="text-[10px]"
        style={{
          fontFamily: "var(--font-label)",
          letterSpacing: "0.3em",
          color: "var(--color-gold)",
        }}
      >
        {eyebrow.toUpperCase()}
      </span>
      <h2
        className="mt-3 text-3xl leading-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div className="mt-3 h-px w-10" style={{ background: "var(--color-gold)" }} />
    </div>
  );
}

function FieldGroup({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <label
          className="text-[10px]"
          style={{
            fontFamily: "var(--font-label)",
            letterSpacing: "0.2em",
            color: "var(--color-muted-foreground)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
        {hint && (
          <span className="text-[10px] text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "decimal";
}) {
  const filled = value.length > 0;
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="floating-label-input peer"
      />
      <span
        className={`pointer-events-none absolute left-4 transition-all ${
          filled ? "top-1.5 text-[9px]" : "top-4 text-xs"
        }`}
        style={{
          fontFamily: "var(--font-label)",
          letterSpacing: "0.18em",
          color: "var(--color-muted-foreground)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  onChange,
}: {
  label: string;
  sub: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="mt-3 flex w-full items-start gap-4 rounded-2xl border bg-surface p-4 text-left"
      style={{
        borderColor: on ? "var(--color-gold)" : "var(--color-border)",
      }}
    >
      <span
        className="mt-0.5 flex h-6 w-11 flex-none items-center rounded-full p-0.5 transition-colors"
        style={{
          background: on ? "var(--color-ink)" : "var(--color-border)",
        }}
      >
        <span
          className="h-5 w-5 rounded-full bg-white transition-transform"
          style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
        />
      </span>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
      </div>
    </button>
  );
}
