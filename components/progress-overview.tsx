import { CheckCircle2, Flame, Target } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function ProgressOverview({ completed, total, streak, upcoming }: { completed: number; total: number; streak: number; upcoming: string[] }) {
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  return <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
    <Card><CardContent className="pt-6"><div className="flex items-end justify-between gap-4"><div><p className="text-sm text-slate-500">Preparation progress</p><p className="mt-1 text-4xl font-black text-primary">{percentage}%</p></div><Target className="h-8 w-8 text-primary" /></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} /></div><p className="mt-3 text-sm text-slate-500">{completed} of {total} planned practice modules completed</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{upcoming.map((module) => <div className="flex items-center gap-2 text-sm" key={module}><CheckCircle2 className="h-4 w-4 text-slate-300" />{module}</div>)}</div></CardContent></Card>
    <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-3 text-amber-600"><Flame /></div><div><p className="text-sm text-slate-500">Practice streak</p><p className="text-3xl font-black">{streak} <span className="text-base font-normal text-slate-500">days</span></p></div></div><p className="mt-5 text-sm leading-6 text-slate-500">Keep a daily session going to unlock the Seven Day Streak badge.</p></CardContent></Card>
  </div>;
}