"use client";
export function AnalyticsChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <div className="flex h-56 items-end gap-3 border-b border-slate-200 px-2 pb-0">{data.map((item) => <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={item.label}><span className="text-xs font-bold text-slate-500">{item.value}</span><div className="w-full rounded-t-lg bg-primary/80" style={{ height: `${Math.max((item.value / max) * 150, 8)}px` }} /><span className="max-w-full truncate text-xs text-slate-500">{item.label}</span></div>)}</div>;
}