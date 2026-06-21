import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera as CameraIcon,
  Check,
  Sparkles,
  Upload,
  X,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { scanClothing, type ClothingItem } from "@/lib/api/clothing-scanner.functions";
import { analyzeUser } from "@/lib/api/user-analyzer.functions";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { App } from "@capacitor/app";
import mixpanel from "mixpanel-browser";

interface GalleryPlugin {
  pickImage(): Promise<{ webPath: string }>;
}
const Gallery = registerPlugin<GalleryPlugin>("Gallery");

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "MIRROR — Stel je stijl in" },
      {
        name: "description",
        content:
          "Vertel MIRROR over je lichaam, kleuren, kledingkast en doelen. Zeven rustige stappen naar je persoonlijke stijl-DNA.",
      },
    ],
  }),
  component: Onboarding,
});

/* ------------------------------- types ---------------------------------- */

type Units = "metric" | "imperial";
type Region = "EU" | "US" | "UK";
type BodyShape = "hourglass" | "pear" | "apple" | "rectangle" | "inverted-triangle" | "unsure";

interface OnboardingState {
  name: string;
  age: string;
  gender: string;
  styleTags: string[];
  favoriteBrands: string;
  clothingSize: string;
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
  favoriteBrands: "",
  clothingSize: "",
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
  "Welkom",
  "Over jou",
  "Maten",
  "Fotoscan",
  "Kledingkast",
  "Merken",
  "Stijl doelen",
] as const;

const STORAGE_KEY = "mirror-onboarding-v1";
const TOTAL_STEPS = STEPS.length;

/* ------------------------------- helpers -------------------------------- */

/**
 * Converts a base64 string or data URL to a File object.
 */
async function base64ToFile(base64Data: string, fileName: string, mimeType: string): Promise<File> {
  try {
    const dataUrl = base64Data.startsWith("data:") ? base64Data : `data:${mimeType};base64,${base64Data}`;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: mimeType });
  } catch (e) {
    console.error("base64ToFile conversion failed:", e);
    throw new Error("Afbeelding kon niet worden verwerkt.");
  }
}

/**
 * Converts a webPath (blob URL) to a File object.
 */
async function webPathToFile(webPath: string, fileName: string, mimeType: string): Promise<File> {
  try {
    const res = await fetch(webPath);
    const blob = await res.blob();
    return new File([blob], fileName, { type: mimeType });
  } catch (e) {
    console.error("webPathToFile conversion failed:", e);
    throw new Error("Bestand kon niet worden gelezen van apparaat.");
  }
}

/**
 * Upload a file to Supabase Storage in the 'wardrobe-photos' bucket.
 * Returns the public URL of the uploaded file, or null on error.
 */
async function uploadFileToSupabase(
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  try {
    if (!file) {
      return { url: null, error: "No file selected" };
    }

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      return { url: null, error: "Only image files are supported" };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { url: null, error: "File size must be less than 5MB" };
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${timestamp}-${random}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("wardrobe-photos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return { url: null, error: "Failed to upload image" };
    }

    // Get the public URL
    const { data } = supabase.storage.from("wardrobe-photos").getPublicUrl(fileName);

    return { url: data.publicUrl, error: null };
  } catch (err) {
    console.error("Upload error:", err);
    return { url: null, error: "An error occurred during upload" };
  }
}

