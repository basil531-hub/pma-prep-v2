import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PsychologyProjector } from "@/components/psychology-projector";
import { starterSelfDescription } from "@/lib/psychology-starter-content";
export const dynamic = "force-dynamic";
export default async function SelfDescriptionPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); const { data } = await supabase.from("self_description").select("id,prompt,display_seconds").eq("is_active", true).order("sort_order"); const selected = [...(data || [])].sort(() => Math.random() - 0.5).slice(0, 5); return <PsychologyProjector testType="SelfDescription" title="Self-Description Test" secondsPerItem={selected[0]?.display_seconds || 300} items={selected.length ? selected.map(x => ({ id: x.id, text: x.prompt })) : starterSelfDescription} />; }
