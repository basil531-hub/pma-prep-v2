import Link from "next/link";
import { LockKeyhole, type LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export function ModuleCard({ title, description, icon: Icon, locked, href, upgradeHref = "/upgrade?plan=complete" }: { title: string; description: string; icon: LucideIcon; locked: boolean; href: string; upgradeHref?: string }) {
  return <Card className="relative overflow-hidden"><CardContent className="pt-6"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-primary"><Icon className="h-5 w-5" /></div>{locked && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">PASS OR CREDITS</span>}</div><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{description}</p>{locked ? <Button asChild variant="gold" className="mt-5 w-full"><Link href={upgradeHref}><LockKeyhole className="mr-2 h-4 w-4" />View access</Link></Button> : <Button asChild variant="outline" className="mt-5 w-full"><Link href={href}>Open module</Link></Button>}</CardContent></Card>;
}
