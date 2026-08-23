import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogContent } from "@/components/blog-content";
import { safeBlocks } from "@/lib/blog-cms";
import { RichContentRenderer } from "@/components/rich-content-renderer";
export const dynamic="force-dynamic";
export default async function Preview({params}:{params:Promise<{id:string}>}){const {id}=await params;const {data:p}=await createAdminClient().from("blog_posts").select("title,excerpt,content_json,rich_content_json,content_format").eq("id",id).single();if(!p)notFound();return <article className="mx-auto max-w-4xl rounded-3xl border bg-white px-6 py-10"><p className="mb-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">PRIVATE PREVIEW</p><h1 className="text-5xl font-black">{p.title}</h1><p className="mt-5 text-lg leading-8 text-slate-600">{p.excerpt}</p><div className="mt-10">{p.content_format==="rich"&&p.rich_content_json?<RichContentRenderer doc={p.rich_content_json}/>:<BlogContent blocks={safeBlocks(p.content_json)}/>}</div></article>}
