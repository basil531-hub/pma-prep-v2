"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Coins, Minimize, Maximize, Pause, Play, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { finishPsychologyParticipation, startPsychologyParticipation } from "@/app/psychology/actions";

export type ProjectorItem = { id: string; text?: string; imageUrl?: string; language?: "en" | "ur" };
type Props = { testType: "WAT" | "SCT" | "TAT" | "SelfDescription"; title: string; items: ProjectorItem[]; secondsPerItem: number; pictureSeconds?: number; watermark?: string };

const clock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function PsychologyProjector({ testType, title, items, secondsPerItem, pictureSeconds = 0, watermark = "PMA PREP · ISSB PRACTICE" }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0); const [phase, setPhase] = useState<"preview" | "writing">(pictureSeconds ? "preview" : "writing");
  const initial = pictureSeconds || secondsPerItem; const [remaining, setRemaining] = useState(initial); const [paused, setPaused] = useState(false); const [done, setDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ready,setReady]=useState(false);const [accessError,setAccessError]=useState("");
  const participation = useRef<string | null>(null); const completed = useRef(false);
  const item = items[index];
  useEffect(() => { startPsychologyParticipation(testType).then((id) => { participation.current = id;setReady(true); }).catch((error) => setAccessError(error instanceof Error?error.message:"This session could not be started.")); }, [testType]);
  useEffect(() => { const sync = () => setIsFullscreen(Boolean(document.fullscreenElement)); document.addEventListener("fullscreenchange", sync); sync(); return () => document.removeEventListener("fullscreenchange", sync); }, []);
  const complete = useCallback(() => { if (!completed.current) { completed.current = true; if (participation.current) finishPsychologyParticipation(participation.current).catch(() => undefined); } setDone(true); }, []);
  const advance = useCallback(() => {
    if (phase === "preview") { setPhase("writing"); setRemaining(secondsPerItem); return; }
    if (index + 1 >= items.length) { complete(); return; }
    const next = items[index + 1]; setIndex(index + 1); const preview = Boolean(pictureSeconds && next.imageUrl); setPhase(preview ? "preview" : "writing"); setRemaining(preview ? pictureSeconds : secondsPerItem);
  }, [complete, index, items, phase, pictureSeconds, secondsPerItem]);
  useEffect(() => { if (!ready||paused || done) return; if (remaining <= 0) { advance(); return; } const id = window.setTimeout(() => setRemaining((v) => v - 1), 1000); return () => window.clearTimeout(id); }, [advance, done, paused, ready, remaining]);
  useEffect(() => () => { if (!completed.current && participation.current) finishPsychologyParticipation(participation.current).catch(() => undefined); }, []);
  const reset = () => { setIndex(0); setPhase(pictureSeconds ? "preview" : "writing"); setRemaining(initial); setPaused(false); setDone(false); completed.current = false; };
  const leave = async () => { if (document.fullscreenElement) await document.exitFullscreen(); router.push("/psychology"); };
  const toggleFullscreen = async () => { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen?.(); };
  if (!items.length) return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-3xl font-black">No {title} items yet</h1><p className="mt-3 text-slate-300">Ask an administrator to publish practice material.</p></div></main>;
  if(accessError)return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div className="max-w-md"><Coins className="mx-auto h-10 w-10 text-amber-400"/><h1 className="mt-4 text-3xl font-black">Practice credits required</h1><p className="mt-3 text-slate-300">{accessError}</p><div className="mt-6 flex justify-center gap-3"><Button onClick={()=>router.push("/upgrade?plan=issb&reason=credits")}>Get ISSB access</Button><Button variant="outline" className="border-white/20 bg-white/5 text-white" onClick={()=>router.push("/psychology")}>Go back</Button></div></div></main>;
  if(!ready)return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div><Coins className="mx-auto h-8 w-8 animate-pulse text-emerald-300"/><p className="mt-3 font-bold text-slate-300">Checking access and starting session…</p></div></main>;
  return <main className="relative flex min-h-screen select-none flex-col overflow-hidden bg-slate-950 px-5 py-6 text-white md:px-10" onDoubleClick={() => document.documentElement.requestFullscreen?.()}>
    <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.045]"><span className="rotate-[-25deg] text-5xl font-black md:text-8xl">{watermark}</span></div>
    <header className="relative flex items-center justify-between gap-4"><div><Button variant="ghost" size="sm" className="mb-2 -ml-3 text-slate-300 hover:bg-white/10 hover:text-white" onClick={leave}><ArrowLeft className="mr-2 h-4 w-4" />Back to psychology</Button><p className="text-xs font-bold tracking-[.22em] text-emerald-300">ISSB PSYCHOLOGY · PROJECTOR MODE</p><h1 className="mt-1 text-xl font-black md:text-3xl">{title}</h1></div><div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-3 text-right"><p className="text-xs uppercase tracking-wider text-emerald-200">{phase === "preview" ? "Observe" : "Time left"}</p><p className="font-mono text-4xl font-black tabular-nums text-emerald-300 md:text-6xl">{clock(remaining)}</p></div></header>
    <section className="relative flex flex-1 flex-col items-center justify-center py-8 text-center"><p className="mb-5 text-sm font-bold tracking-widest text-slate-400">{done ? "COMPLETE" : `${index + 1} / ${items.length}`}</p>{done ? <div><h2 className="text-4xl font-black md:text-6xl">Session complete</h2><p className="mt-5 text-lg text-slate-300">Well done. Review your written responses calmly.</p></div> : phase === "preview" && item.imageUrl ? <><img src={item.imageUrl} alt="Story-writing prompt" className="max-h-[62vh] max-w-full rounded-2xl object-contain shadow-2xl" /><p className="mt-5 text-lg text-slate-300">Observe the picture carefully. It will disappear when writing time begins.</p></> : <><p dir={item.language === "ur" ? "rtl" : undefined} className="max-w-5xl text-4xl font-black leading-tight md:text-7xl">{item.text}</p><p className="mt-10 text-lg text-slate-400">Write your response on paper.</p></>}</section>
    <footer className="relative flex items-center justify-between border-t border-white/10 pt-4"><span className="text-xs text-slate-500">Auto-advances when time expires</span><div className="flex gap-2"><Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setPaused((v) => !v)}>{paused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}{paused ? "Resume" : "Pause"}</Button><Button variant="ghost" className="text-white hover:bg-white/10" onClick={reset}><TimerReset className="mr-2 h-4 w-4" />Restart</Button><Button variant="ghost" className="hidden text-white hover:bg-white/10 md:inline-flex" onClick={toggleFullscreen}>{isFullscreen ? <Minimize className="mr-2 h-4 w-4" /> : <Maximize className="mr-2 h-4 w-4" />}{isFullscreen ? "Exit full screen" : "Full screen"}</Button></div></footer>
  </main>;
}
