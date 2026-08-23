"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Lightbulb, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const reviews = [
  { quote: "I would use timed practice to build a daily routine, identify weak topics and revise mistakes instead of attempting random questions.", name: "Hassan Ali", detail: "Representative PMA Initial candidate", initials: "HA", focus: "Recommended workflow: timed tests and result analysis" },
  { quote: "The structured ISSB roadmap would help me understand psychology, GTO and interview stages before beginning focused practice.", name: "Hamza Ahmed", detail: "Representative first-time ISSB candidate", initials: "HA", focus: "Recommended workflow: roadmap, psychology and GTO" },
  { quote: "I would compare recent scores with previous attempts and spend more time on recurring weaknesses rather than restarting everything.", name: "Usman Khan", detail: "Representative repeat candidate", initials: "UK", focus: "Recommended workflow: progress history and targeted practice" },
  { quote: "Short preparation sessions would help me balance university work while still maintaining consistent PMA and ISSB practice.", name: "Ali Raza", detail: "Representative university candidate", initials: "AR", focus: "Recommended workflow: daily goals and preparation streak" },
];

export function ReviewsSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % reviews.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused]);

  function move(offset: number) {
    setActive((current) => (current + offset + reviews.length) % reviews.length);
  }

  const review = reviews[active];
  return <section className="bg-slate-950 px-5 py-16 text-white sm:py-20" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-label="Representative candidate advice"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-300">Candidate field notes</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">How candidates can use PMA Prep</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Named profiles below are representative preparation scenarios, not customer testimonials or selection claims.</p></div><div className="flex gap-2"><Button type="button" variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => move(-1)} aria-label="Previous advice"><ChevronLeft className="h-5 w-5" /></Button><Button type="button" variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => move(1)} aria-label="Next advice"><ChevronRight className="h-5 w-5" /></Button></div></div><div className="mt-10 grid gap-8 md:grid-cols-[auto_1fr] md:items-center"><div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-emerald-400 text-xl font-black text-slate-950"><Quote className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white p-1.5 text-emerald-700" />{review.initials}</div><div key={review.name} className="animate-[fadeIn_.4s_ease-out]"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200"><Lightbulb className="h-3.5 w-3.5"/>Candidate advice</span><blockquote className="mt-4 max-w-3xl text-2xl font-bold leading-relaxed sm:text-3xl">&quot;{review.quote}&quot;</blockquote><p className="mt-5 text-sm font-bold text-emerald-300">{review.name}</p><p className="mt-1 text-sm text-slate-400">{review.detail}</p><p className="mt-3 text-xs font-semibold text-amber-300">{review.focus}</p></div></div><div className="mt-10 flex items-center justify-between gap-4"><div className="flex gap-2" role="tablist" aria-label="Advice slides">{reviews.map((item, index) => <button type="button" key={item.name} className={`h-2 rounded-full transition-all ${index === active ? "w-8 bg-emerald-300" : "w-2 bg-slate-600 hover:bg-slate-400"}`} onClick={() => setActive(index)} aria-label={`Show advice ${index + 1}`} aria-selected={index === active} role="tab" />)}</div><span className="text-xs text-slate-500">{active + 1} / {reviews.length}</span></div></div></section>;
}
