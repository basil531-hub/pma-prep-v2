"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("users").select("role").eq("id", user.id).single() : { data: null };
  if (!user || (profile?.role !== "admin" && !isAdminEmail(user.email))) throw new Error("Unauthorized");
  return user;
}

function cleanOptions(formData: FormData) {
  return ["A", "B", "C", "D"].map((key) => String(formData.get(`option_${key}`) || "").trim());
}

export async function bulkUploadInitialQuestions(formData: FormData) {
  const user = await assertAdmin();
  const testId = String(formData.get("test_id") || "");
  const file = formData.get("file");
  if (!testId) throw new Error("Choose an Initial Course test first.");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a CSV or Excel file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Files must be 5 MB or smaller.");

  const { default: XLSX } = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("The file has no worksheet.");
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (!rows.length) throw new Error("The file has no rows.");

  const get = (row: Record<string, unknown>, ...keys: string[]) => {
    const entry = Object.entries(row).find(([key]) => keys.includes(key.trim().toLowerCase()));
    return String(entry?.[1] ?? "").trim();
  };
  const records = rows.map((row, index) => {
    const questionText = get(row, "question_text", "question");
    const options = ["a", "b", "c", "d"].map((key) => get(row, `option_${key}`, `option ${key}`, key));
    const correctAnswer = get(row, "correct_answer", "correct answer").toUpperCase();
    if (!questionText || options.some((option) => !option) || !["A", "B", "C", "D"].includes(correctAnswer)) {
      throw new Error(`Row ${index + 2}: question, four options, and a valid correct_answer (A-D) are required.`);
    }
    return { test_id: testId, question_text: questionText, options, correct_answer: correctAnswer, created_by: user.id };
  });

  const admin = createAdminClient();
  const { data: last } = await admin.from("initial_questions").select("sort_order").eq("test_id", testId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const startOrder = Number(last?.sort_order || 0);
  const { error } = await admin.from("initial_questions").insert(records.map((record, index) => ({ ...record, sort_order: startOrder + index + 1, image_url: null })));
  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/initial-mcqs");
  revalidatePath("/initial/mcqs");
}

export async function createInitialQuestion(formData: FormData) {
  const user = await assertAdmin();
  const questionText = String(formData.get("question_text") || "").trim();
  const testId = String(formData.get("test_id") || "");
  const options = cleanOptions(formData);
  const correctAnswer = String(formData.get("correct_answer") || "").trim();
  const rawImage = formData.get("image");

  if (!testId || !questionText || options.some((option) => !option) || !options.includes(correctAnswer)) {
    throw new Error("Question, four options, and a valid correct answer are required.");
  }

  let imageUrl: string | null = null;

  if (rawImage instanceof File && rawImage.size > 0) {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    if (!allowed.includes(rawImage.type)) throw new Error("Only PNG, JPG, or WebP images are allowed.");
    if (rawImage.size > 5 * 1024 * 1024) throw new Error("Image uploads must be under 5 MB.");

    const admin = createAdminClient();
    const path = `${user.id}/${crypto.randomUUID()}-${rawImage.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await admin.storage.from("non-verbal-mcqs").upload(path, rawImage, { contentType: rawImage.type, upsert: false });
    if (uploadError) throw uploadError;
    imageUrl = path;
  }

  const admin = createAdminClient();
  const { data: last } = await admin.from("initial_questions").select("sort_order").eq("test_id", testId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await admin.from("initial_questions").insert({
    test_id: testId,
    question_text: questionText,
    options,
    correct_answer: correctAnswer,
    image_url: imageUrl,
    sort_order: Number(last?.sort_order || 0) + 1,
    created_by: user.id,
  });

  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/initial/mcqs");
}

export async function updateInitialQuestion(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const questionText = String(formData.get("question_text") || "").trim();
  const options = cleanOptions(formData);
  const correctAnswer = String(formData.get("correct_answer") || "").trim();
  const rawImage = formData.get("image");

  if (!id || !questionText || options.some((option) => !option) || !options.includes(correctAnswer)) {
    throw new Error("Question, four options, and a valid correct answer are required.");
  }

  const admin = createAdminClient();
  const { data: existing, error: readError } = await admin.from("initial_questions").select("image_url").eq("id", id).single();
  if (readError && readError.code !== "PGRST116") throw readError;

  let imageUrl = existing?.image_url ?? null;

  if (rawImage instanceof File && rawImage.size > 0) {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    if (!allowed.includes(rawImage.type)) throw new Error("Only PNG, JPG, or WebP images are allowed.");
    if (rawImage.size > 5 * 1024 * 1024) throw new Error("Image uploads must be under 5 MB.");

    const path = `${crypto.randomUUID()}-${rawImage.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await admin.storage.from("non-verbal-mcqs").upload(path, rawImage, { contentType: rawImage.type, upsert: false });
    if (uploadError) throw uploadError;
    imageUrl = path;
  }

  const { error } = await admin.from("initial_questions").update({
    question_text: questionText,
    options,
    correct_answer: correctAnswer,
    image_url: imageUrl,
  }).eq("id", id);

  if (error) {
    if (imageUrl && imageUrl !== existing?.image_url) await admin.storage.from("non-verbal-mcqs").remove([imageUrl]);
    throw error;
  }
  if (existing?.image_url && imageUrl !== existing.image_url) await admin.storage.from("non-verbal-mcqs").remove([existing.image_url]);
  revalidatePath("/admin");
  revalidatePath("/initial/mcqs");
}

export async function deleteInitialQuestion(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Question ID is required.");

  const admin = createAdminClient();
  const { data: question, error: readError } = await admin.from("initial_questions").select("image_url").eq("id", id).single();
  if (readError || !question) throw new Error("Question not found.");

  const { error } = await admin.from("initial_questions").delete().eq("id", id);
  if (error) throw error;

  if (question.image_url) {
    await admin.storage.from("non-verbal-mcqs").remove([question.image_url]);
  }

  revalidatePath("/admin");
  revalidatePath("/initial/mcqs");
}

export async function bulkDeleteInitialQuestions(formData: FormData) {
  await assertAdmin();
  let ids: string[];
  try {
    ids = JSON.parse(String(formData.get("ids") || "[]"));
  } catch {
    throw new Error("Invalid question selection.");
  }
  ids = Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string" && id.length > 0) : [];
  if (!ids.length) throw new Error("Select at least one question to delete.");

  const admin = createAdminClient();
  const { data: questions, error: readError } = await admin.from("initial_questions").select("image_url").in("id", ids);
  if (readError) throw readError;
  const { error } = await admin.from("initial_questions").delete().in("id", ids);
  if (error) throw error;
  const imagePaths = (questions || []).map((question) => question.image_url).filter(Boolean);
  if (imagePaths.length) await admin.storage.from("non-verbal-mcqs").remove(imagePaths);

  revalidatePath("/admin");
  revalidatePath("/admin/initial-mcqs");
  revalidatePath("/initial/mcqs");
}