/* ------------------------------- screen --------------------------------- */

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [s, setS] = useState<OnboardingState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    // Handle restored camera data if the app was killed while taking a photo
    const handleRestoredResult = async (result: any) => {
      if (result.pluginId === "Camera" && result.success && result.data) {
        console.log("Restored camera result detected");
        if (result.data.webPath) {
          const file = await webPathToFile(result.data.webPath, `photo.${result.data.format}`, `image/${result.data.format}`);
          // We don't know which photo was being taken, so we can't easily auto-set it
          // but we can at least show a toast or handle it if we store intent
          toast.info("Je foto is hersteld na een app-herstart.");
        }
      }
    };
    App.addListener("appRestoredResult", handleRestoredResult);
    return () => {
      App.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { step?: number; state?: Partial<OnboardingState> };
        if (parsed.state) setS((prev) => ({ ...prev, ...parsed.state }));
        if (typeof parsed.step === "number" && parsed.step >= 0 && parsed.step < TOTAL_STEPS) {
          setStep(parsed.step);
        }
      }
    } catch {
      /* ignore corrupt storage */
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, state: s }));
  }, [step, s, hydrated]);

  const update = useCallback(
    <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) =>
      setS((prev) => ({ ...prev, [k]: v })),
    [],
  );

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

  const next = async () => {
    if (!canAdvance) return;
    if (step < TOTAL_STEPS - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      mixpanel.track("onboarding_step_completed", {
        step: step,
        next_step: nextStep,
        step_name: STEPS[step],
      });
      return;
    }
    setFinishing(true);
    try {
      localStorage.setItem("onboarding_completed", "true");
      localStorage.removeItem(STORAGE_KEY);
      mixpanel.track("onboarding_finished");
      navigate({ to: "/" });
    } finally {
      setFinishing(false);
    }
  };

  const back = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      mixpanel.track("onboarding_back_pressed", {
        current_step: step,
        previous_step: prevStep,
      });
    } else {
      mixpanel.track("onboarding_abandoned");
      navigate({ to: "/" });
    }
  };

  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100;

  if (!hydrated) {
    return (
      <main className="flex h-[100dvh] items-center justify-center bg-background">
        <span className="btn-spinner text-foreground" aria-label="Laden" />
      </main>
    );
  }

  return (
    <main className="page-gradient h-[100dvh] overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col px-4 sm:px-6">
        <WizardHeader step={step} onBack={back} />

        <WizardProgress step={step} percent={progressPercent} />

        <section
          key={step}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-5 pb-2 animate-in fade-in duration-300"
        >
          {step === 0 && <StepWelcome />}
          {step === 1 && <StepBasics s={s} update={update} />}
          {step === 2 && <StepMeasurements s={s} update={update} />}
          {step === 3 && <StepScan s={s} update={update} />}
          {step === 4 && <StepWardrobe s={s} update={update} />}
          {step === 5 && <StepBrands s={s} update={update} />}
          {step === 6 && <StepGoals s={s} update={update} />}
        </section>

        <WizardFooter
          step={step}
          canAdvance={canAdvance}
          loading={finishing}
          onBack={back}
          onNext={next}
        />
      </div>
    </main>
  );
}

function WizardHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <header className="flex shrink-0 items-center justify-between pt-4 sm:pt-5">
      <button
        type="button"
        onClick={onBack}
        aria-label={step === 0 ? "Terug naar home" : "Vorige stap"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all hover:border-gold/40 hover:bg-secondary active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div className="text-center">
        <p
          className="text-[10px] text-muted-foreground"
          style={{ fontFamily: "var(--font-label)", letterSpacing: "0.22em" }}
        >
          STAP {step + 1} VAN {TOTAL_STEPS}
        </p>
        <p
          className="mt-0.5 text-xs text-foreground"
          style={{ fontFamily: "var(--font-label)", letterSpacing: "0.12em" }}
        >
          {STEPS[step]}
        </p>
      </div>
      <span className="h-10 w-10" aria-hidden />
    </header>
  );
}

function WizardProgress({ step, percent }: { step: number; percent: number }) {
  return (
    <div className="mt-4 shrink-0 sm:mt-5">
      <div className="wizard-progress-track">
        <div className="wizard-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="wizard-step-dot"
              data-active={i === step}
              data-done={i < step}
              aria-hidden
            />
          ))}
        </div>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
}

function WizardFooter({
  step,
  canAdvance,
  loading,
  onBack,
  onNext,
}: {
  step: number;
  canAdvance: boolean;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="safe-bottom shrink-0 border-t border-border/60 bg-background/80 py-4 backdrop-blur-sm">
      <div className="flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="pill-ghost min-h-12 flex-1 sm:flex-none sm:px-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Vorige
          </button>
        ) : (
          <div className="hidden sm:block sm:w-[7.5rem]" aria-hidden />
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance || loading}
          data-loading={loading}
          className="pill-button min-h-12 flex-1 sm:min-w-[10rem]"
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              Even geduld…
            </>
          ) : isLast ? (
            <>
              Start MIRROR
              <Sparkles className="h-4 w-4" />
            </>
          ) : (
            <>
              Volgende
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      {!canAdvance && step > 0 && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Vul de verplichte velden in om verder te gaan.
        </p>
      )}
    </div>
  );
}

