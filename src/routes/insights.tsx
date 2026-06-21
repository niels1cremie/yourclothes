import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, PieChart, TrendingUp, DollarSign, Activity } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({
    totalItems: 0,
    totalValue: 0,
    mostWorn: [],
    categorySplit: {},
    laundryCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }

    const { data: items } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", user.id);

    if (items) {
      const totalValue = items.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
      const categorySplit = items.reduce((acc: any, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});
      const laundryCount = items.filter(i => i.laundry_status !== 'clean').length;

      setStats({
        totalItems: items.length,
        totalValue,
        categorySplit,
        laundryCount,
        mostWorn: [...items].sort((a, b) => b.times_worn - a.times_worn).slice(0, 3)
      });
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background"><span className="btn-spinner text-gold" /></div>;
  }

  return (
    <main className="page-gradient min-h-screen p-6">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between mb-8">
          <Link to="/" className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-surface">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>Inzichten</h1>
          <div className="w-10" />
        </header>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="editorial-card p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Totale waarde</p>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gold" />
              <p className="text-2xl font-semibold">€{stats.totalValue}</p>
            </div>
          </div>
          <div className="editorial-card p-5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Items in de was</p>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gold" />
              <p className="text-2xl font-semibold">{stats.laundryCount}</p>
            </div>
          </div>
        </div>

        <section className="editorial-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Categorieën</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.categorySplit).map(([cat, count]: [any, any]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{cat}</span>
                  <span className="font-medium">{count} items</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold"
                    style={{ width: `${(count / stats.totalItems) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="editorial-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Meest gedragen</h2>
          </div>
          <div className="space-y-4">
            {stats.mostWorn.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg overflow-hidden border border-border">
                  <img src={item.image_url} className="h-full w-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{item.category}</p>
                  <p className="text-xs text-muted-foreground">{item.times_worn} keer gedragen</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">CPW</p>
                  <p className="text-sm font-medium">€{(item.cost / (item.times_worn || 1)).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
