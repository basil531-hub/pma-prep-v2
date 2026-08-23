import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SecurePdfViewer } from "@/components/secure-pdf-viewer";
import { getAccessSummary, hasCourseAccess } from "@/lib/access";

export const dynamic = "force-dynamic";
export default async function NoteViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const access = await getAccessSummary(supabase, user.id);
  const { data: note } = await createAdminClient().from("notes").select("id,title,file_url,access_type").eq("id", id).single();
  if (!note?.file_url || (note.access_type === "premium" && !hasCourseAccess(access, "initial") && !hasCourseAccess(access, "issb"))) redirect("/upgrade?plan=complete");
  const { data: signed, error } = await createAdminClient().storage.from("notes-pdfs").createSignedUrl(note.file_url, 60 * 10);
  if (error || !signed?.signedUrl) notFound();
  return <main className="mx-auto max-w-6xl px-5 py-8"><SecurePdfViewer title={note.title} url={signed.signedUrl} watermark={`${user.id.slice(0, 8)} • ${new Date().toLocaleString()}`} /></main>;
}
