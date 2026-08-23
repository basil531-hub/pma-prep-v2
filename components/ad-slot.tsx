"use client";

import { useEffect } from "react";

declare global { interface Window { adsbygoogle?: Record<string, unknown>[] } }

export function AdSlot({ slot, className = "" }: { slot?: string; className?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  useEffect(() => {
    if (!client || !slot) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* Ad blockers may reject initialization. */ }
  }, [client, slot]);
  if (!client || !slot) return null;
  return <aside className={className} aria-label="Advertisement"><p className="mb-1 text-center text-[10px] uppercase tracking-wider text-slate-400">Advertisement</p><ins className="adsbygoogle block min-h-[90px]" data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" /></aside>;
}
