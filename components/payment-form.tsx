"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitPayment, type PaymentSubmissionState } from "@/app/upgrade/actions";
import { FileDropzone } from "@/components/file-dropzone";

const initialState: PaymentSubmissionState = { ok: false };

export function PaymentForm({ amount, planCode }: { amount: number; planCode: string }) {
  const [state, action, pending] = useActionState(submitPayment, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.replace("/upgrade?submitted=1");
      router.refresh();
    }
  }, [state.ok, router]);

  return <form action={action} className="space-y-5">
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
      <p className="flex items-center gap-2 font-bold"><LockKeyhole className="h-4 w-4" /> Secure verification</p>
      <p className="mt-1 leading-6">Your account and price are verified on the server. The screenshot is stored privately for administrator review.</p>
    </div>
    <label>Transaction ID
      <div className="relative mt-1"><ReceiptText className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="pl-10" name="transaction_id" minLength={6} maxLength={40} pattern="[A-Za-z0-9-]+" placeholder="e.g. 12345678901" required /></div>
    </label>
    <label>Payment screenshot
      <div className="mt-1"><FileDropzone name="screenshot" accept="image/jpeg,image/png,image/webp" imagePreset="receipt" label="Drop payment receipt here" hint="JPG, PNG or WebP · optimized carefully · maximum 5 MB" required /></div>
    </label>
    <input type="hidden" name="plan_code" value={planCode} />
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{state.error}</p>}
    <Button className="w-full" size="lg" type="submit" disabled={pending}>{pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting securely…</> : <>Submit PKR {amount.toLocaleString()} payment</>}</Button>
    <p className="text-center text-xs leading-5 text-slate-500">Never share your Easypaisa PIN or OTP. PMA Prep only needs the transaction reference and receipt image.</p>
  </form>;
}
