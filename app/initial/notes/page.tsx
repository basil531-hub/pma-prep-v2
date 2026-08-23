import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Languages } from "lucide-react";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function InitialNotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: notes } = await createAdminClient().from("notes").select("id,title,category,language,access_type,created_at").not("file_url", "is", null).order("created_at", { ascending: false });
  return <main className="mx-auto max-w-5xl px-5 py-10"><Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary" href="/initial"><ArrowLeft className="h-4 w-4" />Initial preparation</Link><div className="mt-7 flex items-start gap-4"><div className="rounded-xl bg-green-50 p-3 text-primary"><BookOpen /></div><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Study material</p><h1 className="mt-1 text-3xl font-black">PDF Notes & Study Material</h1><p className="mt-2 text-slate-500">Open secure PDFs uploaded by the PMA Prep admin. Free notes are available to every signed-in candidate; premium notes require premium access.</p></div></div><div className="mt-8 grid gap-5 md:grid-cols-2">{!notes?.length && <Card><CardContent className="pt-6 text-slate-500">No PDF notes are available yet. An admin can upload them from the dashboard.</CardContent></Card>}{notes?.map((note) => <Card key={note.id}><CardContent className="flex h-full flex-col pt-6"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-2 text-primary"><BookOpen className="h-5 w-5" /><h2 className="font-bold">{note.title || note.category}</h2></div><span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase text-slate-600"><Languages className="h-3 w-3" />{note.language}</span></div><p className="mt-3 text-sm text-slate-500">{note.category} · {note.access_type === "premium" ? "Premium" : "Free"}</p><p className="mt-2 flex-1 text-sm leading-6 text-slate-600">Read this focused study guide before attempting a timed test.</p><Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary" href={`/notes/${note.id}`}>Open secure PDF <ArrowRight className="h-4 w-4" /></Link></CardContent></Card>)}</div></main>;
}
