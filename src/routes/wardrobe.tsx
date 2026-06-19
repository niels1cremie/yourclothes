import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Camera, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { scanClothing, type ClothingItem } from "@/lib/api/clothing-scanner.functions";

export const Route = createFileRoute("/wardrobe")({
  head: () => ({
    meta: [
      { title: "Mijn Kledingkast — MIRROR" },
      { name: "description", content: "Bekijk en beheer je kledingstukken, gescand door MIRROR." },
    ],
  }),
  component: Wardrobe,
});

type CategoryKey = "top" | "bottom" | "shoes" | "accessories" | "other";

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  top: "Bovenkleding",
  bottom: "Onderkleding",
  shoes: "Schoenen",
  accessories: "Accessoires",
  other: "Overig",
};

function Wardrobe() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanMap, setScanMap] = useState<Map<string, ClothingItem[]>>(new Map());
  const [scanErrors, setScanErrors] = useState<Map<string, string>>(new Map());
  const [activeTab, setActiveTab] = useState<CategoryKey | "all">("all");

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from("wardrobe-photos").list("", { limit: 100 });
      if (error) {
        console.error("Failed to list wardrobe photos:", error);
        setPhotos([]);
      } else if (data) {
        const urls = data
          .filter((f: any) => f && f.name)
          .map((f: any) => {
            const { data: urlData } = supabase.storage.from("wardrobe-photos").getPublicUrl(f.name);
            return urlData?.publicUrl ?? "";
          })
          .filter(Boolean);

        setPhotos(urls);

        // Kick off scans for any unscanned photos
        for (const u of urls) {
          if (!scanMap.has(u) && !scanErrors.has(u)) {
            triggerScan(u);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerScan = async (imageUrl: string) => {
    setScanErrors((prev) => new Map(prev).set(imageUrl, "Scanning…"));
    try {
      const res = await scanClothing({ data: { imageUrl } });
      if (res.error) {
        setScanErrors((prev) => new Map(prev).set(imageUrl, res.error!));
      } else if (res.items) {
        setScanMap((prev) => new Map(prev).set(imageUrl, res.items!));
        setScanErrors((prev) => {
          const next = new Map(prev);
          next.delete(imageUrl);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
      setScanErrors((prev) => new Map(prev).set(imageUrl, "Fout bij scannen"));
    }
  };

  const itemsByCategory = useMemo(() => {
    const map: Record<string, { image: string; items: ClothingItem[] }[]> = {};
    for (const url of photos) {
      const items = scanMap.get(url) ?? [];
      if (items.length === 0) {
        (map.other ??= []).push({ image: url, items: [] });
      } else {
        for (const it of items) {
          const cat: CategoryKey = (it.category as CategoryKey) ?? "other";
          (map[cat] ??= []).push({ image: url, items: [it] });
        }
      }
    }
    return map;
  }, [photos, scanMap]);

  const tabs: (CategoryKey | "all")[] = ["all", "top", "bottom", "shoes", "accessories", "other"];

  const filteredList = useMemo(() => {
    if (activeTab === "all") {
      return photos.map((p) => ({ image: p, items: scanMap.get(p) ?? [] }));
    }
    // flatten entries for activeTab
    const list: { image: string; items: ClothingItem[] }[] = [];
    for (const url of photos) {
      const items = (scanMap.get(url) ?? []).filter((it) => (it.category ?? "other") === activeTab);
      if (items.length > 0) list.push({ image: url, items });
    }
    return list;
  }, [photos, scanMap, activeTab]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Mijn Kledingkast
          </h1>
          <Link to="/onboarding" className="pill-button flex items-center gap-2">
            <Camera className="h-4 w-4" /> Nieuw kledingstuk scannen
          </Link>
        </header>

        <nav className="mt-6 flex gap-3">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1 rounded-full text-sm ${activeTab === t ? "bg-gold text-ink" : "bg-surface text-muted-foreground"}`}
            >
              {t === "all" ? "Alles" : CATEGORY_LABELS[t as CategoryKey]}
            </button>
          ))}
        </nav>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {loading && <p>Bezig met laden…</p>}

          {!loading && filteredList.length === 0 && (
            <div className="editorial-card p-6 text-center">
              <p className="mb-3">Geen items gevonden in deze categorie.</p>
              <Link to="/onboarding" className="pill-button inline-flex items-center gap-2">
                <Camera className="h-4 w-4" /> Scan een nieuw kledingstuk
              </Link>
            </div>
          )}

          {filteredList.map(({ image, items }) => (
            <article key={image} className="rounded-2xl border border-border bg-surface p-3">
              <div className="relative mb-3 overflow-hidden rounded-lg">
                <img src={image} alt="" className="h-56 w-full object-cover" />
              </div>

              {scanErrors.has(image) && (
                <p className="mb-2 text-sm text-red-600">{scanErrors.get(image)}</p>
              )}

              {items.length === 0 && <p className="text-sm text-muted-foreground">Nog geen detecties. Klik op Scannen.</p>}

              {items.map((it, idx) => (
                <div key={idx} className="mb-2 rounded-lg p-2">
                  <p className="text-sm font-semibold">{it.category}</p>
                  <p className="text-[13px] text-muted-foreground">{it.style}</p>
                  <p className="text-[13px] text-muted-foreground">Kleur: {it.color}</p>
                  {it.fabric && <p className="text-[13px] text-muted-foreground">Stof: {it.fabric}</p>}
                </div>
              ))}

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => triggerScan(image)}
                  className="pill-button inline-flex items-center gap-2"
                >
                  <Search className="h-4 w-4" /> Scannen
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Wardrobe;
