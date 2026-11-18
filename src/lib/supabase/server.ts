import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseKey, supabaseUrl } from "./env";

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });
}
