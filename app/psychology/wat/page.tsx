import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PsychologyProjector } from "@/components/psychology-projector";
import { starterWatWords } from "@/lib/psychology-starter-content";
export const dynamic = "force-dynamic";
export default async function WatPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); const { data } = await supabase.from("wat").select("id,word,display_seconds").eq("is_active", true).order("sort_order").limit(500); const selected = [...(data || [])].sort(() => Math.random() - 0.5).slice(0, 100); const seconds = selected[0]?.display_seconds || 10; const items = selected.length ? selected.map(x => ({ id: x.id, text: x.word })) : starterWatWords.map((word, index) => ({ id: `starter-${index}`, text: word })); return <PsychologyProjector testType="WAT" title="Word Association Test" secondsPerItem={seconds} items={items} />; }
