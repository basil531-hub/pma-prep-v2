import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export function LegalPage({ eyebrow, title, intro, updated = "21 August 2026", children }: { eyebrow: string; title: string; intro: string; updated?: string; children: React.ReactNode }) {
  return <main className="bg-slate-50"><section className="border-b bg-[#071b16] text-white"><div className="mx-auto max-w-5xl px-5 py-16 sm:py-20"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300"><ArrowLeft className="h-4 w-4"/>Back to PMA Prep</Link><p className="mt-10 text-xs font-black uppercase tracking-[.22em] text-emerald-400">{eyebrow}</p><h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">{title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{intro}</p><div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300"><ShieldCheck className="h-4 w-4 text-emerald-400"/>Last updated: {updated}</div></div></section><article className="legal-copy mx-auto max-w-4xl px-5 py-12 sm:py-16">{children}</article></main>
}
