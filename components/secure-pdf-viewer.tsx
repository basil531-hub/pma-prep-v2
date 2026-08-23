"use client";
import { ShieldAlert } from "lucide-react";

export function SecurePdfViewer({ title, url, watermark }: { title: string; url: string; watermark: string }) {
  return <section onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}><div className="mb-4 flex items-center gap-3"><ShieldAlert className="text-primary" /><div><h1 className="text-2xl font-black">{title}</h1><p className="text-sm text-slate-500">Secure in-app viewing. This document is watermarked for your account.</p></div></div><div className="relative h-[78vh] overflow-hidden rounded-2xl border bg-slate-900 shadow-card"><iframe title={title} src={`${url}#toolbar=0&navpanes=0`} className="h-full w-full select-none" sandbox="allow-scripts allow-same-origin" /><div className="absolute inset-x-0 top-0 z-10 h-12 bg-slate-900/95" /><div className="pointer-events-none absolute inset-0 z-20 flex select-none items-center justify-center overflow-hidden"><span className="-rotate-30 whitespace-nowrap text-center text-2xl font-black tracking-widest text-white/20 sm:text-4xl">{watermark}</span></div></div></section>;
}
