"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { ensureUserProfile } from "@/lib/ensure-user-profile";

export async function login(formData: FormData) {
  let loginError: string | undefined;
  let destination = "/dashboard";
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      loginError = error.message.toLowerCase().includes("invalid login credentials")
        ? "Incorrect email or password."
        : error.message;
    } else if (data.user) {
      await ensureUserProfile(data.user);
      const user = data.user;
      const adminEmail = user?.email?.toLowerCase();
      const isAdmin = Boolean(adminEmail && (process.env.ADMIN_EMAILS || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).includes(adminEmail));
      revalidatePath("/", "layout");
      const requested = String(formData.get("next") || "");
      const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
      destination = isAdmin ? "/admin" : next;
    } else {
      loginError = "Unable to verify your account. Please try again.";
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    loginError = message.includes("NEXT_PUBLIC_SUPABASE")
      ? "Authentication is not configured. Please contact support."
      : message.includes("candidate profile")
        ? message
        : "The authentication service could not be reached. Please try again shortly.";
  }
  if (loginError) redirect(`/login?error=${encodeURIComponent(loginError)}`);
  redirect(destination);
}

export async function oauthLogin(formData: FormData) {
  const supabase = await createClient();
  const requestOrigin = (await headers()).get("origin");
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  // On production, always send OAuth providers back to the configured public
  // origin. This prevents proxy/request headers from falling back to localhost.
  const origin = process.env.NODE_ENV === "production"
    ? configuredOrigin || requestOrigin || "https://pma-prep-v2.vercel.app"
    : requestOrigin || configuredOrigin || "http://localhost:3000";
  const requested = String(formData.get("next") || "");
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
  const providerValue = String(formData.get("provider") || "google").toLowerCase();
  const allowedProviders = new Set(["google", "github", "facebook"]);
  const provider = allowedProviders.has(providerValue) ? providerValue : "google";
  const referralCode = String(formData.get("referral_code") || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as "google" | "github" | "facebook",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}${referralCode ? `&ref=${encodeURIComponent(referralCode)}` : ""}`,
      ...(provider === "google" ? { queryParams: { access_type: "offline", prompt: "consent" } } : {}),
    },
  });
  if (error || !data.url) redirect(`/login?error=${encodeURIComponent(error?.message || `Unable to start ${provider} sign-in.`)}`);
  redirect(data.url);
}
export async function signup(formData: FormData) {
  let signupError: string | undefined;
  try {
    const supabase = await createClient();
    const referralCode = String(formData.get("referral_code") || "").trim().toUpperCase();
    const { error } = await supabase.auth.signUp({ email: String(formData.get("email")), password: String(formData.get("password")), options: { data: { name: String(formData.get("name")), referral_code: referralCode || null } } });
    signupError = error?.message;
  } catch (error) {
    const message = error instanceof Error && error.message.includes("NEXT_PUBLIC_SUPABASE")
      ? "Supabase is not configured. Add your project URL and anon key to .env.local."
      : "Unable to create your account right now. Check your Supabase connection and try again.";
    signupError = message;
  }
  if (signupError) redirect(`/signup?error=${encodeURIComponent(signupError)}`);
  const requested = String(formData.get("next") || "");
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
  redirect(`/login?message=${encodeURIComponent("Check your email to confirm your account.")}&next=${encodeURIComponent(next)}`);
}
export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); revalidatePath("/", "layout"); redirect("/"); }
