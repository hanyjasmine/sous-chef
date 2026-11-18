import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

// only same-site paths, so the callback can't be used as an open redirect
function safeNext(next: string | null) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
