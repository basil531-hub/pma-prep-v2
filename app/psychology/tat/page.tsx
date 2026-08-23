import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PsychologyProjector } from "@/components/psychology-projector";
import { starterTatItems } from "@/lib/psychology-starter-content";
export const dynamic = "force-dynamic";
export default async function TatPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); const { data } = await supabase.from("tat").select("id,image_path,observe_seconds,write_seconds").eq("is_active", true).order("sort_order"); const admin = createAdminClient(); const uploadedItems = await Promise.all((data || []).map(async x => ({ id: x.id, imageUrl: (await admin.storage.from("psychology-images").createSignedUrl(x.image_path, 3600)).data?.signedUrl, text: "Write a complete story based on the picture." }))); const items = uploadedItems.filter((x): x is { id: string; imageUrl: string; text: string } => Boolean(x.imageUrl)); return <PsychologyProjector testType="TAT" title="Picture Story Writing" pictureSeconds={data?.[0]?.observe_seconds || 30} secondsPerItem={data?.[0]?.write_seconds || 210} items={items.length ? items : starterTatItems} />; }
