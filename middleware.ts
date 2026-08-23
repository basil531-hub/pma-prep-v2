import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => request.cookies.getAll(), setAll(items: { name: string; value: string; options: CookieOptions }[]) { items.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {}
  if (!user && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/upgrade") || request.nextUrl.pathname.startsWith("/admin"))) { const url = request.nextUrl.clone(); url.pathname = "/login"; return NextResponse.redirect(url); }
  if (user) {
    const path = request.nextUrl.pathname;
    const resultPage = path.startsWith("/initial/mcqs/results/") || path === "/psychology/mechanical/result";
    const scope = resultPage ? null : path.startsWith("/initial/") ? "initial" : path.startsWith("/psychology") || path.startsWith("/gto") || path === "/issb" || path.startsWith("/issb-path") || path.startsWith("/group-tasks") ? "issb" : null;
    if (scope) {
      const minimumCredits = scope === "initial" ? 25 : 15;
      const [{ data: profile }, { data: entitlement }] = await Promise.all([
        supabase.from("users").select("credit_balance,premium_status").eq("id", user.id).maybeSingle(),
        supabase.from("user_entitlements").select("id").eq("user_id", user.id).eq("scope", scope).gt("expires_at", new Date().toISOString()).limit(1).maybeSingle(),
      ]);
      if (profile && !profile.premium_status && !entitlement && Number(profile.credit_balance || 0) < minimumCredits) {
        const url = request.nextUrl.clone();
        url.pathname = "/upgrade";
        url.search = `?plan=${scope}&reason=credits`;
        return NextResponse.redirect(url);
      }
    }
  }
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
