"use server";
import { createClient } from "@/lib/supabase/server";
export async function startGtoParticipation(taskType: string, taskId: string) { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Unauthorized"); const { data, error } = await supabase.from("gto_participation").insert({ user_id: user.id, task_type: taskType, task_id: taskId }).select("id").single(); if (error) throw error; return data.id as string; }
export async function finishGtoParticipation(id: string) { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (user) await supabase.from("gto_participation").update({ ended_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id); }
