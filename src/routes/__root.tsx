import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import mixpanel from "mixpanel-browser";
import Smartlook from "smartlook-client";

import appCss from "../styles.css?url";
import { CookieConsent } from "../components/CookieConsent";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#F7F5F2" },
      { title: "MIRROR — Your Digital Wardrobe" },
      { name: "description", content: "An AI-powered personal stylist. Build your digital wardrobe, plan outfits, and discover your style DNA." },
      { property: "og:title", content: "MIRROR — Your Digital Wardrobe" },
      { property: "og:description", content: "An AI-powered personal stylist. Build your digital wardrobe, plan outfits, and discover your style DNA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MIRROR — Your Digital Wardrobe" },
      { name: "twitter:description", content: "An AI-powered personal stylist. Build your digital wardrobe, plan outfits, and discover your style DNA." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=630&fit=crop" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=630&fit=crop" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  useEffect(() => {
    const initTracking = (consent: any) => {
      if (consent?.analytics) {
        // Initialize Mixpanel
        mixpanel.init("3051daf61a8e7f1cb93fe11fd750514d", {
          debug: true,
          track_pageview: true,
          persistence: "localStorage",
        });

        // Initialize Smartlook
        Smartlook.init("fd606eadba4118d345eb176e29a390dc2ce1c8f1");
        console.log("[Tracking] Analytics initialized with consent");
      }
    };

    // Check initial consent
    const raw = localStorage.getItem("mirror.cookie_consent.v1");
    if (raw) {
      initTracking(JSON.parse(raw));
    }

    // Listen for consent changes
    const handleConsentChange = (e: any) => {
      initTracking(e.detail);
    };

    window.addEventListener("mirror:consent-change", handleConsentChange);
    return () => window.removeEventListener("mirror:consent-change", handleConsentChange);
  }, []);

  useEffect(() => {
    // Track page views on location change (only if initialized)
    if (mixpanel && (mixpanel as any)._flags?.identify_called !== undefined) {
      mixpanel.track("page_view", {
        path: location.pathname,
      });
    }
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <CookieConsent />
    </QueryClientProvider>
  );
}
