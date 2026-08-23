import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;
  const requested = url.searchParams.get("next") || "/dashboard";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
  const referralCode = (url.searchParams.get("ref") || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
  if (!code) return NextResponse.redirect(`${origin}/login?error=OAuth%20sign-in%20was%20cancelled.`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);

  const { data: { user } } = await supabase.auth.getUser();
  if (user && referralCode) await supabase.rpc("register_referral", { invited_user: user.id, code: referralCode });
  const email = user?.email?.toLowerCase() || "";
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return NextResponse.redirect(`${origin}${admins.includes(email) ? "/admin" : next}`);
}
