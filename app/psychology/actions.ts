"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/ensure-user-profile";

export async function startPsychologyParticipation(testType: string) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to start a practice session.");
  if(!["WAT","SCT","TAT","SelfDescription"].includes(testType))throw new Error("Invalid psychology session.");
  const admin=await ensureUserProfile(user);
  const { data, error } = await admin.from("psychology_participation").insert({ user_id: user.id, test_type: testType }).select("id").single();
  if (error) throw new Error(error.message.toLowerCase().includes("not enough practice credits")?"You need 15 credits to start this session.":"This session could not be started. Please try again."); return data.id as string;
}
export async function finishPsychologyParticipation(id: string) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
  await supabase.from("psychology_participation").update({ ended_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
}
