import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, LogOut, User, Ruler, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import mixpanel from "mixpanel-browser";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    mixpanel.track("logout");
    mixpanel.reset();
    await supabase.auth.signOut();
    navigate({ to: "/" });
    toast.success("Uitgelogd");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="btn-spinner text-gold" />
      </div>
    );
  }

  return (
    <main className="page-gradient min-h-screen p-6">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>Mijn Profiel</h1>
          <button
            onClick={handleLogout}
            className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-surface text-red-500 transition-all hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-6">
          {/* Basic Info */}
          <section className="editorial-card p-6">
            <div className="flex items-center gap-3 mb-4 text-gold">
              <User className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Basisgegevens</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Naam</p>
                <p className="text-sm">{profile?.name || 'Niet ingevuld'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Leeftijd</p>
                <p className="text-sm">{profile?.age || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Geslacht</p>
                <p className="text-sm">{profile?.gender || '—'}</p>
              </div>
            </div>
          </section>

          {/* Body & Measurements */}
          <section className="editorial-card p-6">
            <div className="flex items-center gap-3 mb-4 text-gold">
              <Ruler className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Lichaam & Maten</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Lichaamsvorm</p>
                <p className="text-sm capitalize">{profile?.body_shape || 'Nog niet gescand'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Lengte</p>
                <p className="text-sm">{profile?.measurements?.heightCm} cm</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Kledingmaat</p>
                <p className="text-sm">{profile?.measurements?.size} ({profile?.measurements?.region})</p>
              </div>
            </div>
          </section>

          {/* Style DNA */}
          <section className="editorial-card p-6">
            <div className="flex items-center gap-3 mb-4 text-gold">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Stijl DNA</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Ondertoon</p>
                <p className="text-sm capitalize">{profile?.skin_undertone || 'Wacht op scan'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Kleurseizoen</p>
                <p className="text-sm capitalize">{profile?.color_season || 'Wacht op scan'}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Stijl Voorkeuren</p>
              <div className="flex flex-wrap gap-2">
                {profile?.preferences?.styleTags?.map((tag: string) => (
                  <span key={tag} className="chip chip-active text-[10px] py-1">{tag}</span>
                ))}
              </div>
            </div>
          </section>

          <Button
            variant="outline"
            className="w-full rounded-2xl border-gold/30 text-gold hover:bg-gold/5"
            onClick={() => navigate({ to: "/onboarding" })}
          >
            Herhaal Onboarding
          </Button>
        </div>
      </div>
    </main>
  );
}
