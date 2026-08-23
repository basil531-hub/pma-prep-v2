"use client";

import { useActionState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { redeemLaunchCoupon, type CouponState } from "@/app/upgrade/actions";
import { Button } from "@/components/ui/button";

const initialState: CouponState = { ok: false };

export function CouponForm() {
  const [state, action, pending] = useActionState(redeemLaunchCoupon, initialState);
  return <form action={action} className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
    <div className="flex items-start gap-3"><Gift className="mt-0.5 h-5 w-5 text-amber-700" /><div><h2 className="font-black text-amber-950">Launch coupon</h2><p className="mt-1 text-sm text-amber-800">Enter a valid code to activate promotional access instantly.</p></div></div>
    <div className="mt-4 flex gap-2"><input className="uppercase" name="coupon_code" maxLength={32} placeholder="Enter coupon code" required /><Button type="submit" disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}</Button></div>
    {state.error&&<p role="alert" className="mt-3 text-sm font-bold text-red-700">{state.error}</p>}
    {state.ok&&<p role="status" className="mt-3 text-sm font-bold text-emerald-800">Coupon applied. Your {state.days}-day {state.plan} access is active.</p>}
  </form>;
}