/* =============================== STEPS ================================== */

function StepWelcome() {
  const previewSteps = [
    { n: "01", t: "Over jou", d: "Naam, stijl & merken." },
    { n: "02", t: "Maten", d: "Lengte, vorm & pasvorm." },
    { n: "03", t: "Fotoscan", d: "AI analyseert je stijl-DNA." },
    { n: "04", t: "Kledingkast", d: "Upload je favoriete items." },
    { n: "05", t: "Merken", d: "Koppel je aankopen." },
    { n: "06", t: "Doelen", d: "Budget & gelegenheden." },
    { n: "07", t: "Klaar", d: "Start met MIRROR." },
  ];

  return (
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Een nieuw begin" title="Bouw je digitale kledingkast." />
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        Zeven korte stappen. We leren je lichaam, kleuren en kast kennen — en plannen outfits rondom
        je echte week.
      </p>

      <div className="mt-6 grid flex-1 grid-cols-2 gap-2.5 content-start sm:gap-3">
        {previewSteps.map((row) => (
          <div key={row.n} className="editorial-card flex flex-col gap-1 px-4 py-3.5 transition-colors hover:border-gold/30">
            <span
              className="text-[10px] text-gold"
              style={{ fontFamily: "var(--font-label)", letterSpacing: "0.2em" }}
            >
              {row.n}
            </span>
            <h3 className="text-lg leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {row.t}
            </h3>
            <p className="text-[11px] leading-snug text-muted-foreground">{row.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- 1. Basics ---- */

const STYLE_CARDS = [
  {
    id: "casual",
    label: "Casual",
    imageUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "streetwear",
    label: "Streetwear",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    imageUrl:
      "https://images.unsplash.com/photo-1539533057440-7814a3d108cb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "chic",
    label: "Chic",
    imageUrl:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "business",
    label: "Business",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sporty",
    label: "Sporty",
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "bohemian",
    label: "Bohemian",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "y2k",
    label: "Y2K",
    imageUrl:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "editorial",
    label: "Editorial",
    imageUrl:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "romantic",
    label: "Romantic",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "oldmoney",
    label: "Old Money",
    imageUrl:
      "https://images.unsplash.com/photo-1520975682031-a43d4cc62c2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "grunge",
    label: "Grunge",
    imageUrl:
      "https://images.unsplash.com/photo-1506629905607-d9d297d4f5f2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "gothic",
    label: "Gothic",
    imageUrl:
      "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "preppy",
    label: "Preppy",
    imageUrl:
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "vintage",
    label: "Vintage",
    imageUrl:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "athleisure",
    label: "Athleisure",
    imageUrl:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  },
];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const FAVORITE_BRANDS_OPTIONS = [
  "Zara",
  "H&M",
  "ASOS",
  "Uniqlo",
  "COS",
  "Mango",
  "Topshop",
  "Nike",
  "Adidas",
  "Urban Outfitters",
];

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Prefer not to say"];

function StepBasics({
  s,
  update,
}: {
  s: OnboardingState;
  update: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const toggleTag = (id: string) =>
    update(
      "styleTags",
      s.styleTags.includes(id) ? s.styleTags.filter((x) => x !== id) : [...s.styleTags, id],
    );

  return (
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Over jou" title="Begin met de basis." />

      <div className="mt-4 space-y-4 overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-2">
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
        </div>

        <FieldGroup label="Gender identity">
          <div className="flex flex-wrap gap-1.5">
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

        <FieldGroup label="Clothing size">
          <div className="flex flex-wrap gap-1.5">
            {CLOTHING_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => update("clothingSize", size)}
                className={`chip ${s.clothingSize === size ? "chip-active" : ""}`}
              >
                {size}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Favorite brands">
          <div className="flex flex-wrap gap-1.5">
            {FAVORITE_BRANDS_OPTIONS.map((brand) => (
              <button
                key={brand}
                onClick={() => update("favoriteBrands", brand)}
                className={`chip ${s.favoriteBrands === brand ? "chip-active" : ""}`}
              >
                {brand}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Your style" hint={`${s.styleTags.length} selected`}>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {STYLE_CARDS.map((card) => (
              <button
                key={card.id}
                onClick={() => toggleTag(card.id)}
                className="relative overflow-hidden rounded-lg border-2 text-left transition-all group"
                style={{
                  borderColor: s.styleTags.includes(card.id)
                    ? "var(--color-gold)"
                    : "var(--color-border)",
                  boxShadow: s.styleTags.includes(card.id) ? "0 0 12px var(--color-gold)" : "none",
                }}
              >
                <img
                  src={card.imageUrl}
                  alt={card.label}
                  className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-48"
                />

                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="text-sm font-semibold">{card.label}</span>
                  {s.styleTags.includes(card.id) && (
                    <Check className="h-4 w-4 shrink-0" style={{ color: "var(--color-gold)" }} />
                  )}
                </div>

                {s.styleTags.includes(card.id) && (
                  <span
                    className="pointer-events-none absolute inset-0 bg-gold/10"
                    aria-hidden="true"
                  />
                )}
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
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Maten" title="Een paar verhoudingen voor de pasvorm." />

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {(["metric", "imperial"] as Units[]).map((u) => (
            <button
              key={u}
              onClick={() => update("units", u)}
              className="rounded-full px-3 py-1 text-[10px]"
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
        <div className="flex gap-1">
          {(["EU", "US", "UK"] as Region[]).map((r) => (
            <button
              key={r}
              onClick={() => update("region", r)}
              className={`chip ${s.region === r ? "chip-active" : ""}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <FieldText
          label={s.units === "metric" ? "Height cm" : "Height in"}
          value={s.heightCm}
          onChange={(v) => update("heightCm", v.replace(/\D/g, "").slice(0, 3))}
          inputMode="numeric"
        />
        <FieldText
          label={s.units === "metric" ? "Weight kg" : "Weight lb"}
          value={s.weightKg}
          onChange={(v) => update("weightKg", v.replace(/\D/g, "").slice(0, 3))}
          inputMode="numeric"
        />
        <FieldText
          label={`Size ${s.region}`}
          value={s.size}
          onChange={(v) => update("size", v)}
          placeholder="38"
        />
      </div>

      <FieldGroup label="Body shape" className="mt-4">
        <div className="grid grid-cols-3 gap-1.5">
          {BODY_SHAPES.map((b) => (
            <button
              key={b.id}
              onClick={() => update("bodyShape", b.id)}
              className="rounded-xl border p-2 text-center transition-colors"
              style={{
                borderColor: s.bodyShape === b.id ? "var(--color-gold)" : "var(--color-border)",
                background:
                  s.bodyShape === b.id
                    ? "color-mix(in oklab, var(--color-gold) 8%, var(--color-surface))"
                    : "var(--color-surface)",
              }}
            >
              <div
                className="text-[12px] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {b.label}
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
  const [uploadingFull, setUploadingFull] = useState(false);
  const [uploadingFace, setUploadingFace] = useState(false);
  const [errorFull, setErrorFull] = useState<string | null>(null);
  const [errorFace, setErrorFace] = useState<string | null>(null);

  const handleManualUpload = async (which: "fullBodyPhoto" | "facePhoto", file: File) => {
    // Set loading state
    if (which === "fullBodyPhoto") {
      setUploadingFull(true);
      setErrorFull(null);
    } else {
      setUploadingFace(true);
      setErrorFace(null);
    }

    // Identify user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Upload to Supabase
    const { url, error } = await uploadFileToSupabase(file);

    if (error) {
      if (which === "fullBodyPhoto") {
        setErrorFull(error);
        setUploadingFull(false);
      } else {
        setErrorFace(error);
        setUploadingFace(false);
      }
      toast.error(error);
    } else if (url) {
      update(which, url);
      mixpanel.track("onboarding_photo_uploaded", {
        photo_type: which,
        is_authenticated: !!user
      });
      if (which === "fullBodyPhoto") {
        setUploadingFull(false);
      } else {
        setUploadingFace(false);
      }
    }
  };

  const runScan = async () => {
    if (!s.fullBodyPhoto || !s.facePhoto) return;

    setScanning(true);
    mixpanel.track("ai_scan_started");
    try {
      const result = await analyzeUser({
        data: {
          fullBodyImageUrl: s.fullBodyPhoto,
          faceImageUrl: s.facePhoto,
        },
      });

      if (result.error) {
        toast.error(result.error);
        mixpanel.track("ai_scan_error", { error: result.error });
      } else {
        mixpanel.track("ai_scan_success", {
          body_shape: result.bodyShape,
          color_season: result.colorSeason,
        });
        update("bodyShape", result.bodyShape as any);
        // We might want to store more data in the state if needed
        update("scanComplete", true);

        // Also try to sync to profile if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({
            body_shape: result.bodyShape,
            skin_undertone: result.skinUndertone,
            color_season: result.colorSeason,
            preferences: {
              ...s.styleTags,
              suggestedPalette: result.suggestedPalette,
              stylePersona: result.stylePersona
            }
          }).eq("id", user.id);
        }
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setScanning(false);
    }
  };

  if (s.scanComplete) {
    return <ScanResults />;
  }

  return (
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Fotoscan" title="Twee foto's. AI doet de rest." />
      <p className="mt-2 text-sm leading-snug text-muted-foreground">
        Geanalyseerd op lichaamsvorm, gezichtsvorm, ondertoon en kleurseizoen.
      </p>

      <div className="mt-4 space-y-2">
        <PhotoSlot
          letter="A"
          title="Full body"
          hint="Neutral pose · fitted clothing"
          imageUrl={s.fullBodyPhoto}
          onFileSelect={(file) => handleManualUpload("fullBodyPhoto", file)}
          onRemove={() => update("fullBodyPhoto", null)}
          isLoading={uploadingFull}
          error={errorFull}
        />
        <PhotoSlot
          letter="B"
          title="Face close-up"
          hint="Natural light"
          imageUrl={s.facePhoto}
          onFileSelect={(file) => handleManualUpload("facePhoto", file)}
          onRemove={() => update("facePhoto", null)}
          isLoading={uploadingFace}
          error={errorFace}
        />
      </div>

      <button
        type="button"
        onClick={runScan}
        disabled={!s.fullBodyPhoto || !s.facePhoto || scanning}
        data-loading={scanning}
        className="pill-ghost mt-4 w-full border-gold/50 text-ink"
      >
        {scanning ? (
          <>
            <span className="btn-spinner" />
            Je stijl-DNA analyseren…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Start AI-analyse
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
  onFileSelect,
  onRemove,
  isLoading = false,
  error = null,
}: {
  letter: string;
  title: string;
  hint: string;
  imageUrl: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handlePick = async (source: CameraSource) => {
    setShowOptions(false);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source,
      });

      if (image.base64String) {
        const file = await base64ToFile(image.base64String, `photo.${image.format}`, `image/${image.format}`);
        onFileSelect(file);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const handleNativeClick = (e: React.MouseEvent) => {
    if (imageUrl || isLoading) return;
    e.preventDefault();
    setShowOptions(true);
  };

  return (
    <div className="relative">
      <div
        className="editorial-card group flex items-center gap-3 p-3 cursor-pointer"
        onClick={Capacitor.isNativePlatform() ? handleNativeClick : undefined}
      >
        <div
          className="relative h-14 w-14 flex-none overflow-hidden rounded-lg"
          style={{ background: "var(--color-secondary)" }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="btn-spinner text-gold" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CameraIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <span
            className="absolute left-1 top-1 rounded-full px-1 py-0 text-[9px]"
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
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium">{title}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
        </div>

        {imageUrl ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {isLoading ? (
              <span className="btn-spinner opacity-50" />
            ) : (
              <Upload className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}

        {!Capacitor.isNativePlatform() && !imageUrl && !isLoading && (
          <input
            type="file"
            accept="image/*"
            // Explicitly remove capture to prevent auto-camera trigger
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
        )}
      </div>

      {showOptions && (
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-4 rounded-2xl bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
          <button
            onClick={() => handlePick(CameraSource.Camera)}
            className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-secondary"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
              <CameraIcon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium">Foto maken</span>
          </button>
          <button
            onClick={() => handlePick(CameraSource.Photos)}
            className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-secondary"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
              <ImageIcon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium">Galerij</span>
          </button>
          <button
            onClick={() => setShowOptions(false)}
            className="absolute right-3 top-3 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="text-[11px] text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

function ScanResults() {
  return (
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Your style DNA" title="Refined warm autumn." />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <ResultCard
          eyebrow="Body"
          rows={[
            ["Shape", "Hourglass"],
            ["Ratio", "1.02"],
            ["Torso", "Standard"],
          ]}
        />
        <ResultCard
          eyebrow="Face"
          rows={[
            ["Shape", "Oval"],
            ["Undertone", "Warm"],
            ["Season", "Autumn"],
          ]}
        />
      </div>

      <div className="mt-2 editorial-card p-3">
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
        <div className="mt-2 grid grid-cols-6 gap-1.5">
          {["#7E3F1F", "#C8A97E", "#5B7A4A", "#2E3B4E", "#E8DCC4", "#A23B2A"].map((c) => (
            <div
              key={c}
              className="aspect-square rounded-md border border-border"
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 editorial-card flex items-start gap-2 p-3">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-gold)" }} />
        <p className="text-[11px] leading-snug text-muted-foreground">
          <span className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Sienna Miller × The Row
          </span>{" "}
          — softly tailored, earth-toned, lived-in.
        </p>
      </div>
    </div>
  );
}

function ResultCard({ eyebrow, rows }: { eyebrow: string; rows: [string, string][] }) {
  return (
    <div className="editorial-card p-3">
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
      <dl className="mt-2 space-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-2">
            <dt className="text-[10px] text-muted-foreground">{k}</dt>
            <dd className="text-right text-[12px]">{v}</dd>
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
  const [uploadingIndices, setUploadingIndices] = useState<Set<number>>(new Set());
  const [uploadErrors, setUploadErrors] = useState<Map<number, string>>(new Map());
  const [scanningIndices, setScanningIndices] = useState<Set<number>>(new Set());
  const [detectedItems, setDetectedItems] = useState<Map<number, ClothingItem[]>>(new Map());
  const [scanErrors, setScanErrors] = useState<Map<number, string>>(new Map());
  const [showOptions, setShowOptions] = useState(false);

    const processFiles = async (files: FileList | File[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Log eerst in om items aan je kast toe te voegen.");
      navigate({ to: "/auth" });
      return;
    }

    const newUrls: string[] = [];
    const uploading = new Set(uploadingIndices);

    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const index = s.wardrobePhotos.length + newUrls.length;

      uploading.add(index);
      setUploadingIndices(new Set(uploading));

      const { url, error } = await uploadFileToSupabase(file);

      if (error) {
        toast.error(`Upload fout: ${error}`);
      } else if (url) {
        // Create the record in wardrobe_items immediately
        const { data: newItem, error: dbError } = await supabase
          .from("wardrobe_items")
          .insert({
            user_id: user.id,
            image_url: url,
            category: 'other', // Default
            laundry_status: 'clean'
          })
          .select()
          .single();

        if (!dbError && newItem) {
          newUrls.push(url);
          mixpanel.track("wardrobe_item_added", { source: "onboarding" });
          // Auto-scan using the new ID
          await scanUploadedClothing(newItem.id, url);
        }
      }

      uploading.delete(index);
      setUploadingIndices(new Set(uploading));
    }

    if (newUrls.length > 0) {
      update("wardrobePhotos", [...s.wardrobePhotos, ...newUrls]);
    }
  };

  const handlePick = async (source: CameraSource) => {
    setShowOptions(false);
    try {
      if (source === CameraSource.Photos && Capacitor.isNativePlatform()) {
        // Use our custom Native Gallery Plugin
        const result = await Gallery.pickImage();
        if (result.webPath) {
          const file = await webPathToFile(result.webPath, `photo-${Date.now()}.jpg`, "image/jpeg");
          onFileSelect(file);
        }
        return;
      }

      if (source === CameraSource.Photos) {
        // Multiple selection from gallery
        const result = await Camera.pickImages({
          quality: 80, // Reduced quality for memory efficiency
          limit: 10,
        });

        if (result.photos.length === 0) return;

        const files: File[] = [];
        for (const photo of result.photos) {
          try {
            // result.photos uses webPath, which is a blob/file URL on the device
            const file = await webPathToFile(photo.webPath, `wardrobe-${Date.now()}.jpg`, "image/jpeg");
            files.push(file);
          } catch (fetchErr) {
            console.error("Error fetching photo webPath:", fetchErr);
          }
        }
        if (files.length > 0) await processFiles(files);
      } else {
        // Single photo from camera
        const image = await Camera.getPhoto({
          quality: 80, // Reduced quality for memory efficiency
          allowEditing: false,
          resultType: CameraResultType.Uri, // Use Uri instead of Base64 for memory efficiency
          source: source,
        });

        if (image.webPath) {
          const file = await webPathToFile(image.webPath, `photo.${image.format}`, `image/${image.format}`);
          onFileSelect(file);
        }
      }
    } catch (err) {
      console.error("Camera error details:", err);
      // Don't show error if user cancelled
      if (err instanceof Error && err.message.toLowerCase().includes("user cancelled")) {
        return;
      }
      toast.error("Fout bij openen camera/galerij");
    }
  };

  const scanUploadedClothing = async (id: string, imageUrl: string) => {
    const newScanErrors = new Map(scanErrors);

    try {
      const result = await scanClothing({ data: { imageUrl } });

      if (result.error) {
        newScanErrors.set(id, result.error);
      } else if (result.items && result.items.length > 0) {
        const item = result.items[0];
        // Persist to DB
        await supabase
          .from("wardrobe_items")
          .update({
            category: item.category,
            style: item.style,
            color: item.color,
            fabric: item.fabric
          })
          .eq("id", id);

        setDetectedItems((prev) => new Map(prev).set(id, result.items!));
        newScanErrors.delete(id);
      }
    } catch (err) {
      console.error("Scan error:", err);
      newScanErrors.set(id, "Fout bij het scannen van het kledingstuk.");
    }

    setScanErrors(newScanErrors);
  };

  const handleRemove = (i: number) => {
    const newPhotos = s.wardrobePhotos.filter((_, j) => j !== i);
    update("wardrobePhotos", newPhotos);
    const newErrors = new Map(uploadErrors);
    newErrors.delete(i);
    setUploadErrors(newErrors);
    const newDetected = new Map(detectedItems);
    newDetected.delete(i);
    setDetectedItems(newDetected);
    const newScanErrors = new Map(scanErrors);
    newScanErrors.delete(i);
    setScanErrors(newScanErrors);
  };

  return (
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Je kledingkast" title="Voeg vijf favoriete items toe." />
      <p className="mt-2 text-sm leading-snug text-muted-foreground">
        AI herkent categorie, kleur, stof en formaliteit. Corrigeer later wat je wilt.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
        {s.wardrobePhotos.map((url, i) => (
          <div key={i} className="flex flex-col">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleRemove(i)}
                aria-label="Remove"
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/90"
              >
                <X className="h-2.5 w-2.5" />
              </button>
              {scanningIndices.has(i) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="animate-spin">
                    <Sparkles className="h-4 w-4 text-gold" />
                  </div>
                </div>
              )}
            </div>
            {uploadErrors.has(i) && (
              <p className="mt-1 text-[10px] text-red-600">{uploadErrors.get(i)}</p>
            )}
            {detectedItems.has(i) && !scanErrors.has(i) && (
              <div className="mt-2 flex flex-col gap-1 rounded-lg bg-gold/10 p-2">
                {detectedItems.get(i)!.map((item, idx) => (
                  <div key={idx} className="text-[10px] leading-tight">
                    <p className="font-semibold text-gold capitalize">{item.category}</p>
                    <p className="text-[9px] text-muted-foreground">{item.style}</p>
                    <p className="text-[9px] text-muted-foreground">{item.color}</p>
                  </div>
                ))}
              </div>
            )}
            {scanErrors.has(i) && (
              <div className="mt-2 rounded-lg bg-red-50 p-2">
                <p className="text-[9px] text-red-600 flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>{scanErrors.get(i)}</span>
                </p>
              </div>
            )}
          </div>
        ))}

        <div className="relative aspect-square">
          <button
            onClick={() => Capacitor.isNativePlatform() ? setShowOptions(true) : undefined}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface text-muted-foreground transition-all hover:border-gold hover:bg-secondary/50 active:scale-[0.98]"
          >
            <CameraIcon className="h-4 w-4" />
            <span
              className="text-[9px]"
              style={{ fontFamily: "var(--font-label)", letterSpacing: "0.15em" }}
            >
              TOEVOEGEN
            </span>
            {!Capacitor.isNativePlatform() && (
              <input
                type="file"
                multiple
                accept="image/*"
                // No capture attribute here either
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files) processFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            )}
          </button>

          {showOptions && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
              <div className="editorial-card w-64 p-4 shadow-2xl">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handlePick(CameraSource.Camera)}
                    className="pill-button flex items-center justify-center gap-2 py-3"
                  >
                    <CameraIcon className="h-4 w-4" /> Foto maken
                  </button>
                  <button
                    onClick={() => handlePick(CameraSource.Photos)}
                    className="pill-ghost flex items-center justify-center gap-2 py-3"
                  >
                    <ImageIcon className="h-4 w-4" /> Uit galerij
                  </button>
                  <button
                    onClick={() => setShowOptions(false)}
                    className="mt-2 text-xs text-muted-foreground underline"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 editorial-card p-3 text-[11px] leading-snug text-muted-foreground">
        <span style={{ color: "var(--color-gold)" }}>Tip · </span>
        Plain background, even light — keeps AI tags clean. No rush, you can keep adding inside the
        app.
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
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Merken" title="Haal je aankoopgeschiedenis op." />
      <p className="mt-2 text-sm leading-snug text-muted-foreground">
        Eerdere bestellingen worden automatisch geïmporteerd met AI-tags. Koppel later meer in
        Instellingen.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {BRANDS.map((b) => {
          const on = s.connectedBrands.includes(b.id);
          return (
            <button
              key={b.id}
              onClick={() => toggle(b.id)}
              className="flex items-center justify-between rounded-xl border bg-surface px-3 py-2.5 text-left transition-colors"
              style={{
                borderColor: on ? "var(--color-gold)" : "var(--color-border)",
                background: on
                  ? "color-mix(in oklab, var(--color-gold) 6%, var(--color-surface))"
                  : "var(--color-surface)",
              }}
            >
              <div className="min-w-0">
                <div
                  className="truncate text-base leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {b.name}
                </div>
                <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{b.note}</div>
              </div>
              <span
                className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: on ? "var(--color-ink)" : "transparent",
                  border: on ? "none" : "1px solid var(--color-border)",
                  color: on ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                }}
              >
                {on ? <Check className="h-3 w-3" /> : <span className="text-xs">+</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---- 6. Goals ---- */

const OCCASIONS = ["Work", "Weekend", "Going out", "Gym", "Travel", "Date night", "Events"];

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
      s.occasions.includes(o) ? s.occasions.filter((x) => x !== o) : [...s.occasions, o],
    );

  return (
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Stijl doelen" title="Waar moet MIRROR op optimaliseren?" />

      <FieldGroup label="Occasions" className="mt-3">
        <div className="flex flex-wrap gap-1.5">
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

      <FieldGroup label={`Budget per item: €${s.budget}`} className="mt-3">
        <input
          type="range"
          min={20}
          max={500}
          step={10}
          value={s.budget}
          onChange={(e) => update("budget", Number(e.target.value))}
          className="mt-1 w-full"
          style={{ accentColor: "var(--color-gold)" }}
        />
        <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground">
          <span>€20</span>
          <span>€500+</span>
        </div>
      </FieldGroup>

      <div className="mt-3 space-y-2">
        <ToggleRow
          label="Sustainable & secondhand"
          sub="Eco-friendly first in Shop."
          on={s.sustainable}
          onChange={(v) => update("sustainable", v)}
        />
        <ToggleRow
          label="Capsule wardrobe"
          sub="Favor versatile, mix-and-match."
          on={s.capsule}
          onChange={(v) => update("capsule", v)}
        />
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
        className="mt-1.5 text-[1.625rem] leading-[1.1]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div className="mt-2 h-px w-10" style={{ background: "var(--color-gold)" }} />
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
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
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
