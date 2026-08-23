import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PersonalityQuestionnaire } from "@/components/personality-questionnaire";

export default async function OpiTestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: bank } = await supabase.from("tests").select("id,type,content,time_limit").eq("type", "Personality").eq("is_premium", false).limit(1000);
  const tests = [...(bank || [])].sort(() => Math.random() - 0.5).slice(0, 150);

  return <main className="mx-auto max-w-4xl px-5 py-10"><Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary" href="/psychology"><ArrowLeft className="h-4 w-4" />Psychological tests</Link><div className="mt-7 flex items-start gap-4"><div className="rounded-xl bg-green-50 p-3 text-primary"><ClipboardCheck /></div><div><p className="text-sm font-bold uppercase tracking-wider text-primary">ISSB psychological paper</p><h1 className="mt-1 text-3xl font-black">Officer Personality Inventory (OPI)</h1><p className="mt-2 text-slate-500">A timed multiple-choice personality inventory. Select the response that best describes you for every statement.</p><div className="mt-4 flex flex-wrap gap-2 text-sm font-bold"><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">150 MCQs</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">7 choices each</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">40 minutes</span></div></div></div><div className="mt-8"><PersonalityQuestionnaire tests={tests} /></div></main>;
}
