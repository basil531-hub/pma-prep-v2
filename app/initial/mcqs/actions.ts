"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/ensure-user-profile";

type Answer = { questionId: string; answer: string };

export async function saveInitialResult(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const testId = String(formData.get("test_id") || "");
  const answers = JSON.parse(String(formData.get("answers") || "[]")) as Answer[];
  const questionIds = JSON.parse(String(formData.get("question_ids") || "[]")) as string[];
  const timeTaken = Math.max(0, Number(formData.get("time_taken")) || 0);
  const { data: test, error: testError } = await supabase.from("initial_tests").select("id,type,total_questions,passing_marks").eq("id", testId).single();
  if (testError || !test) throw new Error("Test is not available.");
  const submitted = new Map(answers.map((answer) => [answer.questionId, answer.answer]));
  if (!Array.isArray(questionIds) || !questionIds.length || questionIds.length > test.total_questions || new Set(questionIds).size !== questionIds.length) throw new Error("The submitted question set is invalid.");
  if ([...submitted.keys()].some((id) => !questionIds.includes(id))) throw new Error("An answer does not belong to this attempt.");
  const { data: questions, error: questionError } = await supabase.from("initial_questions").select("id,correct_answer").eq("test_id", testId).in("id", questionIds);
  if (questionError) throw questionError;
  if ((questions || []).length !== questionIds.length) throw new Error("One or more submitted questions are invalid.");
  const score = (questions || []).reduce((total, question) => total + (submitted.get(question.id) === question.correct_answer ? 1 : 0), 0);
  const percentage = questions?.length ? Math.round((score / questions.length) * 10000) / 100 : 0;
  const passed = percentage >= Number(test.passing_marks);
  const admin = await ensureUserProfile(user);
  const { data: result, error } = await admin.rpc("record_initial_result", { candidate_user: user.id, initial_test_id: test.id, result_score: score, result_percentage: percentage, result_time_taken: timeTaken, result_passed: passed });
  if (error || !result) throw new Error(error?.code === "23503" ? "Your test or profile is no longer available. Refresh the page and try again." : "We could not save your result. Please try again.");
  revalidatePath(`/initial/mcqs/results/${result}`);
  return result;
}
