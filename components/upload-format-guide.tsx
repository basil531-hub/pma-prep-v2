"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { title: string; columns: string[]; example: string[] };

export function UploadFormatGuide({ title, columns, example }: Props) {
  function downloadTemplate() {
    const csv = [columns, example].map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600"><div className="flex flex-wrap items-center justify-between gap-2"><p><strong>{title} format</strong>: {columns.map((column) => <code className="mx-0.5" key={column}>{column}</code>)}</p><Button type="button" size="sm" variant="outline" onClick={downloadTemplate}><Download className="mr-2 h-3.5 w-3.5" />Download template</Button></div><p className="mt-2 text-slate-500">Example: {example.join(" | ")}</p></div>;
}
