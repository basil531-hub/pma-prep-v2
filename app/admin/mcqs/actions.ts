"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

const categories = ["Math", "English", "GK", "Psychology"] as const;
const answers = ["A", "B", "C", "D"] as const;
const difficulties = ["easy", "medium", "hard"] as const;

export async function assertMcqAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && !isAdminEmail(user.email)) throw new Error("Unauthorized");
  return user;
}

function readMcq(formData: FormData) {
  const category = String(formData.get("category"));
  const difficulty = String(formData.get("difficulty"));
  const correctAnswer = String(formData.get("correct_answer"));
  if (!categories.includes(category as typeof categories[number]) || !difficulties.includes(difficulty as typeof difficulties[number]) || !answers.includes(correctAnswer as typeof answers[number])) throw new Error("Invalid MCQ fields.");
  const options = Object.fromEntries(answers.map((answer) => [answer, String(formData.get(`option_${answer}`) || "").trim()]));
  if (!String(formData.get("question") || "").trim() || Object.values(options).some((option) => !option)) throw new Error("Question and all four options are required.");
  return { question: String(formData.get("question")).trim(), options, correct_answer: correctAnswer, category, difficulty };
}

export async function createMcq(formData: FormData) {
  const user = await assertMcqAdmin();
  const { error } = await createAdminClient().from("mcqs").insert({ ...readMcq(formData), created_by: user.id });
  if (error) throw error;
  revalidatePath("/admin/mcqs");
}

export async function updateMcq(formData: FormData) {
  await assertMcqAdmin();
  const { error } = await createAdminClient().from("mcqs").update(readMcq(formData)).eq("id", String(formData.get("id")));
  if (error) throw error;
  revalidatePath("/admin/mcqs");
}

export async function deleteMcq(formData: FormData) {
  await assertMcqAdmin();
  const { error } = await createAdminClient().from("mcqs").delete().eq("id", String(formData.get("id")));
  if (error) throw error;
  revalidatePath("/admin/mcqs");
}

export async function bulkUploadMcqs(formData: FormData) {
  const user = await assertMcqAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a CSV or Excel file.");
  const { default: XLSX } = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
  const records = rows.map((row) => {
    const get = (key: string) => String(row[key] ?? row[key.toLowerCase()] ?? "").trim();
    const options = { A: get("A"), B: get("B"), C: get("C"), D: get("D") };
    const category = get("category"); const difficulty = get("difficulty").toLowerCase(); const correctAnswer = get("correct_answer").toUpperCase();
    if (!get("question") || Object.values(options).some((option) => !option) || !categories.includes(category as typeof categories[number]) || !difficulties.includes(difficulty as typeof difficulties[number]) || !answers.includes(correctAnswer as typeof answers[number])) throw new Error("Each row needs question, A-D, correct_answer, category, and difficulty.");
    return { question: get("question"), options, correct_answer: correctAnswer, category, difficulty, created_by: user.id };
  });
  if (!records.length) throw new Error("The file has no rows.");
  const { error } = await createAdminClient().from("mcqs").insert(records);
  if (error) throw error;
  revalidatePath("/admin/mcqs");
}
