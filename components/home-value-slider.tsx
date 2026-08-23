"use client";

import { Gauge, ShieldCheck, TimerReset, Trophy, type LucideIcon } from "lucide-react";

const values: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: TimerReset, title: "Timed practice", text: "Exam-like sessions" },
  { icon: Gauge, title: "Progress signals", text: "Know what to improve" },
  { icon: ShieldCheck, title: "Secure access", text: "Protected paid content" },
  { icon: Trophy, title: "One roadmap", text: "Initial through ISSB" },
];

export function HomeValueSlider() {
  return <section className="overflow-hidden border-b bg-slate-50" aria-label="Platform benefits">
    <div className="home-value-slider group mx-auto max-w-7xl overflow-hidden py-5 sm:py-7">
      <div className="home-value-track flex w-max">
        {[...values, ...values].map(({ icon: Icon, title, text }, index) => <div className="flex w-[76vw] max-w-[280px] shrink-0 gap-3 px-5 sm:w-[300px] sm:px-7" key={`${title}-${index}`} aria-hidden={index >= values.length}>
          <Icon className="h-5 w-5 shrink-0 text-primary" />
          <div><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs text-slate-500">{text}</p></div>
        </div>)}
      </div>
    </div>
  </section>;
}
