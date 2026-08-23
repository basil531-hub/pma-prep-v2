import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Brain, CheckCircle2, MessageSquare, Mountain } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

const modules = [
  { href: "/psychology", title: "Psychological Tests", detail: "OPI, WAT, SCT, TAT and self-description practice.", explanation: "Practise clear, honest responses while staying calm when the clock is moving.", icon: Brain },
  { href: "/gto/lessons", title: "Visual GTO Lessons", detail: "Complete illustrated guidance for Group Planning, Command Task, PGT/HGT and Individual Obstacles.", explanation: "Learn each task through admin-published images, step-by-step methods, rules and preparation advice.", icon: BookOpen },
  { href: "/interview/lessons", title: "Interview Lessons", detail: "Learn personal, educational, motivation, current-affairs and rapid-fire interview topics.", explanation: "Understand how to prepare truthful, structured answers before entering the simulator.", icon: MessageSquare },
  { href: "/dashboard/progress", title: "ISSB Reports", detail: "Review completed practice and choose your next focus.", explanation: "Use your report as a study guide, not as an official selection result.", icon: BarChart3 },
];

const stages = [
  ["01", "Prepare your mind", "Begin with psychological practice and learn to respond naturally rather than performing a made-up personality."],
  ["02", "Plan with people", "Move into group tasks. Listen first, then contribute a practical idea and help the team reach a decision."],
  ["03", "Act safely", "Practise command and outdoor scenarios by explaining a clear sequence and adapting when conditions change."],
  ["04", "Tell your story", "Finish with interview practice. Use truthful examples and explain what you learned from them."],
];

export default async function IssbCoursePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <main className="mx-auto max-w-6xl px-5 py-10">
    <section className="rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-300">Course 2 · ISSB preparation</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">Turn preparation into officer-like habits.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">ISSB preparation connects psychological readiness, teamwork, planning, physical confidence and communication. Each lesson gives you one behaviour to practise.</p>
      <Link href="/issb-test-preparation-guide" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20">Review the complete ISSB guide <ArrowRight className="h-4 w-4" /></Link>
    </section>

    <section className="mt-10">
      <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-wider text-primary">How the course works</p><h2 className="mt-2 text-2xl font-black">A guided path through four kinds of practice</h2><p className="mt-2 text-slate-600">You can open any module, but this order gives beginners a calm starting point and builds complexity gradually.</p></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">{stages.map(([number, title, detail]) => <div className="flex gap-4 rounded-2xl border bg-white p-5" key={number}><span className="text-sm font-black text-primary">{number}</span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p></div></div>)}</div>
    </section>

    <section className="mt-12">
      <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-wider text-primary">Lesson library</p><h2 className="mt-2 text-2xl font-black">Choose your next practice</h2></div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{modules.map(({ href, title, detail, explanation, icon: Icon }) => <Link href={href} key={href} className="group"><Card className="h-full transition group-hover:-translate-y-1 group-hover:border-emerald-300"><CardContent className="flex h-full flex-col p-6"><Icon className="h-8 w-8 text-primary" /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{detail}</p><p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{explanation}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Open lesson <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></CardContent></Card></Link>)}</div>
    </section>

    <div className="mt-10 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-950"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p className="text-sm leading-6"><strong>Good preparation is observable:</strong> calm communication, useful teamwork, safe decisions, honest self-reflection and the discipline to keep improving.</p></div>
    <div className="mt-6 flex items-center gap-2 text-sm text-slate-500"><Mountain className="h-4 w-4" />Use the progress report after each session to choose one specific improvement for next time.</div>
  </main>;
}
