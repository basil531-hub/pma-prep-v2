"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize } from "lucide-react";

export function GtoPdfReader({ title, url }: { title: string; url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    function syncFullScreen() { setFullScreen(document.fullscreenElement === containerRef.current); }
    document.addEventListener("fullscreenchange", syncFullScreen);
    return () => document.removeEventListener("fullscreenchange", syncFullScreen);
  }, []);

  async function toggleFullScreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await containerRef.current.requestFullscreen?.();
  }

  return <div ref={containerRef} className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${fullScreen ? "h-screen rounded-none border-0" : "h-[52vh] min-h-[360px] sm:h-[58vh] lg:h-[62vh]"}`}><div className="absolute right-3 top-3 z-10"><button type="button" onClick={toggleFullScreen} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-slate-50" aria-label={fullScreen ? "Exit full screen" : "View PDF full screen"} title={fullScreen ? "Exit full screen" : "View PDF full screen"}>{fullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}</button></div><iframe title={title} src={`${url}#toolbar=0&navpanes=0`} className="h-full w-full bg-white" /></div>;
}
