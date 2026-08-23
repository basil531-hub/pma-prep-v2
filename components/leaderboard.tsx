import { Trophy } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export type LeaderboardEntry = { name: string; score: number; attempts: number };
export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return <Card><CardContent className="pt-6"><div className="space-y-3">{entries.map((entry, index) => <div className="flex items-center gap-3 rounded-xl border p-3" key={`${entry.name}-${index}`}><span className="grid h-8 w-8 place-items-center rounded-full bg-green-50 font-black text-primary">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate font-bold">{entry.name}</p><p className="text-xs text-slate-500">{entry.attempts} completed tests</p></div><p className="font-black">{entry.score.toFixed(0)}%</p>{index === 0 && <Trophy className="h-5 w-5 text-amber-500" />}</div>)}{!entries.length && <p className="text-sm text-slate-500">Scores appear here after students complete practice tests.</p>}</div></CardContent></Card>;
}