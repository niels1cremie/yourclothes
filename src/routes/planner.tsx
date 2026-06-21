import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Sparkles, Plus, Calendar, CloudSun, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { format, addDays, startOfToday } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";
import mixpanel from "mixpanel-browser";

export const Route = createFileRoute("/planner")({
  component: PlannerPage,
});

function PlannerPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [outfit, setOutfit] = useState<any>(null);
  const [wardrobe, setWardrobe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }

    // Fetch wardrobe
    const { data: items } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("laundry_status", "clean");

    setWardrobe(items || []);

    // Fetch planned outfit for selected date
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const { data: planned } = await supabase
      .from("planned_outfits")
      .select("*, outfit_items(wardrobe_items(*))")
      .eq("user_id", user.id)
      .eq("date", formattedDate)
      .maybeSingle();

    setOutfit(planned);
    setLoading(false);
  };

  const generateSuggestion = async () => {
    setSuggesting(true);
    mixpanel.track("ai_suggestion_requested", {
      date: format(selectedDate, 'yyyy-MM-dd'),
    });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single();

      const response = await fetch("https://aqqxvacyvbucvkupzoya.supabase.co/functions/v1/outfit-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.supabaseKey}` // Using key from client
        },
        body: JSON.stringify({
          items: wardrobe,
          occasion: "Dagelijks",
          weather: { temp: 18, condition: "Sunny" }, // Mock weather
          profile
        })
      });

      const suggestion = await response.json();

      if (suggestion.selected_item_ids) {
        mixpanel.track("ai_suggestion_received", {
          item_count: suggestion.selected_item_ids.length,
        });
        toast.info(suggestion.reasoning);
        // Save suggested outfit
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const { data: newOutfit, error: oError } = await supabase
          .from("planned_outfits")
          .upsert({ user_id: user?.id, date: formattedDate, occasion: "AI Suggestie" })
          .select()
          .single();

        if (newOutfit) {
          const itemsToInsert = suggestion.selected_item_ids.map((id: string) => ({
            outfit_id: newOutfit.id,
            item_id: id
          }));
          await supabase.from("outfit_items").insert(itemsToInsert);
          fetchData();
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Kon geen suggestie genereren.");
    } finally {
      setSuggesting(false);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  return (
    <main className="page-gradient min-h-screen p-6">
      <div className="mx-auto max-w-lg">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-surface">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>Outfit Planner</h1>
          <div className="w-10" />
        </header>

        {/* Date Selector */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {weekDays.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center min-w-[60px] p-3 rounded-2xl border transition-all ${
                  isSelected ? 'bg-ink text-white border-ink' : 'bg-surface border-border'
                }`}
              >
                <span className="text-[10px] uppercase opacity-60 mb-1">{format(date, 'EEE', { locale: nl })}</span>
                <span className="text-lg font-semibold">{format(date, 'd')}</span>
              </button>
            );
          })}
        </div>

        {/* Current Weather Card (Mock) */}
        <div className="editorial-card p-4 mb-6 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <CloudSun className="text-gold h-6 w-6" />
            <div>
              <p className="text-sm font-medium">Licht bewolkt · 18°C</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Amsterdam, NL
              </p>
            </div>
          </div>
          <p className="text-[10px] text-gold font-semibold uppercase tracking-widest">Perfect voor lichte jasjes</p>
        </div>

        {/* Outfit Display */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
              {format(selectedDate, 'EEEE d MMMM', { locale: nl })}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gold"
              onClick={generateSuggestion}
              disabled={suggesting}
            >
              {suggesting ? <span className="btn-spinner" /> : <Sparkles className="h-4 w-4 mr-2" />}
              AI Suggestie
            </Button>
          </div>

          {outfit?.outfit_items?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {outfit.outfit_items.map((oi: any) => (
                <div key={oi.wardrobe_items.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-sm">
                  <img src={oi.wardrobe_items.image_url} className="h-full w-full object-cover" alt="" />
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-[10px] text-white font-medium capitalize">{oi.wardrobe_items.category}</p>
                  </div>
                </div>
              ))}
              <button className="aspect-[3/4] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-surface transition-colors">
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-medium uppercase tracking-widest">Item toevoegen</span>
              </button>
            </div>
          ) : (
            <div className="editorial-card p-12 text-center border-dashed border-2 flex flex-col items-center">
              <Calendar className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm mb-6">Nog geen outfit gepland voor deze dag.</p>
              <Button onClick={generateSuggestion} className="pill-button" disabled={suggesting}>
                Laat MIRROR kiezen
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
