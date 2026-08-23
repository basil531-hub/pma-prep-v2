"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message || fallback;

  if (typeof error === "object" && error && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }

  return fallback;
}

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized. Please sign in with an admin account.");

  let { data: profile } = await supabase.from("users").select("id,role,name,email").eq("id", user.id).maybeSingle();

  if (!profile) {
    const safeName = user.user_metadata?.name || user.email?.split("@")[0] || "Admin";
    const admin = createAdminClient();
    const { data: insertedProfile, error: insertError } = await admin
      .from("users")
      .upsert(
        {
          id: user.id,
          name: safeName,
          email: user.email || `${user.id}@local.admin`,
          role: isAdminEmail(user.email) ? "admin" : "user",
          enrolled_course: "PMA Initial",
          progress: 0,
          premium_status: false,
        },
        { onConflict: "id" },
      )
      .select("id,role,name,email")
      .maybeSingle();

    if (insertError) {
      throw new Error(normalizeError(insertError, "Unable to create the admin profile record."));
    }

    profile = insertedProfile;
  }

  if (!profile || (profile.role !== "admin" && !isAdminEmail(user.email))) {
    throw new Error("Unauthorized. Please sign in with an admin account.");
  }

  return user;
}

export async function createNonVerbalMcq(formData: FormData) {
  const user = await assertAdmin();
  const file = formData.get("image");
  const question = String(formData.get("question") || "").trim();
  const options = ["A", "B", "C", "D", "E"]
    .map((key) => String(formData.get(`option_${key}`) || "").trim())
    .filter(Boolean);
  const correctAnswer = String(formData.get("correct_answer") || "").trim();

  if (!(file instanceof File) || !file.size) throw new Error("Please choose a diagram image before publishing.");
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error("Only PNG, JPG, or WEBP images up to 5 MB are allowed.");
  }
  if (options.length < 2 || options.length > 5 || !options.includes(correctAnswer)) {
    throw new Error("Add at least two valid options and select a matching correct answer.");
  }

  const admin = createAdminClient();
  const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error: uploadError } = await admin.storage.from("non-verbal-mcqs").upload(path, file, { contentType: file.type });

  if (uploadError) {
    throw new Error(normalizeError(uploadError, "The diagram upload failed. Please try a smaller image."));
  }

  const { data: existingUser } = await admin.from("users").select("id").eq("id", user.id).maybeSingle();

  const { error } = await admin.from("non_verbal_mcqs").insert({
    question: question || null,
    image_url: path,
    options,
    correct_answer: correctAnswer,
    created_by: existingUser?.id ?? null,
  });

  if (error) {
    await admin.storage.from("non-verbal-mcqs").remove([path]);
    throw new Error(normalizeError(error, "The question could not be saved. Please check the values and try again."));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/initial-mcqs");
  revalidatePath("/initial/mcqs/non-verbal");
}

export async function updateNonVerbalMcq(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const question = String(formData.get("question") || "").trim();
  const options = ["A", "B", "C", "D", "E"]
    .map((key) => String(formData.get(`option_${key}`) || "").trim())
    .filter(Boolean);
  const correctAnswer = String(formData.get("correct_answer") || "").trim();

  if (!id) throw new Error("Question ID is required.");
  if (options.length < 2 || options.length > 5 || !options.includes(correctAnswer)) {
    throw new Error("Add at least two valid options and select a matching correct answer.");
  }

  const admin = createAdminClient();
  const file = formData.get("image");
  let imageUrl: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      throw new Error("Only PNG, JPG, or WEBP images up to 5 MB are allowed.");
    }

    const { data: current } = await admin.from("non_verbal_mcqs").select("image_url").eq("id", id).single();
    if (current?.image_url) await admin.storage.from("non-verbal-mcqs").remove([current.image_url]);

    const path = `${crypto.randomUUID()}-${(file.name || "diagram").replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await admin.storage.from("non-verbal-mcqs").upload(path, file, { contentType: file.type });

    if (uploadError) {
      throw new Error(normalizeError(uploadError, "The diagram upload failed while updating the question."));
    }

    imageUrl = path;
  }

  const { error } = await admin.from("non_verbal_mcqs").update({
    question: question || null,
    options,
    correct_answer: correctAnswer,
    ...(imageUrl ? { image_url: imageUrl } : {}),
  }).eq("id", id);

  if (error) {
    throw new Error(normalizeError(error, "The question could not be updated."));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/initial-mcqs");
  revalidatePath("/initial/mcqs/non-verbal");
}

export async function deleteNonVerbalMcq(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") || "");
  const admin = createAdminClient();

  const { data, error: readError } = await admin.from("non_verbal_mcqs").select("image_url").eq("id", id).single();
  if (readError || !data) throw new Error("Question not found.");

  const { error } = await admin.from("non_verbal_mcqs").delete().eq("id", id);
  if (error) throw new Error(normalizeError(error, "Unable to delete the diagram question."));

  await admin.storage.from("non-verbal-mcqs").remove([data.image_url]);
  revalidatePath("/admin");
  revalidatePath("/admin/initial-mcqs");
  revalidatePath("/initial/mcqs/non-verbal");
}
