"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

async function requireNotesAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && !isAdminEmail(user.email)) throw new Error("Unauthorized");
  return user;
}

function fields(formData: FormData) {
  const title = String(formData.get("title") || "").trim(); const category = String(formData.get("category") || "").trim();
  const language = String(formData.get("language") || "en"); const access_type = String(formData.get("access_type") || "free");
  if (!title || !category || !["en", "ur"].includes(language) || !["free", "premium"].includes(access_type)) throw new Error("Please provide valid note details.");
  return { title, category, language, access_type };
}

export async function uploadPdfNote(formData: FormData) {
  const user = await requireNotesAdmin(); const file = formData.get("file"); const details = fields(formData);
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a PDF file.");
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Only PDF files are allowed.");
  if (file.size > 15 * 1024 * 1024) throw new Error("PDF files must be 15 MB or smaller.");
  const admin = createAdminClient(); const path = `${user.id}/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await admin.storage.from("notes-pdfs").upload(path, file, { contentType: "application/pdf", upsert: false });
  if (uploadError) throw uploadError;
  const { error } = await admin.from("notes").insert({ ...details, file_url: path, uploaded_by: user.id, text_content: details.title, is_premium: details.access_type === "premium" });
  if (error) { await admin.storage.from("notes-pdfs").remove([path]); throw error; }
  revalidatePath("/admin/notes");
}

export async function updatePdfNote(formData: FormData) {
  await requireNotesAdmin(); const details = fields(formData); const id = String(formData.get("id") || ""); if (!id) throw new Error("Invalid note.");
  const { error } = await createAdminClient().from("notes").update({ ...details, is_premium: details.access_type === "premium" }).eq("id", id);
  if (error) throw error; revalidatePath("/admin/notes"); revalidatePath(`/notes/${id}`);
}

export async function deletePdfNote(formData: FormData) {
  await requireNotesAdmin(); const id = String(formData.get("id") || ""); const admin = createAdminClient();
  const { data, error: readError } = await admin.from("notes").select("file_url").eq("id", id).single(); if (readError || !data?.file_url) throw new Error("Note not found.");
  const { error } = await admin.from("notes").delete().eq("id", id); if (error) throw error;
  await admin.storage.from("notes-pdfs").remove([data.file_url]); revalidatePath("/admin/notes");
}
