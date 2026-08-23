"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/ensure-user-profile";
import { recordPracticeAttempt } from "@/app/dashboard/actions";

export async function saveNonVerbalResults(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const answers = JSON.parse(String(formData.get("answers") || "[]")) as Array<{ mcqId: string; selectedOption: string }>;
  const timeTaken = Math.max(0, Number(formData.get("time_taken")) || 0);
  const { data: questions, error } = await supabase.from("non_verbal_mcqs").select("id,correct_answer").in("id", answers.map((answer) => answer.mcqId));
  if (error) throw error;
  const correct = new Map((questions || []).map((question) => [question.id, question.correct_answer]));
  const rows = answers.map((answer) => ({ user_id: user.id, mcq_id: answer.mcqId, selected_option: answer.selectedOption, is_correct: correct.get(answer.mcqId) === answer.selectedOption, time_taken: timeTaken }));
  const admin = await ensureUserProfile(user);
  if (rows.length) { const { error: insertError } = await admin.from("non_verbal_results").insert(rows); if (insertError) throw new Error(insertError.code === "23503" ? "Your test or profile is no longer available. Refresh and try again." : "We could not save your result. Please try again."); }
  const score = rows.filter((row) => row.is_correct).length;
  const percentage = rows.length ? Math.round((score / rows.length) * 10000) / 100 : 0;
  await recordPracticeAttempt("Initial Non-Verbal", percentage);
  redirect(`/initial/mcqs/results/non-verbal?score=${score}&total=${rows.length}&percentage=${percentage}&time=${timeTaken}`);
}
