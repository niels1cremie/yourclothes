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
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { scanClothing, type ClothingItem } from "@/lib/api/clothing-scanner.functions";

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
  "Welcome",
  "About you",
  "Measurements",
  "Photo scan",
  "Your wardrobe",
  "Brands",
  "Style goals",
] as const;

/* ------------------------------- helpers -------------------------------- */

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
                background: i <= step ? "var(--color-gold)" : "var(--color-border)",
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
          <button onClick={next} disabled={!canAdvance} className="pill-button w-full">
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
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="A new beginning" title="Build your digital wardrobe." />
      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
        Seven short steps. We'll learn your body, colors and closet — then plan outfits around your
        week.
      </p>

      <div className="mt-5 grid flex-1 grid-cols-2 gap-2 content-start">
        {[
          { n: "01", t: "You", d: "Name & style tags." },
          { n: "02", t: "Body", d: "Measurements & scan." },
          { n: "03", t: "Wardrobe", d: "AI-tagged pieces." },
          { n: "04", t: "World", d: "Brands & goals." },
        ].map((row) => (
          <div key={row.n} className="editorial-card flex flex-col gap-1 px-4 py-3">
            <span
              className="text-[10px]"
              style={{
                fontFamily: "var(--font-label)",
                letterSpacing: "0.2em",
                color: "var(--color-gold)",
              }}
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
      <SectionTitle eyebrow="About you" title="Start with the basics." />

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
      <SectionTitle eyebrow="Measurements" title="A few proportions for fit." />

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

  const onUpload =
    (which: "fullBodyPhoto" | "facePhoto") => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Set loading state
      if (which === "fullBodyPhoto") {
        setUploadingFull(true);
        setErrorFull(null);
      } else {
        setUploadingFace(true);
        setErrorFace(null);
      }

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
      } else if (url) {
        update(which, url);
        if (which === "fullBodyPhoto") {
          setUploadingFull(false);
        } else {
          setUploadingFace(false);
        }
      }
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
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Photo scan" title="Two photos. AI does the rest." />
      <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
        Analyzed for body shape, face shape, undertone & color season.
      </p>

      <div className="mt-4 space-y-2">
        <PhotoSlot
          letter="A"
          title="Full body"
          hint="Neutral pose · fitted clothing"
          imageUrl={s.fullBodyPhoto}
          onUpload={onUpload("fullBodyPhoto")}
          onRemove={() => update("fullBodyPhoto", null)}
          isLoading={uploadingFull}
          error={errorFull}
        />
        <PhotoSlot
          letter="B"
          title="Face close-up"
          hint="Natural light"
          imageUrl={s.facePhoto}
          onUpload={onUpload("facePhoto")}
          onRemove={() => update("facePhoto", null)}
          isLoading={uploadingFace}
          error={errorFace}
        />
      </div>

      <button
        onClick={runScan}
        disabled={!s.fullBodyPhoto || !s.facePhoto || scanning}
        className="pill-ghost mt-4 w-full"
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
  isLoading = false,
  error = null,
}: {
  letter: string;
  title: string;
  hint: string;
  imageUrl: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  return (
    <div>
      <label className="editorial-card group flex cursor-pointer items-center gap-3 p-3">
        <div
          className="relative h-14 w-14 flex-none overflow-hidden rounded-lg"
          style={{ background: "var(--color-secondary)" }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-gold" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Camera className="h-4 w-4 text-muted-foreground" />
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
              e.preventDefault();
              onRemove();
            }}
            aria-label="Remove"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Upload
            className={`h-4 w-4 shrink-0 ${isLoading ? "opacity-50" : "text-muted-foreground"}`}
          />
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onUpload}
          disabled={isLoading}
        />
      </label>
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

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newUrls: string[] = [];
    const newErrors = new Map(uploadErrors);
    const uploading = new Set(uploadingIndices);

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const index = s.wardrobePhotos.length + newUrls.length;

      // Set loading state
      uploading.add(index);
      setUploadingIndices(new Set(uploading));

      // Upload to Supabase
      const { url, error } = await uploadFileToSupabase(file);

      if (error) {
        newErrors.set(index, error);
      } else if (url) {
        newUrls.push(url);

        // Auto-scan the clothing in the uploaded image
        await scanUploadedClothing(index, url);
      }

      // Clear loading state for this item
      uploading.delete(index);
      setUploadingIndices(new Set(uploading));
    }

    // Update errors and photos
    setUploadErrors(newErrors);
    if (newUrls.length > 0) {
      update("wardrobePhotos", [...s.wardrobePhotos, ...newUrls]);
    }

    // Reset input
    e.target.value = "";
  };

  const scanUploadedClothing = async (index: number, imageUrl: string) => {
    setScanningIndices((prev) => new Set(prev).add(index));
    const newScanErrors = new Map(scanErrors);

    try {
      const result = await scanClothing({ data: { imageUrl } });

      if (result.error) {
        newScanErrors.set(index, result.error);
      } else if (result.items) {
        setDetectedItems((prev) => new Map(prev).set(index, result.items!));
        newScanErrors.delete(index);
      }
    } catch (err) {
      console.error("Scan error:", err);
      newScanErrors.set(index, "Fout bij het scannen van het kledingstuk.");
    }

    setScanErrors(newScanErrors);
    setScanningIndices((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const handleRemove = (i: number) => {
    const newPhotos = s.wardrobePhotos.filter((_, j) => j !== i);
    update("wardrobePhotos", newPhotos);

    // Also remove any error for this index
    const newErrors = new Map(uploadErrors);
    newErrors.delete(i);
    setUploadErrors(newErrors);

    // Remove scan results
    const newDetected = new Map(detectedItems);
    newDetected.delete(i);
    setDetectedItems(newDetected);

    const newScanErrors = new Map(scanErrors);
    newScanErrors.delete(i);
    setScanErrors(newScanErrors);
  };

  return (
    <div className="flex h-full flex-col">
      <SectionTitle eyebrow="Your wardrobe" title="Add five favorite pieces." />
      <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
        AI detects category, color, fabric and formality. Correct anything later.
      </p>

      <div className="mt-4 grid grid-cols-4 gap-4">
        {s.wardrobePhotos.map((url, i) => (
          <div key={i} className="flex flex-col">
            {/* Photo with remove button */}
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => handleRemove(i)}
                aria-label="Remove"
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/90"
              >
                <X className="h-2.5 w-2.5" />
              </button>

              {/* Scanning indicator */}
              {scanningIndices.has(i) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="animate-spin">
                    <Sparkles className="h-4 w-4 text-gold" />
                  </div>
                </div>
              )}
            </div>

            {/* Upload errors */}
            {uploadErrors.has(i) && (
              <p className="mt-1 text-[10px] text-red-600">{uploadErrors.get(i)}</p>
            )}

            {/* Scan results or errors */}
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

            {/* Scan errors */}
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

        {/* Upload button */}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-border bg-surface text-muted-foreground transition-colors hover:border-gold">
          <Camera className="h-4 w-4" />
          <span
            className="text-[9px]"
            style={{
              fontFamily: "var(--font-label)",
              letterSpacing: "0.15em",
            }}
          >
            ADD
          </span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={onUpload} />
        </label>
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
      <SectionTitle eyebrow="Brands" title="Pull your purchase history." />
      <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
        Past orders auto-import with AI tags. Connect more later in Settings.
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
      <SectionTitle eyebrow="Style goals" title="What should MIRROR optimize?" />

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
