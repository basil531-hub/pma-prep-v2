import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { McqManager } from "./mcq-manager";
import type { MCQ } from "@/lib/types";
import { isAdminEmail } from "@/lib/admin";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminMcqsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && !isAdminEmail(user.email)) redirect("/dashboard?error=admin");
  const { data, error } = await supabase.from("mcqs").select("id,question,options,correct_answer,category,difficulty,created_by,created_at,updated_at").order("created_at", { ascending: false });
  if (error) return <main className="mx-auto max-w-3xl px-5 py-10"><Card><CardContent className="space-y-4 pt-6"><h1 className="text-2xl font-black">MCQ database is not ready</h1><p className="text-slate-600">The app could not read the <code className="rounded bg-slate-100 px-1.5 py-0.5">mcqs</code> table. Run the latest <code className="rounded bg-slate-100 px-1.5 py-0.5">supabase/schema.sql</code> in your Supabase SQL Editor, then refresh this page.</p><p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Supabase: {error.message}</p></CardContent></Card></main>;
  return <main className="mx-auto max-w-7xl px-5 py-10"><McqManager initialItems={(data || []) as unknown as MCQ[]} /></main>;
}
