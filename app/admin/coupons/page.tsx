import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarClock, CheckCircle2, CircleOff, TicketPercent, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createCoupon, deleteCoupon, toggleCoupon } from "../actions";

export const dynamic = "force-dynamic";

type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  plan_code: string;
  access_days: number;
  max_redemptions: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("users").select("role").eq("id", user.id).maybeSingle() : { data: null };
  if (!user || (profile?.role !== "admin" && !isAdminEmail(user.email))) redirect("/dashboard");

  const admin = createAdminClient();
  const [{ data: couponData, error }, { data: redemptionData }] = await Promise.all([
    admin.from("coupons").select("id,code,discount_percent,plan_code,access_days,max_redemptions,starts_at,expires_at,is_active").order("created_at", { ascending: false }),
    admin.from("coupon_redemptions").select("coupon_id"),
  ]);
  if (error) throw new Error(`Unable to load coupons: ${error.message}`);
  const redemptions = (redemptionData || []).reduce<Record<string, number>>((counts, redemption) => {
    counts[redemption.coupon_id] = (counts[redemption.coupon_id] || 0) + 1;
    return counts;
  }, {});
  const coupons = (couponData || []) as Coupon[];

  return <main className="mx-auto max-w-6xl px-5 py-10">
    <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft className="h-4 w-4" />Admin dashboard</Link>
    <div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Revenue operations</p><h1 className="mt-2 text-3xl font-black">Coupon management</h1><p className="mt-2 max-w-2xl text-slate-500">Turn promotional codes on or off without changing their redemption history.</p></div><div className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"><TicketPercent className="h-5 w-5 text-amber-300" />{coupons.length} coupon{coupons.length === 1 ? "" : "s"}</div></div>
    <Card className="mt-8"><CardHeader><h2 className="text-xl font-black">Create coupon</h2><p className="text-sm text-slate-500">Create a promotional code with its own access, usage and schedule limits.</p></CardHeader><CardContent><form action={createCoupon} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm font-semibold">Code<input name="code" className="mt-2 uppercase" placeholder="PMA-SUMMER" maxLength={32} required /></label><label className="text-sm font-semibold">Discount %<input name="discount_percent" className="mt-2" type="number" min="1" max="100" defaultValue="100" required /></label><label className="text-sm font-semibold">Plan<select name="plan_code" className="mt-2" defaultValue="complete"><option value="initial">Initial</option><option value="issb">ISSB</option><option value="complete">Complete</option></select></label><label className="text-sm font-semibold">Access days<input name="access_days" className="mt-2" type="number" min="1" defaultValue="30" required /></label><label className="text-sm font-semibold">Maximum redemptions<input name="max_redemptions" className="mt-2" type="number" min="1" defaultValue="500" required /></label><label className="text-sm font-semibold">Starts at<span className="mt-2 block"><input name="starts_at" className="w-full" type="datetime-local" /></span></label><label className="text-sm font-semibold">Expires at<span className="mt-2 block"><input name="expires_at" className="w-full" type="datetime-local" required /></span></label><label className="flex items-end gap-2 pb-2 text-sm font-semibold"><input name="is_active" type="checkbox" defaultChecked /> Active immediately</label><div className="sm:col-span-2 lg:col-span-4"><Button type="submit"><TicketPercent className="mr-2 h-4 w-4" />Create coupon</Button></div></form></CardContent></Card>
    <section className="mt-8 grid gap-4">
      {coupons.length === 0 && <Card><CardContent className="py-10 text-center text-slate-500">No coupons have been created.</CardContent></Card>}
      {coupons.map((coupon) => {
        const used = redemptions[coupon.id] || 0;
        const expired = new Date(coupon.expires_at) <= new Date();
        const available = coupon.is_active && !expired;
        return <Card key={coupon.id}><CardContent className="grid gap-5 pt-6 lg:grid-cols-[1.4fr_.9fr_auto] lg:items-center">
          <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black tracking-wide">{coupon.code}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${available ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{available ? "active" : expired ? "expired" : "off"}</span></div><p className="mt-2 text-sm text-slate-500">{coupon.discount_percent}% off {coupon.plan_code} access · {coupon.access_days} days</p></div>
          <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs uppercase tracking-wider text-slate-400">Redemptions</p><p className="mt-1 font-black">{used} / {coupon.max_redemptions}</p></div><div><p className="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400"><CalendarClock className="h-3.5 w-3.5" />Expires</p><p className="mt-1 font-semibold">{new Date(coupon.expires_at).toLocaleDateString()}</p></div></div>
          <div className="flex flex-wrap gap-2 lg:justify-end"><form action={toggleCoupon.bind(null, coupon.id, !coupon.is_active)}><Button type="submit" variant={coupon.is_active ? "outline" : "default"}>{coupon.is_active ? <><CircleOff className="mr-2 h-4 w-4" />Turn off</> : <><CheckCircle2 className="mr-2 h-4 w-4" />Turn on</>}</Button></form><form action={deleteCoupon.bind(null, coupon.id)}><Button type="submit" variant="outline" className="text-red-700 hover:bg-red-50"><Trash2 className="mr-2 h-4 w-4" />Delete</Button></form></div>
        </CardContent></Card>;
      })}
    </section>
  </main>;
}