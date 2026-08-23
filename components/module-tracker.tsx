"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function ModuleTracker({ module }: { module: string }) {
  useEffect(() => { const supabase = createClient(); void (async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; await supabase.from("module_events").insert({ user_id: user.id, module, event_type: "view" }); await supabase.from("daily_activity").upsert({ user_id: user.id, activity_date: new Date().toISOString().slice(0, 10), minutes: 1 }, { onConflict: "user_id,activity_date" }); })(); }, [module]);
  return null;
}
