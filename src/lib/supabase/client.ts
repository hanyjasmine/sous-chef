import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./env";

let client: SupabaseClient | null = null;

// one browser client so auth state and token refresh are shared app-wide
export function getSupabase(): SupabaseClient {
  client ??= createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
