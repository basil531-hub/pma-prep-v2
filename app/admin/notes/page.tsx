import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NotesManager, type PdfNote } from "@/components/notes-manager";
import { isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function AdminNotesPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && !isAdminEmail(user.email)) redirect("/dashboard?error=admin");
  const { data, error } = await createAdminClient().from("notes").select("id,title,category,file_url,language,access_type,created_at,uploaded_by").not("file_url", "is", null).order("created_at", { ascending: false });
  if (error) throw error;
  return <main className="mx-auto max-w-7xl px-5 py-10"><NotesManager notes={(data || []) as PdfNote[]} /></main>;
}
