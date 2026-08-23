import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Brain, ClipboardCheck, Cog, Image, ListChecks, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

const tests = [
  { href: "/psychology/opi", title: "Officer Personality Inventory", short: "OPI", icon: ClipboardCheck, detail: "150 MCQs · 40 minutes", description: "Choose one of seven agreement responses for each personality statement." },
  { href: "/psychology/wat", title: "Word Association Test", short: "WAT", icon: Quote, detail: "100 words · about 10 seconds each", description: "See one word at a time and write the first constructive sentence that comes to mind." },
  { href: "/psychology/sct", title: "Sentence Completion", short: "SCT", icon: ListChecks, detail: "English + Urdu · 18 seconds each", description: "Complete each unfinished sentence naturally on paper before the slide changes." },
  { href: "/psychology/tat", title: "Picture Story Writing", short: "TAT", icon: Image, detail: "30 sec observation · 3 min 30 sec writing", description: "Observe a picture, then write a complete story when the picture disappears." },
  { href: "/psychology/self", title: "Self-Description", short: "SDT", icon: Brain, detail: "5 minutes per prompt", description: "Reflect honestly on yourself in different roles, such as student or friend." },
  { href: "/psychology/mechanical", title: "Mechanical Aptitude", short: "MAT", icon: Cog, detail: "Image-based reasoning", description: "Practice gears, forces, tools, machines, and mechanical relationships for ISSB." },
];

export default async function PsychologyHomePage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  return <main className="mx-auto max-w-6xl px-5 py-10"><section className="rounded-3xl bg-slate-950 px-6 py-10 text-white md:px-10"><p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-300">ISSB preparation</p><h1 className="mt-3 text-4xl font-black md:text-5xl">Psychological tests</h1><p className="mt-4 max-w-2xl text-slate-300">Choose a practice test. Each opens in projector mode with a visible timer, automatic slide changes, and no typing required.</p></section><section className="mt-8"><h2 className="text-2xl font-black">Choose your practice</h2><div className="mt-5 grid gap-5 md:grid-cols-2">{tests.map(({ href, title, short, icon: Icon, detail, description }) => <Link key={href} href={href} className="group"><Card className="h-full transition group-hover:-translate-y-1 group-hover:border-emerald-300 group-hover:shadow-lg"><CardContent className="p-6"><div className="flex items-start justify-between gap-4"><div className="rounded-2xl bg-emerald-50 p-3 text-primary"><Icon className="h-7 w-7" /></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{short}</span></div><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-2 font-semibold text-primary">{detail}</p><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">Start practice <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></CardContent></Card></Link>)}</div></section><p className="mt-8 text-center text-sm text-slate-500">Keep paper and a pen ready before you start. The timer begins immediately.</p></main>;
}
