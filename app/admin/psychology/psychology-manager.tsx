"use client";

import { useEffect, useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { deletePsychologyItem, togglePsychologyItem, updatePsychologyItem } from "./actions";

export type Item = { id: string; value: string; language?: string; active: boolean; kind: "WAT" | "SCT" | "SelfDescription" | "TAT" };

export function PsychologyManager({ items }: { items: Item[] }) {
  const [localItems, setLocalItems] = useState(items);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  useEffect(() => setLocalItems(items), [items]);
  const filtered = localItems.filter((item) => !query || item.value.toLowerCase().includes(query.toLowerCase()) || item.kind.toLowerCase().includes(query.toLowerCase()));
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function remove(item: Item) {
    const form = new FormData();
    form.set("id", item.id);
    form.set("kind", item.kind);
    startTransition(async () => {
      try { await deletePsychologyItem(form); setLocalItems((current) => current.filter((currentItem) => currentItem.id !== item.id || currentItem.kind !== item.kind)); setMessage(`${item.kind} item deleted.`); setDeleteTarget(null); }
      catch (error) { setMessage(error instanceof Error ? error.message : "Delete failed."); }
    });
  }

  function toggle(item: Item) {
    const form = new FormData();
    form.set("id", item.id);
    form.set("kind", item.kind);
    form.set("active", String(!item.active));
    startTransition(async () => {
      try { await togglePsychologyItem(form); setLocalItems((current) => current.map((currentItem) => currentItem.id === item.id && currentItem.kind === item.kind ? { ...currentItem, active: !item.active } : currentItem)); setMessage(`${item.kind} item ${item.active ? "hidden" : "activated"}.`); }
      catch (error) { setMessage(error instanceof Error ? error.message : "Status update failed."); }
    });
  }

  return <>
    <Card className="mt-8">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-black">All published content</h2><p className="text-sm text-slate-500">{items.length} total items. Hidden items remain available for future use.</p></div>
          <input className="w-full sm:w-72" placeholder="Search words, prompts, or type" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
        </div>
        {message && <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">{message}</p>}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-slate-50"><tr><th className="p-3">Type</th><th className="p-3">Prompt / word</th><th className="p-3">Language</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
            <tbody>{visibleItems.map((item) => <tr className="border-b last:border-0" key={`${item.kind}-${item.id}`}><td className="p-3 font-bold">{item.kind}</td><td className="max-w-md p-3">{item.value}</td><td className="p-3 uppercase">{item.language || "-"}</td><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}>{item.active ? "Active" : "Hidden"}</span></td><td className="p-3"><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(item)}><Pencil className="mr-1 h-3 w-3" />Edit</Button><Button size="sm" variant="outline" onClick={() => toggle(item)} disabled={pending}>{item.active ? "Hide" : "Activate"}</Button><Button size="sm" variant="outline" onClick={() => setDeleteTarget(item)} disabled={pending}><Trash2 className="mr-1 h-3 w-3 text-red-600" />Delete</Button></div></td></tr>)}</tbody>
          </table>
          {!filtered.length && <p className="py-8 text-center text-sm text-slate-500">No matching psychology content.</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-sm text-slate-500">Page {currentPage} of {pageCount}</p><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>Previous</Button><Button type="button" size="sm" variant="outline" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount}>Next</Button></div></div>
        </div>
      </CardContent>
    </Card>
    {editing && <EditDialog item={editing} close={() => setEditing(null)} />}
    {deleteTarget && <DeleteDialog item={deleteTarget} close={() => setDeleteTarget(null)} confirm={() => remove(deleteTarget)} pending={pending} />}
  </>;
}

function DeleteDialog({ item, close, confirm, pending }: { item: Item; close: () => void; confirm: () => void; pending: boolean }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="presentation"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="psychology-delete-title"><h2 id="psychology-delete-title" className="text-lg font-black text-slate-950">Delete this {item.kind} item?</h2><p className="mt-2 text-sm leading-6 text-slate-500">This will permanently remove <strong className="text-slate-700">{item.value}</strong> from the published psychology content.</p><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="outline" disabled={pending} onClick={close}>Cancel</Button><Button type="button" disabled={pending} onClick={confirm}>{pending ? "Deleting..." : "Delete item"}</Button></div></div></div>;
}

function EditDialog({ item, close }: { item: Item; close: () => void }) {
  const [pending, startTransition] = useTransition();
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><Card className="w-full max-w-lg"><CardHeader><div className="flex items-center justify-between"><h2 className="text-xl font-black">Edit {item.kind}</h2><button type="button" onClick={close} aria-label="Close"><X /></button></div></CardHeader><CardContent><form action={(form) => startTransition(async () => { await updatePsychologyItem(form); close(); })} className="space-y-4"><input type="hidden" name="id" value={item.id} /><input type="hidden" name="kind" value={item.kind} /><label>Prompt or word<textarea name="value" rows={3} defaultValue={item.value} required /></label>{item.kind === "SCT" && <label>Language<select name="language" defaultValue={item.language || "en"}><option value="en">English</option><option value="ur">Urdu</option></select></label>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button></div></form></CardContent></Card></div>;
}
