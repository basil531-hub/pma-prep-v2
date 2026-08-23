"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { accessPlans, isPlanCode } from "@/lib/plans";

export type PaymentSubmissionState = { ok: boolean; error?: string };
export type CouponState = { ok: boolean; error?: string; plan?: string; days?: number };

export async function redeemLaunchCoupon(_: CouponState, formData: FormData): Promise<CouponState> {
  const code = String(formData.get("coupon_code") || "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return { ok: false, error: "Enter a valid coupon code." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in before redeeming a coupon." };
  const { data, error } = await supabase.rpc("redeem_coupon", { coupon_code: code });
  if (error) return { ok: false, error: error.message.replace(/^.*?: /, "") };
  const result = Array.isArray(data) ? data[0] : data;
  revalidatePath("/upgrade"); revalidatePath("/dashboard");
  return { ok: true, plan: String(result?.plan_code || "complete"), days: Number(result?.access_days || 30) };
}

export async function submitPayment(_: PaymentSubmissionState, formData: FormData): Promise<PaymentSubmissionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "Please sign in again before submitting payment." };

  const transactionId = String(formData.get("transaction_id") || "").trim().toUpperCase();
  const planCode = String(formData.get("plan_code") || "");
  const screenshot = formData.get("screenshot");
  if (!/^[A-Z0-9-]{6,40}$/.test(transactionId)) return { ok: false, error: "Enter a valid 6–40 character transaction ID." };
  if (!isPlanCode(planCode)) return { ok: false, error: "Select a valid access package." };
  if (!(screenshot instanceof File) || screenshot.size === 0) return { ok: false, error: "Attach your payment screenshot." };
  if (screenshot.size > 5_000_000) return { ok: false, error: "Screenshot must be smaller than 5 MB." };
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(screenshot.type)) return { ok: false, error: "Upload a JPG, PNG or WebP screenshot." };

  const admin = createAdminClient();
  const { error: profileError } = await admin.from("users").upsert({
    id: user.id,
    name: String(user.user_metadata?.name || user.email.split("@")[0]),
    email: user.email,
  }, { onConflict: "id", ignoreDuplicates: true });
  if (profileError) return { ok: false, error: "We could not prepare your billing profile. Please try again." };

  const { data: existing } = await admin.from("payments").select("id,status").eq("transaction_id", transactionId).maybeSingle();
  if (existing) return { ok: false, error: existing.status === "pending" ? "This transaction is already under review." : "This transaction ID has already been used." };

  const amount = accessPlans[planCode].price;
  const extension = screenshot.type === "image/png" ? "png" : screenshot.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const bytes = await screenshot.arrayBuffer();
  const { error: uploadError } = await admin.storage.from("payment-screenshots").upload(path, bytes, { contentType: screenshot.type, upsert: false });
  if (uploadError) return { ok: false, error: "Screenshot upload failed. Please try again." };

  const { error: insertError } = await admin.from("payments").insert({ user_id: user.id, transaction_id: transactionId, screenshot_url: path, amount, plan_code: planCode, status: "pending" });
  if (insertError) {
    await admin.storage.from("payment-screenshots").remove([path]);
    return { ok: false, error: insertError.code === "23503" ? "Your account profile is still being prepared. Sign out, sign in and try again." : "Payment submission failed. Please try again." };
  }

  revalidatePath("/upgrade");
  revalidatePath("/admin");
  return { ok: true };
}
