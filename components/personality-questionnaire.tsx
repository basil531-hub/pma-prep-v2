"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Clock3, Flag, Send } from "lucide-react";
import { savePersonalityAssessment } from "@/app/psychology/opi/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Test = { id: string; content: unknown };
type Statement = { statement?: string; scale?: string[] };

const OPI_OPTIONS = [
  "Strongly Disagree",
  "Mostly Disagree",
  "Slightly Disagree",
  "Neutral",
  "Slightly Agree",
  "Mostly Agree",
  "Strongly Agree",
];

function statementFrom(test: Test): Statement {
  return typeof test.content === "object" && test.content !== null ? test.content as Statement : {};
}

export function PersonalityQuestionnaire({ tests }: { tests: Test[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error,setError]=useState("");
  const [secondsLeft, setSecondsLeft] = useState(40 * 60);
  const [current, setCurrent] = useState(0);
  const [flagged, setFlagged] = useState<string[]>([]);

  useEffect(() => {
    if (submitted || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft, submitted]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const answered = Object.keys(answers).length;
  const test = tests[current];
  const statement = test ? statementFrom(test) : {};

  async function submit() {
    setSaving(true);
    setError("");
    try{await savePersonalityAssessment(answers);setSubmitted(true)}catch(e){setError(e instanceof Error?e.message:"Unable to save this assessment.")}finally{setSaving(false)}
  }

  if (!tests.length) return <Card><CardContent className="pt-6 text-slate-500">No questionnaire statements are available yet.</CardContent></Card>;
  if (submitted) return <Card><CardContent className="space-y-4 pt-6"><CheckCircle2 className="h-8 w-8 text-primary" /><h2 className="text-2xl font-black">ISSB OPI test saved</h2><p className="text-slate-600">Use your responses to identify strengths and areas to discuss honestly during psychological evaluation.</p></CardContent></Card>;

  return <Card>
    <CardHeader><div className="flex items-center gap-3"><div className="rounded-xl bg-green-50 p-3 text-primary"><ClipboardCheck /></div><div><h2 className="text-xl font-bold">ISSB Officer Personality Inventory</h2><p className="text-sm text-slate-500">For each statement, select one of the seven choices. There are no right or wrong answers, so respond consistently and honestly. A completed attempt uses 25 credits unless you have an active Initial pass.</p></div></div></CardHeader>
    <CardContent className="space-y-6">
      <div className="sticky top-3 z-10 flex items-center justify-between rounded-xl border bg-white/95 p-4 shadow-sm backdrop-blur"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Question {current + 1} of {tests.length}</p><p className="font-black">{answered} answered</p></div><div className={secondsLeft === 0 ? "text-right text-red-700" : "text-right text-slate-800"}><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><Clock3 className="h-4 w-4" />Time left</p><p className="font-mono text-xl font-black">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</p></div></div>
      {secondsLeft === 0&&<p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">Time is up. Submit the answers you completed.</p>}
      {tests.length < 150&&<p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{tests.length} of 150 OPI statements are currently available.</p>}
      {error&&<p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_230px]">
        <div className="min-w-0">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold leading-7">{current + 1}. {statement.statement || "Personality statement"}</h3>
            <button type="button" aria-pressed={flagged.includes(test.id)} disabled={secondsLeft === 0} onClick={() => setFlagged((items) => items.includes(test.id) ? items.filter((id) => id !== test.id) : [...items, test.id])} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${flagged.includes(test.id) ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}><Flag className="h-4 w-4" />{flagged.includes(test.id) ? "Flagged" : "Flag"}</button>
          </div>
          <fieldset disabled={secondsLeft === 0}><div className="max-w-sm space-y-1.5">{OPI_OPTIONS.map((option) => <label className="grid min-h-10 w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition hover:border-primary hover:bg-green-50/50 has-[:checked]:border-primary has-[:checked]:bg-green-50" key={option}><input className="!h-4 !w-4 shrink-0 !rounded-full !p-0 accent-emerald-600" type="radio" name={test.id} value={option} checked={answers[test.id] === option} onChange={(event) => setAnswers((items) => ({ ...items, [test.id]: event.target.value }))} /><span className="min-w-0 text-left leading-5">{option}</span></label>)}</div></fieldset>
          <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5"><Button variant="outline" disabled={current === 0} onClick={() => setCurrent((index) => index - 1)}><ArrowLeft className="mr-2 h-4 w-4" />Previous</Button>{current < tests.length - 1 ? <Button onClick={() => setCurrent((index) => index + 1)}>Next<ArrowRight className="ml-2 h-4 w-4" /></Button> : <Button onClick={() => void submit()} disabled={saving || answered === 0 || (secondsLeft > 0 && answered !== tests.length)}><Send className="mr-2 h-4 w-4" />{saving ? "Saving..." : secondsLeft === 0 ? "Submit answers" : "Finish test"}</Button>}</div>
        </div>
        <aside className="rounded-xl border bg-slate-50 p-4">
          <div className="flex items-center justify-between"><p className="text-sm font-black">Question navigator</p><span className="text-xs font-bold text-slate-500">{answered}/{tests.length}</span></div>
          <div className="mt-3 grid grid-cols-6 gap-1.5 lg:grid-cols-5">{tests.map((item, index) => <button type="button" aria-label={`Go to question ${index + 1}${flagged.includes(item.id) ? ", flagged" : ""}`} key={item.id} onClick={() => setCurrent(index)} className={`relative grid aspect-square place-items-center rounded-md text-[11px] font-black ${index === current ? "ring-2 ring-emerald-700 ring-offset-1" : ""} ${answers[item.id] ? "bg-emerald-600 text-white" : flagged.includes(item.id) ? "border border-amber-400 bg-amber-50 text-amber-800" : "border bg-white text-slate-600"}`}>{index + 1}{flagged.includes(item.id)&&<span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500 ring-1 ring-white" />}</button>)}</div>
          <div className="mt-4 space-y-2 text-xs text-slate-600"><p className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-600" />Answered</p><p className="flex items-center gap-2"><span className="h-3 w-3 rounded border bg-white" />Unattempted</p><p className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" />Flagged</p></div>
        </aside>
      </div>
    </CardContent>
  </Card>;
}
