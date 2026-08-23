"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Test = { id: string; type: string; content: unknown; time_limit: number };
type Question = { question?: string; options?: Array<string | number>; answer?: string | number; subject?: string; category?: string };

function questionFrom(test: Test): Question {
  return typeof test.content === "object" && test.content !== null ? test.content as Question : {};
}

export function InitialQuiz({ tests, module }: { tests: Test[]; module: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState(Math.max(1, tests.reduce((total, test) => total + test.time_limit, 0)));
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (submitted) return;
    const timer = window.setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [submitted]);

  useEffect(() => {
    if (seconds === 0 && !submitted) void submit();
  }, [seconds, submitted]);

  async function submit() {
    if (submitted || saving) return;
    setSaving(true);
    const correct = tests.reduce((total, test) => {
      const question = questionFrom(test);
      return total + (String(question.answer) === answers[test.id] ? 1 : 0);
    }, 0);
    const percentage = tests.length ? Math.round((correct / tests.length) * 100) : 0;
    setScore(percentage);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await Promise.all(tests.map((test) => supabase.from("results").insert({ user_id: user.id, test_id: test.id, score: percentage, feedback: `${module}: ${correct} of ${tests.length} correct.` })));
      await supabase.from("practice_attempts").insert({ user_id: user.id, test_id: tests[0]?.id || null, module: `Initial ${module}`, score: percentage });
    }
    setSubmitted(true);
    setSaving(false);
  }

  if (!tests.length) return <Card><CardContent className="pt-6 text-slate-500">No questions are available yet. An admin can publish them from the admin dashboard.</CardContent></Card>;
  if (submitted) return <Card><CardContent className="space-y-5 pt-6"><div className="flex items-center gap-3 text-primary"><CheckCircle2 className="h-7 w-7" /><div><p className="text-sm font-semibold">Practice complete</p><p className="text-3xl font-black">{score}%</p></div></div><p className="text-slate-600">Review the topics you missed, then try the timed set again.</p><Button onClick={() => window.location.reload()} variant="outline"><RotateCcw className="mr-2 h-4 w-4" />Try again</Button></CardContent></Card>;

  return <div className="space-y-5"><div className="sticky top-20 z-10 flex items-center justify-between rounded-xl border bg-white/95 px-4 py-3 shadow-sm backdrop-blur"><span className="text-sm font-semibold">{tests.length} questions</span><span className={`flex items-center gap-2 font-black ${seconds < 30 ? "text-red-600" : "text-primary"}`}><Clock3 className="h-4 w-4" />{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span></div>{tests.map((test, index) => { const question = questionFrom(test); return <Card key={test.id}><CardHeader><p className="text-xs font-bold uppercase tracking-wider text-primary">{question.subject || question.category || module} · Question {index + 1}</p><h2 className="mt-2 text-lg font-bold">{question.question || "Practice question"}</h2></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{(question.options || []).map((option) => <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-green-50" key={String(option)}><input type="radio" name={test.id} value={String(option)} checked={answers[test.id] === String(option)} onChange={(event) => setAnswers((current) => ({ ...current, [test.id]: event.target.value }))} />{String(option)}</label>)}</CardContent></Card>; })}<Button className="w-full sm:w-auto" size="lg" onClick={() => void submit()} disabled={saving}>{saving ? "Saving result..." : "Submit timed practice"}</Button></div>;
}
