"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlanCode } from "@/lib/plans";

function admins() { return (process.env.ADMIN_EMAILS || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean); }
export async function reviewPayment(paymentId: string, status: "verified" | "rejected") {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin" && (!user.email || !admins().includes(user.email.toLowerCase()))) throw new Error("Unauthorized");
  const admin = createAdminClient();
  const { data: payment, error: readError } = await admin.from("payments").select("id,user_id,status,plan_code").eq("id", paymentId).single();
  if (readError || !payment || payment.status !== "pending") throw new Error("Payment is no longer pending.");
  if (!isPlanCode(payment.plan_code)) throw new Error("Payment has an invalid access package.");
  const { error } = await admin.rpc("review_payment", { payment_id: paymentId, review_status: status, reviewer_id: user.id });
  if (error) throw error;
  if (status === "verified") {
    // Referral rewards are secondary to access activation; a reward issue must not undo a valid payment approval.
    await admin.rpc("reward_referral_purchase", { referred_user: payment.user_id, verified_payment: payment.id });
  }
  revalidatePath("/admin"); revalidatePath("/admin/payments"); revalidatePath("/dashboard"); revalidatePath("/upgrade");
}

export async function setPremiumAccess(userId: string, enabled: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("users").update({ premium_status: enabled }).eq("id", userId);
  if (error) throw error;
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function grantBonusCredits(userId: string, amount = 50) {
  await assertAdmin();
  if (!Number.isInteger(amount) || amount < 1 || amount > 1000) throw new Error("Invalid credit amount");
  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("credit_balance").eq("id", userId).single();
  const { error } = await admin.from("users").update({ credit_balance: Number(profile?.credit_balance || 0) + amount }).eq("id", userId);
  if (error) throw error;
  await admin.from("credit_transactions").insert({ user_id: userId, amount, reason: "Admin bonus credits" });
  revalidatePath("/admin/payments"); revalidatePath("/dashboard");
}

export async function revokeCoursePasses(userId: string) {
  await assertAdmin();
  const { error } = await createAdminClient().from("user_entitlements").delete().eq("user_id", userId);
  if (error) throw error;
  revalidatePath("/admin/payments"); revalidatePath("/dashboard");
}

export async function toggleCoupon(couponId: string, enabled: boolean) {
  await assertAdmin();
  if (!couponId) throw new Error("Invalid coupon.");
  const { error } = await createAdminClient().from("coupons").update({ is_active: enabled }).eq("id", couponId);
  if (error) throw error;
  revalidatePath("/admin/coupons");
  revalidatePath("/upgrade");
}

export async function createCoupon(formData: FormData) {
  await assertAdmin();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const discountPercent = Number(formData.get("discount_percent"));
  const accessDays = Number(formData.get("access_days"));
  const maxRedemptions = Number(formData.get("max_redemptions"));
  const planCode = String(formData.get("plan_code") || "");
  const startsAtValue = String(formData.get("starts_at") || "");
  const expiresAtValue = String(formData.get("expires_at") || "");
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) throw new Error("Coupon code must be 3-32 letters, numbers, underscores or hyphens.");
  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) throw new Error("Discount must be between 1 and 100 percent.");
  if (!isPlanCode(planCode)) throw new Error("Select a valid access package.");
  if (!Number.isInteger(accessDays) || accessDays < 1) throw new Error("Access days must be a positive whole number.");
  if (!Number.isInteger(maxRedemptions) || maxRedemptions < 1) throw new Error("Maximum redemptions must be a positive whole number.");
  const startsAt = startsAtValue ? new Date(startsAtValue) : new Date();
  const expiresAt = new Date(expiresAtValue);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime()) || expiresAt <= startsAt) throw new Error("Expiry must be later than the start date.");
  const { error } = await createAdminClient().from("coupons").insert({ code, discount_percent: discountPercent, plan_code: planCode, access_days: accessDays, max_redemptions: maxRedemptions, starts_at: startsAt.toISOString(), expires_at: expiresAt.toISOString(), is_active: formData.get("is_active") === "on" });
  if (error) throw new Error(error.code === "23505" ? "That coupon code already exists." : error.message);
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(couponId: string) {
  await assertAdmin();
  if (!couponId) throw new Error("Invalid coupon.");
  const admin = createAdminClient();
  const { count, error: countError } = await admin.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("coupon_id", couponId);
  if (countError) throw countError;
  if ((count || 0) > 0) throw new Error("Redeemed coupons cannot be deleted. Turn the coupon off to preserve its history.");
  const { error } = await admin.from("coupons").delete().eq("id", couponId);
  if (error) throw error;
  revalidatePath("/admin/coupons");
  revalidatePath("/upgrade");
}

export async function blockReferral(referralId: string) {
  await assertAdmin();
  const { error } = await createAdminClient().from("referrals").update({ status: "blocked" }).eq("id", referralId).in("status", ["pending", "qualified"]);
  if (error) throw error;
  revalidatePath("/admin/referrals");
}

async function assertAdmin() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && (!user.email || !admins().includes(user.email.toLowerCase()))) throw new Error("Unauthorized");
}
export async function createNote(formData: FormData) {
  await assertAdmin(); const admin = createAdminClient();
  const { error } = await admin.from("notes").insert({ category: String(formData.get("category")), text_content: String(formData.get("text_content")), language: String(formData.get("language") || "en"), is_premium: formData.get("is_premium") === "on" });
  if (error) throw error; revalidatePath("/admin"); revalidatePath("/dashboard/content");
}
export async function createTest(formData: FormData) {
  await assertAdmin(); const admin = createAdminClient();
  let content: unknown; try { content = JSON.parse(String(formData.get("content"))); } catch { throw new Error("Test content must be valid JSON."); }
  const { error } = await admin.from("tests").insert({ type: String(formData.get("type")), content, time_limit: Number(formData.get("time_limit")), is_premium: formData.get("is_premium") === "on" });
  if (error) throw error; revalidatePath("/admin"); revalidatePath("/dashboard/content");
}
