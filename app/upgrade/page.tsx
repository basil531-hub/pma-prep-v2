import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Clock3, Copy, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { accessPlans, isPlanCode, planDiscount } from "@/lib/plans";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PaymentForm } from "@/components/payment-form";
import { CouponForm } from "@/components/coupon-form";

export default async function Upgrade({ searchParams }: { searchParams: Promise<{ submitted?: string; plan?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const selectedCode = isPlanCode(params.plan || "") ? params.plan as keyof typeof accessPlans : "complete";
  const selected = accessPlans[selectedCode];
  const { data: pending } = await supabase.from("payments").select("id,status,transaction_id,plan_code,created_at").eq("user_id", user.id).eq("status", "pending").order("created_at", { ascending: false }).limit(1).maybeSingle();
  const account = process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT || "0300-1234567";
  const accountName = process.env.NEXT_PUBLIC_EASYPAISA_ACCOUNT_NAME || "PMA Prep";

  return <main className="mx-auto max-w-6xl px-5 py-10">
    <div className="text-center"><p className="font-bold uppercase tracking-wider text-primary">Choose your preparation pass</p><h1 className="mt-2 text-4xl font-black">Simple access. No lifetime lock-in.</h1><p className="mx-auto mt-3 max-w-2xl text-slate-500">Every account starts with 100 practice credits. Choose a pass for unlimited normal practice in the course you need.</p></div>
    <section className="mt-8 grid gap-4 md:grid-cols-3">{Object.values(accessPlans).map(plan => <Link href={`/upgrade?plan=${plan.code}`} key={plan.code}><Card className={`h-full transition hover:-translate-y-1 ${selectedCode === plan.code ? "border-emerald-500 ring-2 ring-emerald-100" : ""}`}><CardContent className="pt-6"><div className="flex items-center justify-between gap-2"><h2 className="font-black">{plan.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-black ${plan.code === "complete" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{plan.code === "complete" ? "BEST VALUE" : `${planDiscount(plan)}% OFF`}</span></div><p className="mt-4 text-sm font-bold text-slate-400 line-through">PKR {plan.originalPrice.toLocaleString()}</p><p className="mt-1 text-3xl font-black">PKR {plan.price.toLocaleString()}</p><p className="mt-1 text-xs font-bold text-emerald-700">Save PKR {(plan.originalPrice-plan.price).toLocaleString()}</p><p className="mt-2 text-sm text-slate-500">{plan.days} days access</p><p className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700"><Check className="h-4 w-4" />{plan.scopes.length === 2 ? "Initial + ISSB" : plan.scopes[0] === "initial" ? "Complete PMA Initial" : "Complete ISSB"}</p></CardContent></Card></Link>)}</section>

    <div className="mx-auto mt-8 max-w-2xl"><CouponForm /></div>
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <Card className="bg-gradient-to-br from-green-950 to-slate-950 text-white"><CardHeader><div className="flex items-center gap-3"><Smartphone className="text-amber-400" /><h2 className="text-xl font-bold">Pay for {selected.name}</h2></div></CardHeader><CardContent><p className="text-sm text-green-100">Send exactly</p><p className="mt-1 text-4xl font-black">PKR {selected.price.toLocaleString()}</p><p className="mt-2 flex items-center gap-2 text-sm text-emerald-200"><Zap className="h-4 w-4" />{selected.days} days · {selected.scopes.join(" + ").toUpperCase()} access</p><div className="mt-6 rounded-xl bg-white/10 p-5"><p className="text-xs uppercase text-green-200">Easypaisa account</p><p className="mt-1 flex items-center gap-2 text-2xl font-bold">{account}<Copy className="h-4 w-4" /></p><p className="mt-2 text-sm text-green-100">Account title: {accountName}</p></div><ol className="mt-6 space-y-3 text-sm text-green-50">{["Send the exact amount shown above.", "Keep the transaction ID and receipt screenshot.", "Submit once and wait for administrator approval."].map((item, index) => <li className="flex gap-3" key={item}><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-400 font-bold text-slate-950">{index + 1}</span>{item}</li>)}</ol></CardContent></Card>
      <Card><CardHeader><h2 className="text-xl font-bold">Payment verification</h2><p className="mt-1 text-sm text-slate-500">The selected package, price and signed-in account are verified on the server.</p></CardHeader><CardContent>{params.submitted || pending ? <div className="rounded-xl bg-amber-50 p-6 text-center"><Clock3 className="mx-auto h-10 w-10 text-amber-600" /><h3 className="mt-3 font-bold text-amber-900">Payment under review</h3><p className="mt-2 text-sm text-amber-800">Transaction {pending?.transaction_id || "submitted"} is waiting for approval. Your pass begins when the administrator verifies it.</p></div> : <PaymentForm amount={selected.price} planCode={selected.code} />}<div className="mt-6 border-t pt-5"><p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Never share your Easypaisa PIN or OTP. PMA Prep only requires the receipt and transaction reference.</p></div></CardContent></Card>
    </div>
  </main>;
}
