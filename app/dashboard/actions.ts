"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/ensure-user-profile";

export async function recordPracticeAttempt(module: string, score: number, testId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const admin = await ensureUserProfile(user);
  const { error } = await admin.from("practice_attempts").insert({ user_id: user.id, module, score, test_id: testId || null });
  if (error) throw new Error(error.message.toLowerCase().includes("not enough practice credits") ? "You do not have enough credits for this attempt. Choose a pass or earn referral credits." : error.code === "23503" ? "Your account or test could not be matched. Refresh and try again." : "We could not record this attempt. Please try again.");
  await admin.from("daily_activity").upsert({ user_id: user.id, activity_date: new Date().toISOString().slice(0, 10), minutes: 1 }, { onConflict: "user_id,activity_date" });
  if (module.toLowerCase().includes("psychology")) {
    const { count } = await admin.from("practice_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).ilike("module", "%psychology%");
    const { data: badge } = await admin.from("badges").select("id").eq("slug", (count || 0) >= 5 ? "psychology-master" : "psychology-starter").single();
    if (badge) await admin.from("user_badges").upsert({ user_id: user.id, badge_id: badge.id }, { onConflict: "user_id,badge_id" });
  }
  revalidatePath("/", "layout"); revalidatePath("/dashboard"); revalidatePath("/dashboard/progress");
}
