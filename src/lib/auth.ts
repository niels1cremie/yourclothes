import { supabase } from "@/integrations/supabase/client";

// Resolves the currently authenticated Supabase user id, or null when no one
// is signed in. The app has no login UI yet, so callers must handle null and
// fall back gracefully (local persistence / empty state).
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
