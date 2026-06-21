import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import mixpanel from "mixpanel-browser";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        syncOnboardingAndNavigate(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        syncOnboardingAndNavigate(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const syncOnboardingAndNavigate = async (user: any) => {
    // Identify user in Mixpanel
    mixpanel.identify(user.id);
    mixpanel.people.set({
      "$email": user.email,
      "$last_login": new Date().toISOString(),
    });
    mixpanel.track("login_success");

    // 1. Check if we have onboarding data in localStorage
    const STORAGE_KEY = "mirror-onboarding-v1";
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const state = parsed.state;

        if (state) {
          // 2. Sync to profiles table
          const { error } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              name: state.name,
              age: state.age ? parseInt(state.age) : null,
              gender: state.gender,
              body_shape: state.bodyShape,
              onboarding_completed: localStorage.getItem("onboarding_completed") === "true",
              preferences: {
                styleTags: state.styleTags,
                favoriteBrands: state.favoriteBrands,
                connectedBrands: state.connectedBrands,
                occasions: state.occasions,
                budget: state.budget,
                sustainable: state.sustainable,
                capsule: state.capsule
              },
              measurements: {
                heightCm: state.heightCm,
                weightKg: state.weightKg,
                units: state.units,
                region: state.region,
                size: state.size
              }
            });

          if (!error) {
            console.log("Onboarding data synced to profile");
            localStorage.removeItem(STORAGE_KEY);
          } else {
            console.error("Error syncing profile:", error);
          }
        }
      } catch (e) {
        console.error("Failed to parse onboarding data:", e);
      }
    }

    navigate({ to: "/" });
  };

  return (
    <main className="page-gradient min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface p-8 rounded-[2rem] border border-border shadow-soft relative">
        <Link
          to="/"
          className="absolute left-6 top-6 h-10 w-10 flex items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="text-center mb-8 pt-6">
          <p className="text-[10px] text-gold mb-2" style={{ fontFamily: "var(--font-label)", letterSpacing: "0.28em" }}>
            MIRROR
          </p>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>
            Welkom terug
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Log in of maak een account aan om je kledingkast te beveiligen.
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#C8A97E',
                  brandAccent: '#B6976D',
                },
              },
            },
            className: {
              container: 'auth-container',
              button: 'pill-button w-full',
              input: 'floating-label-input',
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                button_label: 'Inloggen',
              },
              sign_up: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                button_label: 'Account aanmaken',
              }
            }
          }}
          providers={[]}
        />
      </div>
    </main>
  );
}
