import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Camera, Search, Droplets } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { scanClothing } from "@/lib/api/clothing-scanner.functions";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [scanErrors, setScanErrors] = useState<Map<string, string>>(new Map());
  const [activeTab, setActiveTab] = useState<CategoryKey | "all">("all");

  const fetchItems = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setWardrobeItems(data || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const triggerScan = async (id: string, imageUrl: string) => {
    setScanErrors((prev) => new Map(prev).set(id, "Scanning…"));
    try {
      const res = await scanClothing({ data: { imageUrl } });
      if (res.error) {
        setScanErrors((prev) => new Map(prev).set(id, res.error!));
      } else if (res.items && res.items.length > 0) {
        const item = res.items[0];
        // Persist scan result to DB
        const { error: updateError } = await supabase
          .from("wardrobe_items")
          .update({
            category: item.category,
            style: item.style,
            color: item.color,
            fabric: item.fabric
          })
          .eq("id", id);

        if (!updateError) {
          setWardrobeItems(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
          setScanErrors((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
          });
          toast.success("Kledingstuk succesvol geanalyseerd!");
        }
      }
    } catch (err) {
      console.error(err);
      setScanErrors((prev) => new Map(prev).set(id, "Fout bij scannen"));
    }
  };

  const toggleLaundry = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'clean' ? 'dirty' : 'clean';
    const { error } = await supabase
      .from("wardrobe_items")
      .update({ laundry_status: nextStatus })
      .eq("id", id);

    if (!error) {
      setWardrobeItems(prev => prev.map(item => item.id === id ? { ...item, laundry_status: nextStatus } : item));
      toast.success(nextStatus === 'dirty' ? "Item in de wasmand" : "Item is weer schoon");
    }
  };

  const filteredList = useMemo(() => {
    if (activeTab === "all") return wardrobeItems;
    return wardrobeItems.filter(item => {
      const cat = (item.category || "other").toLowerCase();
      if (activeTab === "top") return ["top", "outerwear", "shirt", "sweater", "dress"].includes(cat);
      if (activeTab === "bottom") return ["bottom", "pants", "skirt", "jeans"].includes(cat);
      return cat === activeTab;
    });
  }, [wardrobeItems, activeTab]);

  const tabs: (CategoryKey | "all")[] = ["all", "top", "bottom", "shoes", "accessories", "other"];

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

        <nav className="mt-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeTab === t ? "bg-ink text-white" : "bg-surface text-muted-foreground border border-border"}`}
            >
              {t === "all" ? "Alles" : CATEGORY_LABELS[t as CategoryKey]}
            </button>
          ))}
        </nav>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {loading && <p>Bezig met laden…</p>}

          {!loading && filteredList.length === 0 && (
            <div className="editorial-card p-12 text-center col-span-full border-dashed border-2">
              <p className="mb-4 text-muted-foreground">Geen items gevonden in deze categorie.</p>
              <Link to="/onboarding" className="pill-button inline-flex items-center gap-2">
                <Camera className="h-4 w-4" /> Scan een nieuw kledingstuk
              </Link>
            </div>
          )}

          {filteredList.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-surface p-3 transition-transform hover:scale-[1.02]">
              <div className="relative mb-3 overflow-hidden rounded-lg aspect-[3/4]">
                <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => toggleLaundry(item.id, item.laundry_status)}
                  title={item.laundry_status === 'dirty' ? "Markeer als schoon" : "Markeer als vies"}
                  className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${item.laundry_status === 'dirty' ? 'bg-red-500 text-white' : 'bg-white/80 text-ink'}`}
                >
                  <Droplets className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold capitalize tracking-tight">{item.category || 'Nieuw item'}</p>
                  {item.laundry_status === 'dirty' && (
                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">In de was</span>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground leading-snug">{item.style || 'Scan voor details'}</p>
                <div className="flex gap-2 text-[11px] text-muted-foreground">
                  <span className="capitalize">{item.color}</span>
                  {item.fabric && <span>• {item.fabric}</span>}
                </div>
              </div>

              {scanErrors.has(item.id) && (
                <p className="mt-2 text-xs text-gold font-medium px-1">{scanErrors.get(item.id)}</p>
              )}

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                <button
                  onClick={() => triggerScan(item.id, item.image_url)}
                  className="text-[11px] font-medium text-gold hover:underline flex items-center gap-1"
                >
                  <Search className="h-3.5 w-3.5" /> AI Scan
                </button>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {item.times_worn || 0}x gedragen
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Wardrobe;
