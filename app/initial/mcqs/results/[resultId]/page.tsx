import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocalProgressRecorder } from "@/components/local-progress-recorder";

export default async function InitialResultPage({ params }: { params: Promise<{ resultId: string }> }) {
  const { resultId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: result } = await supabase.from("initial_results").select("id,score,percentage,time_taken,passed,created_at,initial_tests(type,total_questions,passing_marks)").eq("id", resultId).eq("user_id", user.id).single();
  if (!result) return <main className="mx-auto max-w-3xl px-5 py-10"><Card><CardContent className="pt-6"><p>Result not found.</p><Button asChild className="mt-4"><Link href="/initial/mcqs">Back to tests</Link></Button></CardContent></Card></main>;
  const test = result.initial_tests as unknown as { type: string; total_questions: number; passing_marks: number };
  const minutes = Math.floor(Number(result.time_taken) / 60);
  const seconds = String(Number(result.time_taken) % 60).padStart(2, "0");
  return <main className="mx-auto max-w-3xl px-5 py-10"><LocalProgressRecorder score={Number(result.score)} total={test.total_questions} percentage={Number(result.percentage)} passed={result.passed} /><Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary" href="/initial/mcqs"><ArrowLeft className="h-4 w-4" />All Initial tests</Link><Card className="mt-8 overflow-hidden"><div className={`p-8 text-white ${result.passed ? "bg-green-900" : "bg-slate-900"}`}><p className="text-sm font-bold uppercase tracking-wider text-green-200">{test.type} result</p><h1 className="mt-2 text-4xl font-black">{result.passed ? "Test passed" : "Keep practising"}</h1><p className="mt-2 text-slate-300">Passing mark: {test.passing_marks}%</p></div><CardContent className="grid gap-4 pt-6 sm:grid-cols-3"><Metric label="Score" value={`${result.score} / ${test.total_questions}`} /><Metric label="Percentage" value={`${result.percentage}%`} /><Metric label="Time taken" value={`${minutes}:${seconds}`} /><div className="sm:col-span-3 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm font-semibold">{result.passed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-red-600" />}{result.passed ? "You reached the passing mark." : "Review your mistakes and try the test again."}</div><Button asChild className="sm:col-span-3"><Link href={`/initial/mcqs/${test.type.toLowerCase().replace("-", "-")}`}>Retake test</Link></Button></CardContent></Card></main>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>; }
