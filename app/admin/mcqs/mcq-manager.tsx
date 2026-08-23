"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileUp, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadFormatGuide } from "@/components/upload-format-guide";
import type { MCQ } from "@/lib/types";
import { bulkUploadMcqs, createMcq, deleteMcq, updateMcq } from "./actions";

const blank = { question: "", A: "", B: "", C: "", D: "", correct_answer: "A", category: "Math", difficulty: "easy" };

type FormValues = typeof blank;

function McqForm({ item, close }: { item?: MCQ; close: () => void }) {
  const [pending, setPending] = useState(false);
  const action = item ? updateMcq : createMcq;
  const values: FormValues = item ? { question: item.question, ...item.options, correct_answer: item.correct_answer, category: item.category, difficulty: item.difficulty } : blank;
  return <div className="fixed inset-0 z-20 grid place-items-center bg-slate-950/40 p-4"><Card className="max-h-[95vh] w-full max-w-2xl overflow-y-auto"><CardContent className="pt-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black">{item ? "Edit MCQ" : "Add new MCQ"}</h2><button type="button" onClick={close} aria-label="Close"><X /></button></div><form action={async (formData) => { setPending(true); await action(formData); close(); }} className="space-y-4"><input type="hidden" name="id" value={item?.id || ""} /><label>Question<textarea name="question" rows={3} defaultValue={values.question} required /></label><div className="grid gap-3 sm:grid-cols-2">{["A", "B", "C", "D"].map((answer) => <label key={answer}>Option {answer}<input name={`option_${answer}`} defaultValue={values[answer as keyof Pick<FormValues, "A" | "B" | "C" | "D">]} required /></label>)}</div><div className="grid gap-3 sm:grid-cols-3"><label>Correct answer<select name="correct_answer" defaultValue={values.correct_answer}>{["A", "B", "C", "D"].map((answer) => <option key={answer}>{answer}</option>)}</select></label><label>Category<select name="category" defaultValue={values.category}>{["Math", "English", "GK", "Psychology"].map((category) => <option key={category}>{category}</option>)}</select></label><label>Difficulty<select name="difficulty" defaultValue={values.difficulty}>{["easy", "medium", "hard"].map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select></label></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button disabled={pending}>{pending ? "Saving..." : "Save MCQ"}</Button></div></form></CardContent></Card></div>;
}

export function McqManager({ initialItems }: { initialItems: MCQ[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<MCQ | "new" | null>(null);
  const [message, setMessage] = useState("");
  const filtered = items.filter((item) => (!query || item.question.toLowerCase().includes(query.toLowerCase())) && (category === "all" || item.category === category) && (difficulty === "all" || item.difficulty === difficulty));
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  async function remove(id: string) { if (!window.confirm("Delete this MCQ? This cannot be undone.")) return; const data = new FormData(); data.set("id", id); await deleteMcq(data); setItems(items.filter((item) => item.id !== id)); }
  async function upload(file: File) { const data = new FormData(); data.set("file", file); setMessage("Uploading..."); try { await bulkUploadMcqs(data); setMessage("Upload complete."); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed."); } }
  return <><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">Admin workspace</p><h1 className="text-3xl font-black">MCQ management</h1><p className="mt-1 text-slate-500">Create, review, and maintain your question bank.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => document.getElementById("mcq-upload")?.click()}><FileUp className="mr-2 h-4 w-4" />Bulk upload</Button><input id="mcq-upload" className="hidden" type="file" accept=".csv,.xlsx,.xls" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} /><Button onClick={() => setEditing("new")}><Plus className="mr-2 h-4 w-4" />Add new MCQ</Button></div></div>{message && <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">{message}</p>}<Card><CardContent className="pt-6"><UploadFormatGuide title="Academic MCQs" columns={["question", "A", "B", "C", "D", "correct_answer", "category", "difficulty"]} example={["What is 2 + 2?", "3", "4", "5", "6", "B", "Math", "easy"]} /><div className="mb-5 mt-5 grid gap-3 md:grid-cols-[1fr_180px_180px]"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className="pl-9" placeholder="Search questions" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></div><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="all">All categories</option>{["Math", "English", "GK", "Psychology"].map((value) => <option key={value}>{value}</option>)}</select><select value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setPage(1); }}><option value="all">All difficulties</option>{["easy", "medium", "hard"].map((value) => <option key={value}>{value}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-slate-50"><tr><th className="p-3">Question</th><th className="p-3">Category</th><th className="p-3">Difficulty</th><th className="p-3">Created</th><th className="p-3">Actions</th></tr></thead><tbody>{visibleItems.map((item) => <tr className="border-b last:border-0" key={item.id}><td className="max-w-md p-3 font-semibold">{item.question}</td><td className="p-3">{item.category}</td><td className="p-3 capitalize">{item.difficulty}</td><td className="p-3 text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td><td className="p-3"><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(item)}><Pencil className="mr-1 h-3 w-3" />Edit</Button><Button size="sm" variant="outline" onClick={() => void remove(item.id)}><Trash2 className="mr-1 h-3 w-3 text-red-600" />Delete</Button></div></td></tr>)}</tbody></table>{!filtered.length && <p className="py-10 text-center text-slate-500">No MCQs match these filters.</p>}{filtered.length > pageSize && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-sm text-slate-500">Page {currentPage} of {pageCount}</p><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>Previous</Button><Button type="button" size="sm" variant="outline" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount}>Next</Button></div></div>}</div></CardContent></Card>{editing && <McqForm item={editing === "new" ? undefined : editing} close={() => setEditing(null)} />}</>;
}
