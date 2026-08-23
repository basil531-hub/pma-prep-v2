import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NonVerbalTest } from "@/components/non-verbal-test";

export default async function NonVerbalPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const admin = createAdminClient(); const { data: questions } = await admin.from("non_verbal_mcqs").select("id,image_url,options").order("created_at");
  const signedImages: Record<string, string> = {};
  for (const question of questions || []) { const result = await admin.storage.from("non-verbal-mcqs").createSignedUrl(question.image_url, 3600); if (result.data?.signedUrl) signedImages[question.id] = result.data.signedUrl; }
  return <main className="mx-auto max-w-4xl px-5 py-10"><Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary" href="/initial/mcqs"><ArrowLeft className="h-4 w-4" />All Initial tests</Link><div className="mt-7"><p className="text-sm font-bold uppercase tracking-wider text-primary">Non-Verbal Intelligence</p><h1 className="mt-1 text-3xl font-black">Pattern and sequence test</h1><p className="mt-2 text-slate-500">25 minutes · 50% passing mark · strict timer. The full course target is 64 questions.</p></div><div className="mt-8"><NonVerbalTest questions={questions || []} signedImages={signedImages} /></div></main>;
}
