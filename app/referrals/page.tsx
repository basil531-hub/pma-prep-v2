import { redirect } from "next/navigation";
import { Coins, Gift, ShoppingBag, UserCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ReferralShare } from "@/components/referral-share";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/referrals");
  const [{ data: profile }, { data: referrals }] = await Promise.all([
    supabase.from("users").select("referral_code,credit_balance").eq("id", user.id).single(),
    supabase.from("referrals").select("id,status,created_at,signup_rewarded_at,purchase_rewarded_at,referred:users!referrals_referred_user_id_fkey(name,email)").eq("referrer_id", user.id).order("created_at", { ascending: false }),
  ]);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const referralUrl = `${baseUrl}/signup?ref=${profile?.referral_code || ""}`;
  const qualified = (referrals || []).filter(item => item.status === "qualified" || item.status === "purchased").length;
  const purchased = (referrals || []).filter(item => item.status === "purchased").length;
  const earned = qualified * 25 + purchased * 150;

  return <main className="mx-auto max-w-6xl px-5 py-10"><section className="overflow-hidden rounded-3xl bg-slate-950 p-7 text-white sm:p-10"><p className="text-sm font-bold uppercase tracking-[.18em] text-emerald-300">Invite and earn</p><h1 className="mt-3 text-4xl font-black">Help a friend prepare. Earn practice credits.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-300">You both receive 25 credits after your friend completes a first practice. You receive another 150 credits when their first payment is verified.</p><div className="mt-7 rounded-2xl border border-white/10 bg-white/[.07] p-4"><p className="break-all text-sm font-semibold text-emerald-100">{referralUrl}</p><div className="mt-4"><ReferralShare url={referralUrl} /></div></div></section>
    <section className="mt-7 grid gap-4 sm:grid-cols-4"><Metric icon={Users} label="Invited" value={referrals?.length || 0} /><Metric icon={UserCheck} label="Qualified" value={qualified} /><Metric icon={ShoppingBag} label="Purchased" value={purchased} /><Metric icon={Coins} label="Credits earned" value={earned} /></section>
    <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]"><div><h2 className="text-xl font-black">Referral activity</h2><div className="mt-4 space-y-3">{!referrals?.length && <Card><CardContent className="py-10 text-center text-slate-500">No referrals yet. Share your link to begin.</CardContent></Card>}{referrals?.map(item => { const referred = item.referred as unknown as { name?: string; email?: string } | null; return <Card key={item.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6"><div><p className="font-bold">{referred?.name || "Invited candidate"}</p><p className="mt-1 text-sm text-slate-500">{referred?.email || new Date(item.created_at).toLocaleDateString()}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${item.status === "purchased" ? "bg-emerald-100 text-emerald-800" : item.status === "qualified" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}>{item.status}</span></CardContent></Card>})}</div></div><Card className="h-fit border-amber-200 bg-amber-50"><CardContent className="pt-6"><Gift className="h-7 w-7 text-amber-600" /><h2 className="mt-4 text-xl font-black">Reward rules</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-amber-950"><li>Fake or self-referrals receive no reward.</li><li>The first reward requires a completed practice attempt.</li><li>The purchase reward requires administrator verification.</li><li>Rejected or duplicate payments do not qualify.</li></ul><div className="mt-5 rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase text-slate-400">Current balance</p><p className="mt-1 text-2xl font-black">{profile?.credit_balance ?? 0} credits</p></div></CardContent></Card></section>
  </main>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) { return <Card><CardContent className="flex items-center gap-3 pt-6"><div className="rounded-xl bg-emerald-50 p-3 text-primary"><Icon className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div></CardContent></Card>; }
