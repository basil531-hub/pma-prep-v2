import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InitialCourseTest } from "@/components/initial-course-test";

const types = { academic: "Academic", verbal: "Verbal", "non-verbal": "Non-Verbal" } as const;
export default async function InitialTestPage({ params }: { params: Promise<{ testType: string }> }) {
  const { testType } = await params;
  const type = types[testType as keyof typeof types];
  if (!type) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: test } = await supabase.from("initial_tests").select("id,type,total_questions,time_limit,passing_marks").eq("type", type).single();
  if (!test) return <main className="mx-auto max-w-3xl px-5 py-10"><p className="rounded-xl bg-amber-50 p-5 text-amber-900">This test has not been configured yet. Run the Initial Course migration and publish questions from Supabase.</p></main>;
  const { data: bank } = await supabase.from("initial_questions").select("id,question_text,options,image_url").eq("test_id", test.id).order("sort_order");
  const questions = [...(bank || [])].sort(() => Math.random() - 0.5).slice(0, test.total_questions);
  return <main className="mx-auto max-w-4xl px-5 py-10"><Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary" href="/initial/mcqs"><ArrowLeft className="h-4 w-4" />All Initial tests</Link><div className="mt-7"><p className="text-sm font-bold uppercase tracking-wider text-primary">{test.type} test</p><h1 className="mt-1 text-3xl font-black">{test.total_questions} questions · {Math.round(test.time_limit / 60)} minutes</h1><p className="mt-2 text-slate-500">Passing mark: {test.passing_marks}%. The timer is strict and the test submits automatically at zero.</p>{(questions?.length || 0) < test.total_questions && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{questions?.length || 0} questions are currently published. Add the remaining questions in Supabase before treating this as a full-length test.</p>}</div><div className="mt-8"><InitialCourseTest test={test} questions={(questions || []).map((question) => ({ ...question, options: Array.isArray(question.options) ? question.options.map(String) : [] }))} /></div></main>;
}
