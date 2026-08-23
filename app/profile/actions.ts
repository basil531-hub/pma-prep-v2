"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await currentUser();
  const name = String(formData.get("name") || "").trim();
  const avatarUrl = String(formData.get("avatar_url") || "").trim() || null;
  const enrolledCourse = String(formData.get("enrolled_course") || "PMA Initial");
  const preferences = { language: String(formData.get("language") || "en"), weekly_goal: Number(formData.get("weekly_goal") || 5) };
  const { error } = await supabase.from("users").update({ name, avatar_url: avatarUrl, enrolled_course: enrolledCourse, preferences }).eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/profile"); revalidatePath("/dashboard");
}

export async function updatePassword(formData: FormData) {
  const { supabase } = await currentUser();
  const password = String(formData.get("password") || "");
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  redirect("/profile?message=Password updated");
}