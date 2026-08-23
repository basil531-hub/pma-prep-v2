import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GroupTaskSimulator } from "@/components/group-task-simulator";
export default async function GroupTasksPage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); return <GroupTaskSimulator />; }
