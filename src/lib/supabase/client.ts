import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getClientEnv } from "@/lib/config/client-env";

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  const env = getClientEnv();
  return Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  const env = getClientEnv();
  browserClient = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
