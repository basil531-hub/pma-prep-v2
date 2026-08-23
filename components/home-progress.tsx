"use client";

import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Progress = { score: number; total: number; percentage: number; passed: boolean };
const storageKey = "pma-initial-progress";

export function HomeProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => {
    try { const saved = window.localStorage.getItem(storageKey); if (saved) setProgress(JSON.parse(saved) as Progress); } catch { /* Ignore malformed local progress. */ }
  }, []);
  const percentage = progress?.percentage || 0;
  return <Card className="border-slate-200 bg-white"><CardContent className="pt-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Your local progress</p><h2 className="mt-1 text-2xl font-black">Keep your momentum visible.</h2></div><BarChart3 className="h-7 w-7 text-primary" /></div><div className="mt-6 flex items-end justify-between"><span className="text-sm text-slate-500">Latest completion</span><strong className="text-3xl font-black text-primary">{percentage}%</strong></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Latest test completion" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} /></div>{progress ? <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-slate-500">Last score</p><p className="font-bold">{progress.score} / {progress.total}</p></div><div><p className="text-slate-500">Percentage</p><p className="font-bold">{progress.percentage}%</p></div><div><p className="text-slate-500">Result</p><p className={`font-bold ${progress.passed ? "text-primary" : "text-red-600"}`}>{progress.passed ? "Passed" : "Keep practising"}</p></div></div> : <p className="mt-5 flex items-center gap-2 text-sm text-slate-500"><CheckCircle2 className="h-4 w-4 text-slate-300" />Complete a test to see your local result here.</p>}</CardContent></Card>;
}
