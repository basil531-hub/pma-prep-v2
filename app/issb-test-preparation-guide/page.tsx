import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Compass,
  Dumbbell,
  Flag,
  Handshake,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";

export const metadata = {
  title: "ISSB Test Preparation Guide | PMA Prep",
  description: "A practical, step-by-step guide to the ISSB schedule, psychological tests, GTO tasks, interview and preparation strategy.",
};

const contents = [
  ["overview", "What ISSB evaluates"],
  ["schedule", "Five-day schedule"],
  ["domains", "Testing domains"],
  ["strategy", "Preparation strategy"],
  ["resources", "Practice resources"],
  ["faqs", "Frequently asked questions"],
];

const days = [
  { day: "Day 1", label: "Arrival & briefing", icon: MapPin, items: ["Reporting, documents and chest number", "Orientation and administrative forms", "Accommodation and initial briefing"] },
  { day: "Day 2", label: "Psychological assessment", icon: Brain, items: ["Word Association Test (WAT)", "Sentence completion and picture stories", "Self-description and personality responses"] },
  { day: "Day 3", label: "Group testing begins", icon: Users, items: ["Group discussion and group planning", "Progressive group task", "Half-group task and interviews"] },
  { day: "Day 4", label: "Leadership in action", icon: Flag, items: ["Individual obstacles", "Command task and final group task", "Remaining interviews and assessment"] },
  { day: "Day 5", label: "Conference & departure", icon: ClipboardCheck, items: ["Board conference or re-interview if required", "Documents and travel allowance", "Departure from the centre"] },
];

const domains = [
  { icon: Brain, title: "Psychological tests", text: "Timed written responses reveal how naturally you think, respond to pressure and understand yourself.", chips: ["WAT", "TAT", "SCT", "Self-description"], href: "/psychology" },
  { icon: Handshake, title: "GTO tasks", text: "Group exercises observe cooperation, practical intelligence, initiative, courage and influence without aggression.", chips: ["Group planning", "PGT / HGT", "Command task", "Obstacles"], href: "/gto" },
  { icon: MessageSquareText, title: "Interview Lessons", text: "Learn how your background, interests, awareness and decisions are explored through a direct, conversational interview.", chips: ["Personal profile", "Current affairs", "Motivation", "Communication"], href: "/interview/lessons" },
];

const faqs = [
  ["How long does ISSB take?", "Candidates normally spend several days at the assigned ISSB centre. Your call letter is the final authority for reporting time, documents and duration."],
  ["Can I prepare without memorising answers?", "Yes—and you should. Build self-awareness, clear expression, fitness, awareness and teamwork. Rehearsed personality answers often become inconsistent under follow-up questions."],
  ["Is fluent English compulsory?", "Clear communication matters more than an artificial accent. Practise expressing a complete idea calmly in both English and Urdu while steadily improving your vocabulary."],
  ["What if I cannot complete every obstacle?", "Keep moving safely and show determination. One task rarely defines the whole assessment; assessors observe your effort, judgement, response to setbacks and overall consistency."],
  ["What should I take to the centre?", "Follow the document and clothing list in your official call letter exactly. Prepare originals, photocopies and required clothing before travel rather than relying on a general online checklist."],
];

