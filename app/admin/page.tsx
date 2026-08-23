import { redirect } from "next/navigation";
import { BarChart3, Brain, CreditCard, FileText, Gamepad2, LayoutDashboard, ListChecks, Newspaper, Quote, Settings, Share2, ShieldAlert, TicketPercent, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Payment } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";
const navItems = [
  ["overview", "Overview", LayoutDashboard, "/admin#overview"],
  ["initial-mcqs", "Initial MCQ Bank", ListChecks, "/admin/initial-mcqs"],
  ["mcqs", "Academic MCQs", ListChecks, "/admin/mcqs"],
  ["psychology", "Psychology", Brain, "/admin/psychology"],
  ["gto", "GTO", Gamepad2, "/admin/gto"],
  ["notes", "Notes", FileText, "/admin/notes"],
  ["payments", "Payments", CreditCard, "/admin/payments"],
  ["coupons", "Coupons", TicketPercent, "/admin/coupons"],
  ["referrals", "Referrals", Share2, "/admin/referrals"],
  ["blog", "Blog CMS", Newspaper, "/admin/blog"],
  ["users", "Users", Users, "/admin#users"],
  ["reports", "Reports", BarChart3, "/admin#reports"],
  ["settings", "Settings", Settings, "/admin#settings"],
] as const;
const contentManagers = [
  ["Initial MCQ question bank", "PMA Initial Course question bank and question management", "/admin/initial-mcqs", ListChecks],
  ["Academic MCQs", "Academic question bank and CSV/XLSX upload", "/admin/mcqs", ListChecks],
  ["WAT, SCT, TAT and self-description", "Timed psychological preparation content", "/admin/psychology", Brain],
  ["GTO scenarios", "Group planning, command and obstacle tasks", "/admin/gto", Gamepad2],
  ["PDF study notes", "Bilingual notes with free or premium access", "/admin/notes", FileText],
  ["Practice tests", "MCQ, Intelligence, Personality, WAT and Interview", "#settings", Quote],
] as const;

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("users").select("role,name,email").eq("id", user.id).single();
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase());
  if (profile?.role !== "admin" && (!user.email || !admins.includes(user.email.toLowerCase()))) redirect("/dashboard");
  const admin = createAdminClient();
  const [{ data: payments }, { data: users }, { data: results }] = await Promise.all([
    admin.from("payments").select("id,user_id,transaction_id,screenshot_url,amount,status,created_at,users(name,email)").eq("status", "pending").order("created_at"),
    admin.from("users").select("id,name,email,enrolled_course,progress,premium_status,created_at").order("created_at", { ascending: false }).limit(100),
    admin.from("results").select("score").order("created_at", { ascending: false }).limit(100),
  ]);
  const pending = (payments || []) as unknown as Payment[];
  const withUrls = await Promise.all(pending.map(async (payment) => ({ ...payment, signedUrl: (await admin.storage.from("payment-screenshots").createSignedUrl(payment.screenshot_url, 600)).data?.signedUrl })));
  const averageScore = results?.length ? Math.round(results.reduce((sum, result) => sum + Number(result.score), 0) / results.length) : 0;
  const completion = users?.length ? Math.round(users.reduce((sum, candidate) => sum + Number(candidate.progress || 0), 0) / users.length) : 0;
  return <div className="min-h-[calc(100vh-4rem)] bg-slate-50"><div className="mx-auto flex max-w-[1500px] flex-col md:flex-row">
    <aside className="border-b bg-slate-950 px-4 py-5 text-white md:min-h-[calc(100vh-4rem)] md:w-60 md:border-b-0 md:px-5"><div className="mb-7 px-3"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">PMA Prep</p><p className="mt-1 text-lg font-black">Command center</p></div><nav className="grid grid-cols-2 gap-1 md:block">{navItems.map(([id, label, Icon, href]) => <a href={href} key={id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"><Icon className="h-4 w-4" />{label}</a>)}</nav><div className="mt-8 hidden rounded-2xl border border-white/10 bg-white/5 p-4 md:block"><ShieldAlert className="h-5 w-5 text-emerald-400" /><p className="mt-3 text-sm font-bold">Admin access active</p><p className="mt-1 text-xs leading-5 text-slate-400">Changes are audited through your Supabase session.</p></div></aside>
    <main className="min-w-0 flex-1 px-5 py-7 lg:px-9"><header id="overview" className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Operations</p><h1 className="mt-1 text-3xl font-black text-slate-950">Admin dashboard</h1><p className="mt-2 text-sm text-slate-500">Manage the candidate experience across PMA Initial and ISSB.</p></div><div className="flex items-center gap-3 rounded-2xl border bg-white px-3 py-2"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-black text-white">{(profile?.name || user.email || "A").slice(0, 1).toUpperCase()}</div><div className="hidden sm:block"><p className="text-sm font-bold">{profile?.name || "Administrator"}</p><p className="text-xs text-slate-500">{profile?.email || user.email}</p></div></div></header>
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Registered students" value={users?.length || 0} detail="Across both courses" /><Metric label="Average completion" value={`${completion}%`} detail="Based on learner profiles" /><Metric label="Average test score" value={`${averageScore}%`} detail={`${results?.length || 0} recent results`} /><Metric label="Pending payments" value={pending.length} detail="Requires review" alert={pending.length > 0} /></section>
    </main></div></div>;
}

function Metric({ label, value, detail, alert }: { label: string; value: string | number; detail: string; alert?: boolean }) { return <Card><CardContent className="pt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-2 text-3xl font-black ${alert ? "text-amber-600" : "text-slate-950"}`}>{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></CardContent></Card>; }
