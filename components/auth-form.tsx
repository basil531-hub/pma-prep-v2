import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { oauthLogin } from "@/app/auth/actions";

export function AuthForm({ mode, action, error, message, next, referralCode }: { mode: "login" | "signup"; action: (data: FormData) => void | Promise<void>; error?: string; message?: string; next?: string; referralCode?: string }) {
  const signup = mode === "signup";
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h1 className="text-2xl font-bold">{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {signup ? "Start with 100 credits, then choose the preparation pass you need." : "Continue your preparation."}
        </p>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="next" value={next || ""} />
          <input type="hidden" name="referral_code" value={referralCode || ""} />
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          {signup && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" required />
              </div>
              {referralCode && (
                <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                  Referral code {referralCode} applied. Complete your first practice to earn 25 bonus credits.
                </p>
              )}
            </>
          )}
          <div className="space-y-1.5">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" minLength={6} required />
          </div>
          <Button className="w-full" size="lg">{signup ? "Create account" : "Sign in"}</Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-2">
          <form action={oauthLogin}>
            <input type="hidden" name="next" value={next || ""} />
            <input type="hidden" name="provider" value="google" />
            <input type="hidden" name="referral_code" value={referralCode || ""} />
            <Button type="submit" variant="outline" className="w-full justify-center gap-3 text-slate-700" size="lg">
              <svg className="size-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4.1 6v5h6.6c3.9-3.6 6.1-8.8 6.1-14.7z" />
                <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2C9.2 39.4 16 44 24 44z" />
                <path fill="#FBBC05" d="M12.6 27.6c-.4-1.2-.7-2.5-.7-3.8s.2-2.6.7-3.8v-5.2H5.8c-1.4 2.8-2.2 5.8-2.2 9s.8 6.2 2.2 9l6.8-5.2z" />
                <path fill="#EA4335" d="M24 11.4c3 0 5.8 1 7.9 3l5.9-5.9C34.1 5.2 29.5 3.6 24 3.6c-8 0-14.8 4.6-18.2 11.2l6.8 5.2c1.6-4.8 6.1-8.6 11.4-8.6z" />
              </svg>
              <span>Continue with Google</span>
            </Button>
          </form>
          <form action={oauthLogin}>
            <input type="hidden" name="next" value={next || ""} />
            <input type="hidden" name="provider" value="facebook" />
            <input type="hidden" name="referral_code" value={referralCode || ""} />
            <Button type="submit" variant="outline" className="w-full justify-center gap-3 border-[#1877F2] bg-[#1877F2] text-white hover:bg-[#166fe5]" size="lg">
              <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5H17V3.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.5V13h2.8v8h3.2z" />
              </svg>
              <span>Continue with Facebook</span>
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          {signup ? "Already registered?" : "New to PMA Prep?"}{" "}
          <Link className="font-semibold text-primary" href={`${signup ? "/login" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`}>
            {signup ? "Sign in" : "Create account"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
