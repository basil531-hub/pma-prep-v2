import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Crown, ExternalLink, ReceiptText, ShieldCheck, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { grantBonusCredits, reviewPayment, revokeCoursePasses } from "../actions";

export const dynamic = "force-dynamic";

type PaymentRow = {
  id: string; user_id: string; transaction_id: string; screenshot_url: string; amount: number; plan_code: string;
  status: "pending" | "verified" | "rejected"; created_at: string;
  users: { name: string; email: string; premium_status: boolean } | null;
  signedUrl?: string;
};

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin" && !isAdminEmail(user.email)) redirect("/dashboard");

  const admin = createAdminClient();
  const [{ data, error }, { count: couponUses }] = await Promise.all([
    admin.from("payments").select("id,user_id,transaction_id,screenshot_url,amount,plan_code,status,created_at,users(name,email,premium_status)").order("created_at", { ascending: false }).limit(250),
    admin.from("coupon_redemptions").select("id", { count: "exact", head: true }),
  ]);
  if (error) throw new Error(`Unable to load payments: ${error.message}`);
  const payments = await Promise.all(((data || []) as unknown as PaymentRow[]).map(async payment => ({
    ...payment,
    signedUrl: (await admin.storage.from("payment-screenshots").createSignedUrl(payment.screenshot_url, 600)).data?.signedUrl,
  })));
  const pending = payments.filter(payment => payment.status === "pending");
  const verified = payments.filter(payment => payment.status === "verified");
  const revenue = verified.reduce((total, payment) => total + Number(payment.amount), 0);

  return <main className="mx-auto max-w-7xl px-5 py-10">
    <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft className="h-4 w-4" />Admin dashboard</Link>
    <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Revenue operations</p><h1 className="mt-2 text-3xl font-black">Payments & premium access</h1><p className="mt-2 text-slate-500">Verify receipts, activate premium access and maintain a clear payment audit trail.</p></div><div className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"><ShieldCheck className="h-5 w-5 text-emerald-300" />Admin-only controls</div></div>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={Clock3} label="Awaiting review" value={pending.length} tone="text-amber-600" /><Metric icon={CheckCircle2} label="Verified sales" value={verified.length} tone="text-emerald-600" /><Metric icon={Crown} label="Verified revenue" value={`PKR ${revenue.toLocaleString()}`} tone="text-slate-950" /><Metric icon={Crown} label="Coupon redemptions" value={couponUses || 0} tone="text-amber-700" /></section>

    <section className="mt-10"><h2 className="text-xl font-black">Pending verification</h2><div className="mt-4 grid gap-4">{pending.length === 0 && <Card><CardContent className="py-10 text-center text-slate-500">No payments are waiting for review.</CardContent></Card>}{pending.map(payment => <PaymentCard key={payment.id} payment={payment} reviewable />)}</div></section>
    <section className="mt-12"><h2 className="text-xl font-black">Payment history</h2><div className="mt-4 grid gap-4">{payments.filter(payment => payment.status !== "pending").map(payment => <PaymentCard key={payment.id} payment={payment} />)}</div></section>
  </main>;
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Clock3; label: string; value: string | number; tone: string }) { return <Card><CardContent className="flex items-center gap-4 pt-6"><div className="rounded-xl bg-slate-100 p-3"><Icon className={`h-5 w-5 ${tone}`} /></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-1 text-2xl font-black ${tone}`}>{value}</p></div></CardContent></Card>; }

function PaymentCard({ payment, reviewable = false }: { payment: PaymentRow; reviewable?: boolean }) {
  return <Card><CardContent className="grid gap-5 pt-6 lg:grid-cols-[1.4fr_.7fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{payment.users?.name || "Candidate"}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${payment.status === "verified" ? "bg-emerald-100 text-emerald-800" : payment.status === "rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{payment.status}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase text-slate-700">{payment.plan_code} pass</span></div><p className="mt-1 text-sm text-slate-500">{payment.users?.email || payment.user_id}</p><p className="mt-3 flex items-center gap-2 text-sm font-semibold"><ReceiptText className="h-4 w-4 text-primary" />Transaction {payment.transaction_id}</p></div><div><p className="text-xs uppercase tracking-wider text-slate-400">Amount</p><p className="mt-1 text-xl font-black">PKR {Number(payment.amount).toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">{new Date(payment.created_at).toLocaleString()}</p></div><div className="flex flex-wrap gap-2 lg:justify-end">{payment.signedUrl && <Button asChild variant="outline" size="sm"><a href={payment.signedUrl} target="_blank" rel="noreferrer">View receipt <ExternalLink className="ml-2 h-3.5 w-3.5" /></a></Button>}{reviewable && <><form action={reviewPayment.bind(null, payment.id, "verified")}><Button size="sm" type="submit"><CheckCircle2 className="mr-2 h-4 w-4" />Approve</Button></form><form action={reviewPayment.bind(null, payment.id, "rejected")}><Button variant="outline" size="sm" type="submit"><XCircle className="mr-2 h-4 w-4 text-red-600" />Reject</Button></form></>}{!reviewable && <><form action={grantBonusCredits.bind(null, payment.user_id, 50)}><Button variant="outline" size="sm" type="submit">+50 credits</Button></form><form action={revokeCoursePasses.bind(null, payment.user_id)}><Button variant="outline" size="sm" type="submit">Revoke passes</Button></form></>}</div></CardContent></Card>;
}