export default function IssbPreparationGuidePage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,#34d399_0,transparent_32%),radial-gradient(circle_at_80%_70%,#10b981_0,transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300"><Sparkles className="h-4 w-4" /> Complete preparation roadmap</div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] sm:text-6xl">ISSB test preparation, from call letter to conference.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Understand what happens at ISSB, how each assessment works and which habits help you perform as your calm, capable and authentic self.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-400">Start practising <ArrowRight className="h-4 w-4" /></Link>
              <a href="#schedule" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-bold transition hover:bg-white/10">Explore the schedule</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['05', 'days of assessment'], ['03', 'core testing domains'], ['04', 'ISSB centres'], ['01', 'consistent personality']].map(([number, label], index) => <div key={label} className={`rounded-2xl border border-white/10 bg-white/[.07] p-5 backdrop-blur ${index === 0 ? 'col-span-2' : ''}`}><div className="text-3xl font-black text-emerald-300">{number}</div><div className="mt-1 text-sm text-slate-300">{label}</div></div>)}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">On this page</p>
            <nav className="mt-4 space-y-1" aria-label="Guide contents">{contents.map(([id, label], index) => <a key={id} href={`#${id}`} className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-emerald-700"><span className="text-xs text-slate-400">0{index + 1}</span>{label}<ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" /></a>)}</nav>
          </div>
        </aside>

        <article className="min-w-0">
          <section id="overview" className="scroll-mt-24">
            <p className="text-sm font-black uppercase tracking-[.18em] text-emerald-700">The real objective</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">ISSB looks for potential, not a rehearsed character.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">The Inter Services Selection Board observes how you think, work with people, communicate and respond when time or resources are limited. Strong preparation develops the behaviours behind good performance: honesty, responsibility, initiative, composure and useful teamwork.</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">{[[Compass, 'Awareness', 'Know your strengths, weaknesses, goals and personal history.'], [Target, 'Consistency', 'Keep your written responses, interview and group behaviour aligned.'], [ShieldCheck, 'Officer potential', 'Show judgement, courage, cooperation and the will to improve.']].map(([Icon, title, text]) => { const I = Icon as typeof Compass; return <div key={title as string} className="rounded-2xl border border-slate-200 p-5"><I className="h-6 w-6 text-emerald-600" /><h3 className="mt-4 font-black">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text as string}</p></div>})}</div>
            <div className="mt-8 rounded-2xl border-l-4 border-amber-400 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Use official instructions first.</strong> Dates, centre allocation, eligibility, required documents and current testing policy can change. Your service advertisement and ISSB call letter take priority over any preparation guide.</div>
          </section>

          <section id="schedule" className="scroll-mt-24 pt-16">
            <p className="text-sm font-black uppercase tracking-[.18em] text-emerald-700">What to expect</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">A practical five-day view</h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">The exact order can vary by batch and centre. This overview helps you understand the rhythm: administration, individual assessment, group observation and final review.</p>
            <div className="mt-8 space-y-4">{days.map(({ day, label, icon: Icon, items }) => <div key={day} className="grid gap-5 rounded-2xl border border-slate-200 p-5 sm:grid-cols-[150px_1fr]"><div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-emerald-300"><Icon className="h-5 w-5" /></div><p className="mt-3 text-xs font-black uppercase tracking-widest text-emerald-700">{day}</p><h3 className="mt-1 font-black">{label}</h3></div><ul className="grid content-center gap-3 text-sm text-slate-600">{items.map(item => <li key={item} className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 rounded-full bg-emerald-100 p-1 text-emerald-700" /><span className="leading-6">{item}</span></li>)}</ul></div>)}</div>
          </section>

          <section id="domains" className="scroll-mt-24 pt-16">
            <p className="text-sm font-black uppercase tracking-[.18em] text-emerald-700">Core testing domains</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">One personality, seen from three angles</h2>
            <div className="mt-8 grid gap-5 xl:grid-cols-3">{domains.map(({ icon: Icon, title, text, chips, href }) => <div key={title} className="flex flex-col rounded-2xl bg-slate-950 p-6 text-white"><Icon className="h-7 w-7 text-emerald-300" /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{text}</p><div className="mt-5 flex flex-wrap gap-2">{chips.map(chip => <span key={chip} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{chip}</span>)}</div><Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-300">Open practice area <ArrowRight className="h-4 w-4" /></Link></div>)}</div>
          </section>

          <section id="strategy" className="scroll-mt-24 pt-16">
            <p className="text-sm font-black uppercase tracking-[.18em] text-emerald-700">Preparation strategy</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Build signals of readiness every day.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><h3 className="flex items-center gap-2 text-lg font-black text-emerald-950"><Check className="h-5 w-5" /> Behaviours that help</h3><ul className="mt-5 space-y-4">{["Speak clearly and contribute relevant ideas.", "Listen, include others and move the group forward.", "Use real examples when discussing your qualities.", "Stay energetic after a mistake or setback.", "Read current affairs and form balanced opinions."].map(x => <li key={x} className="flex gap-3 text-sm leading-6 text-emerald-950"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />{x}</li>)}</ul></div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6"><h3 className="flex items-center gap-2 text-lg font-black text-rose-950"><X className="h-5 w-5" /> Habits that weaken performance</h3><ul className="mt-5 space-y-4">{["Copying model sentences or memorised stories.", "Dominating a discussion without adding value.", "Contradicting your own biodata or interview answers.", "Giving up when a plan or obstacle goes wrong.", "Pretending to know an answer instead of admitting a gap."].map(x => <li key={x} className="flex gap-3 text-sm leading-6 text-rose-950"><X className="mt-1 h-4 w-4 shrink-0 text-rose-700" />{x}</li>)}</ul></div>
            </div>
          </section>

          <section id="resources" className="scroll-mt-24 pt-16">
            <div className="overflow-hidden rounded-3xl bg-emerald-600 p-7 text-white sm:p-9">
              <p className="text-sm font-black uppercase tracking-[.18em] text-emerald-100">Train with purpose</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black">Turn this guide into a weekly practice plan.</h2>
              <p className="mt-4 max-w-2xl leading-7 text-emerald-50">Use timed psychology exercises, interactive GTO scenarios, interview questions and progress reports in one place.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">{[[Brain, 'Psychology practice', '/psychology'], [Users, 'Visual GTO lessons', '/gto/lessons'], [Dumbbell, 'GTO task preparation', '/gto/lessons'], [Clock3, 'Interview Lessons', '/interview/lessons']].map(([Icon, title, href]) => { const I = Icon as typeof Brain; return <Link key={title as string} href={href as string} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 font-bold text-slate-900 transition hover:-translate-y-0.5"><I className="h-5 w-5 text-emerald-600" />{title as string}<ArrowRight className="ml-auto h-4 w-4" /></Link>})}</div>
            </div>
          </section>

          <section id="faqs" className="scroll-mt-24 py-16">
            <p className="text-sm font-black uppercase tracking-[.18em] text-emerald-700">Common questions</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">ISSB preparation FAQs</h2>
            <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200">{faqs.map(([question, answer]) => <details key={question} className="group py-1"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-bold"><span>{question}</span><span className="text-xl font-light text-emerald-600 transition group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-5 pr-8 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div>
          </section>
        </article>
      </div>
    </main>
  );
}
