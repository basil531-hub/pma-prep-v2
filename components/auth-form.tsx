import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { oauthLogin } from "@/app/auth/actions";

export function AuthForm({ mode, action, error, message, next, referralCode }: { mode: "login" | "signup"; action: (data: FormData) => void | Promise<void>; error?: string; message?: string; next?: string; referralCode?: string }) {
  const signup = mode === "signup";
  return <Card className="w-full max-w-md"><CardHeader><h1 className="text-2xl font-bold">{signup ? "Create your account" : "Welcome back"}</h1><p className="mt-1 text-sm text-slate-500">{signup ? "Start with 100 credits, then choose the preparation pass you need." : "Continue your preparation."}</p></CardHeader><CardContent><form action={action} className="space-y-4"><input type="hidden" name="next" value={next || ""} /><input type="hidden" name="referral_code" value={referralCode || ""} />
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
    {signup && <><div className="space-y-1.5"><label htmlFor="name">Full name</label><input id="name" name="name" required /></div>{referralCode && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Referral code {referralCode} applied. Complete your first practice to earn 25 bonus credits.</p>}</>}
    <div className="space-y-1.5"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div><div className="space-y-1.5"><label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={6} required /></div>
    <Button className="w-full" size="lg">{signup ? "Create account" : "Sign in"}</Button>
  </form><div className="my-5 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div><form action={oauthLogin}><input type="hidden" name="next" value={next || ""} /><input type="hidden" name="referral_code" value={referralCode || ""} /><Button type="submit" variant="outline" className="w-full" size="lg">Continue with Google</Button></form><p className="mt-5 text-center text-sm text-slate-500">{signup ? "Already registered?" : "New to PMA Prep?"} <Link className="font-semibold text-primary" href={`${signup ? "/login" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`}>{signup ? "Sign in" : "Create account"}</Link></p></CardContent></Card>;
}
