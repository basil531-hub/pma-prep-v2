"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
async function assertAdmin() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); const { data: profile } = user ? await supabase.from("users").select("role").eq("id", user.id).single() : { data: null }; if (!user || (profile?.role !== "admin" && !isAdminEmail(user.email))) throw new Error("Unauthorized"); return user; }
function text(form: FormData, name: string) { const value = String(form.get(name) || "").trim(); if (!value) throw new Error(`${name} is required.`); return value; }
export async function createWatItem(form: FormData) { await assertAdmin(); const { error } = await createAdminClient().from("wat").insert({ word: text(form, "word") }); if (error) throw error; revalidatePath("/admin/psychology"); revalidatePath("/psychology/wat"); }
export async function bulkUploadWat(form: FormData) {
	await assertAdmin();
	const file = form.get("file");
	if (!(file instanceof File) || file.size === 0) throw new Error("Choose a CSV or Excel file.");
	if (file.size > 5 * 1024 * 1024) throw new Error("Files must be 5 MB or smaller.");
	const { default: XLSX } = await import("xlsx");
	const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	if (!sheet) throw new Error("The file has no worksheet.");
	const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
	const records = rows.map((row, index) => {
		const get = (key: string) => String(row[key] ?? row[key.toLowerCase()] ?? "").trim();
		const word = get("word");
		if (!word) throw new Error(`Row ${index + 2}: word is required.`);
		return { word };
	});
	if (!records.length) throw new Error("The file has no rows.");
	const { error } = await createAdminClient().from("wat").insert(records);
	if (error) throw error;
	revalidatePath("/admin/psychology");
	revalidatePath("/psychology/wat");
}
async function spreadsheetRows(form: FormData) {
	const file = form.get("file");
	if (!(file instanceof File) || file.size === 0) throw new Error("Choose a CSV or Excel file.");
	if (file.size > 5 * 1024 * 1024) throw new Error("Files must be 5 MB or smaller.");
	const { default: XLSX } = await import("xlsx");
	const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	if (!sheet) throw new Error("The file has no worksheet.");
	const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
	if (!rows.length) throw new Error("The file has no rows.");
	return rows;
}
function cell(row: Record<string, unknown>, key: string) { return String(row[key] ?? row[key.toLowerCase()] ?? "").trim(); }
export async function bulkUploadOpi(form: FormData) {
	await assertAdmin();
	const rows = await spreadsheetRows(form);
	const scale = ["Strongly Disagree", "Mostly Disagree", "Slightly Disagree", "Neutral", "Slightly Agree", "Mostly Agree", "Strongly Agree"];
	const records = rows.map((row, index) => {
		const statement = cell(row, "statement") || cell(row, "question");
		if (!statement) throw new Error(`Row ${index + 2}: statement is required.`);
		if (statement.length > 500) throw new Error(`Row ${index + 2}: statement must be 500 characters or fewer.`);
		return { type: "Personality", content: { statement, scale }, time_limit: 2400, is_premium: false };
	});
	const { error } = await createAdminClient().from("tests").insert(records);
	if (error) throw error;
	revalidatePath("/admin/psychology");
	revalidatePath("/psychology/opi");
}
export async function bulkUploadSct(form: FormData) {
	await assertAdmin();
	const rows = await spreadsheetRows(form);
	const records = rows.map((row, index) => {
		const sentence = cell(row, "sentence");
		const language = cell(row, "language") || "en";
		if (!sentence) throw new Error(`Row ${index + 2}: sentence is required.`);
		if (!["en", "ur"].includes(language)) throw new Error(`Row ${index + 2}: language must be en or ur.`);
		return { sentence, language };
	});
	const { error } = await createAdminClient().from("sct").insert(records);
	if (error) throw error;
	revalidatePath("/admin/psychology");
	revalidatePath("/psychology/sct");
}
export async function createSctItem(form: FormData) { await assertAdmin(); const language = String(form.get("language") || "en"); if (!["en", "ur"].includes(language)) throw new Error("Invalid language."); const { error } = await createAdminClient().from("sct").insert({ sentence: text(form, "sentence"), language }); if (error) throw error; revalidatePath("/admin/psychology"); revalidatePath("/psychology/sct"); }
export async function createSelfItem(form: FormData) { await assertAdmin(); const { error } = await createAdminClient().from("self_description").insert({ prompt: text(form, "prompt") }); if (error) throw error; revalidatePath("/admin/psychology"); revalidatePath("/psychology/self"); }
export async function createOpiItem(form: FormData) { await assertAdmin(); const statement = text(form, "statement"); if (statement.length > 500) throw new Error("The OPI statement must be 500 characters or fewer."); const scale = ["Strongly Disagree", "Mostly Disagree", "Slightly Disagree", "Neutral", "Slightly Agree", "Mostly Agree", "Strongly Agree"]; const { error } = await createAdminClient().from("tests").insert({ type: "Personality", content: { statement, scale }, time_limit: 2400, is_premium: false }); if (error) throw error; revalidatePath("/admin/psychology"); revalidatePath("/psychology/opi"); }
export async function createTatItem(form: FormData) { const user = await assertAdmin(); const file = form.get("image") as File | null; if (!file?.size || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Choose a PNG, JPEG, or WebP image."); if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller."); const admin = createAdminClient(); const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`; const { error: uploadError } = await admin.storage.from("psychology-images").upload(path, file, { contentType: file.type }); if (uploadError) throw uploadError; const { error } = await admin.from("tat").insert({ image_path: path }); if (error) { await admin.storage.from("psychology-images").remove([path]); throw error; } revalidatePath("/admin/psychology"); revalidatePath("/psychology/tat"); }
const tableFor = (kind: string) => ({ WAT: "wat", SCT: "sct", SelfDescription: "self_description" } as Record<string, string>)[kind];
export async function updatePsychologyItem(form: FormData) { await assertAdmin(); const kind = String(form.get("kind")); const table = tableFor(kind); if (!table) throw new Error("TAT images cannot be edited here; upload a replacement."); const payload = kind === "WAT" ? { word: text(form, "value") } : kind === "SCT" ? { sentence: text(form, "value"), language: String(form.get("language") || "en") } : { prompt: text(form, "value") }; const { error } = await createAdminClient().from(table).update(payload).eq("id", String(form.get("id"))); if (error) throw error; revalidatePath("/admin/psychology"); }
export async function togglePsychologyItem(formData: FormData) { await assertAdmin(); const kind = String(formData.get("kind")); const table = tableFor(kind) || (kind === "TAT" ? "tat" : ""); if (!table) throw new Error("Invalid content type."); const active = String(formData.get("active")) === "true"; const { error } = await createAdminClient().from(table).update({ is_active: active }).eq("id", String(formData.get("id"))); if (error) throw error; revalidatePath("/admin/psychology"); }
export async function deletePsychologyItem(formData: FormData) { await assertAdmin(); const kind = String(formData.get("kind")); const admin = createAdminClient(); if (kind === "TAT") { const id = String(formData.get("id")); const { data } = await admin.from("tat").select("image_path").eq("id", id).single(); const { error } = await admin.from("tat").delete().eq("id", id); if (error) throw error; if (data?.image_path) await admin.storage.from("psychology-images").remove([data.image_path]); } else { const table = tableFor(kind); if (!table) throw new Error("Invalid content type."); const { error } = await admin.from(table).delete().eq("id", String(formData.get("id"))); if (error) throw error; } revalidatePath("/admin/psychology"); }
