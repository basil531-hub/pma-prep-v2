import Link from "next/link";
import { CircleUserRound, LogOut, Settings, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/auth/actions";

export function ProfileMenu({ name, email, role = "candidate" }: { name?: string | null; email?: string | null; role?: "admin" | "candidate" }) {
  const initials = (name || email || "U").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const isAdmin = role === "admin";
  return <details className="relative">
    <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl px-2.5 text-sm font-semibold hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-black text-white">{initials}</span>
    </summary>
    <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border bg-white p-2 shadow-xl">
      <div className="border-b px-3 pb-3 pt-2"><p className="truncate text-sm font-bold">{isAdmin ? "Admin" : "Candidate"}</p><p className="truncate text-xs text-slate-500">{email}</p></div>
      <Link href={isAdmin ? "/admin" : "/dashboard"} className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-50"><CircleUserRound className="h-4 w-4 text-primary" />{isAdmin ? "Admin profile" : "Candidate profile"}</Link>
      <Link href={isAdmin ? "/admin" : "/dashboard/progress"} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-50"><Settings className="h-4 w-4 text-primary" />{isAdmin ? "Admin dashboard" : "Settings"}</Link>
      {isAdmin && <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600"><ShieldCheck className="h-4 w-4 text-primary" />Role: Admin</div>}
      <form action={signOut}><button className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" />Sign out</button></form>
    </div>
  </details>;
}
