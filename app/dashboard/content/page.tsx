import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { OfflineCache } from "@/components/offline-cache";
import { ModuleTracker } from "@/components/module-tracker";
import { getAccessSummary, hasCourseAccess } from "@/lib/access";

const premiumTypes = new Set(["psychology", "interview"]);
export default async function ContentPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type = "notes" } = await searchParams; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const access = await getAccessSummary(supabase, user.id); const issbAccess = hasCourseAccess(access, "issb"); if (premiumTypes.has(type) && !issbAccess && access.creditBalance < 15) redirect("/upgrade?plan=issb&reason=credits");
  const isNotes = type === "notes"; const query = isNotes ? supabase.from("notes").select("id,category,text_content,language").limit(issbAccess ? 50 : 3) : supabase.from("tests").select("id,type,content,time_limit").ilike("type", type === "mcq" ? "MCQ" : type === "psychology" ? "WAT" : "Interview").limit(issbAccess ? 50 : 3); const { data } = await query;
    return <main className="mx-auto max-w-5xl px-5 py-10"><ModuleTracker module={type} /><OfflineCache cacheKey={`pma-content-${type}`} data={data || []} /><p className="text-sm font-bold uppercase text-primary">Learning module</p><h1 className="mt-2 text-3xl font-black capitalize">{type}</h1><p className="mt-2 text-sm text-slate-500">This module is cached on this device for quick offline review.</p><div className="mt-7 space-y-4">{!data?.length && <Card><CardContent className="pt-6 text-slate-500">No content has been published in this module yet. Add rows using the admin panel or Supabase dashboard.</CardContent></Card>}{data?.map((item: Record<string, unknown>, index) => <Card key={String(item.id)}><CardContent className="pt-6"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Item {index + 1} • {String(item.category || item.type || "Practice")}</p><p className="whitespace-pre-wrap leading-7">{String(item.text_content || JSON.stringify(item.content, null, 2))}</p></CardContent></Card>)}</div></main>;
}
