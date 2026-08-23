import Link from "next/link";
import { ContentBlock } from "@/lib/blog-cms";
export function BlogContent({ blocks }: { blocks: ContentBlock[] }) { return <div className="space-y-7">{blocks.map(block => {
  if(block.type==="heading") return <h2 key={block.id} className="pt-2 text-2xl font-black">{block.text}</h2>;
  if(block.type==="list") return <ul key={block.id} className="space-y-3">{(block.items||[]).map((x,i)=><li key={i} className="flex gap-3 leading-7 text-slate-700"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500"/>{x}</li>)}</ul>;
  if(block.type==="quote") return <blockquote key={block.id} className="border-l-4 border-emerald-500 bg-emerald-50 p-5 text-lg italic text-slate-700">{block.text}</blockquote>;
  if(block.type==="callout") return <aside key={block.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-5 leading-7 text-amber-950">{block.text}</aside>;
  if(block.type==="cta") return <div key={block.id} className="rounded-2xl bg-slate-950 p-6 text-white"><p className="text-lg font-bold">{block.text}</p><Link href={block.url||"/signup"} className="mt-4 inline-block rounded-lg bg-emerald-500 px-4 py-2 font-bold">Continue</Link></div>;
  return <p key={block.id} className="leading-8 text-slate-700">{block.text}</p>;
})}</div>; }
