"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckSquare, Trash2 } from "lucide-react";
import { bulkDeleteInitialQuestions } from "@/app/admin/initial-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Question = { id: string; test_id: string; question_text: string };
type Test = { id: string; type: string };

export function InitialMcqBulkDelete({ tests, questions }: { tests: Test[]; questions: Question[] }) {
  const [testId, setTestId] = useState(tests[0]?.id || "");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const visible = useMemo(() => questions.filter((question) => question.test_id === testId), [questions, testId]);
  const allSelected = visible.length > 0 && visible.every((question) => selected.includes(question.id));

  function changeTest(value: string) {
    setTestId(value);
    setSelected([]);
    setMessage("");
  }

  function toggleAll() {
    setSelected(allSelected ? [] : visible.map((question) => question.id));
  }

  function confirmDelete() {
    const form = new FormData();
    form.set("ids", JSON.stringify(selected));
    startTransition(async () => {
      try {
        await bulkDeleteInitialQuestions(form);
        setMessage(`${selected.length} question${selected.length === 1 ? "" : "s"} deleted.`);
        setSelected([]);
        setConfirming(false);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Bulk delete failed.");
      }
    });
  }

  return (
    <Card className="mt-5">
      <CardHeader><h3 className="flex items-center gap-2 font-black"><CheckSquare className="h-5 w-5 text-primary" />Bulk delete questions</h3></CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <select value={testId} onChange={(event) => changeTest(event.target.value)} aria-label="Choose test for bulk deletion">
            {tests.map((test) => <option key={test.id} value={test.id}>{test.type}</option>)}
          </select>
          <Button type="button" variant="outline" onClick={toggleAll} disabled={!visible.length}>{allSelected ? "Clear all" : "Select all"}</Button>
          <Button type="button" disabled={!selected.length || pending} onClick={() => setConfirming(true)}><Trash2 className="mr-2 h-4 w-4" />Delete selected ({selected.length})</Button>
        </div>
        <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border">
          {visible.length ? visible.map((question) => <label className="flex cursor-pointer items-start gap-3 border-b p-3 last:border-0 hover:bg-slate-50" key={question.id}><input type="checkbox" checked={selected.includes(question.id)} onChange={() => setSelected((current) => current.includes(question.id) ? current.filter((id) => id !== question.id) : [...current, question.id])} /><span className="text-sm">{question.question_text}</span></label>) : <p className="p-4 text-sm text-slate-500">No questions in this test.</p>}
        </div>
        {message && <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">{message}</p>}
        {confirming && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="presentation"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="bulk-delete-title"><h4 id="bulk-delete-title" className="text-lg font-black">Delete {selected.length} selected question{selected.length === 1 ? "" : "s"}?</h4><p className="mt-2 text-sm leading-6 text-slate-500">This permanently removes the selected questions and any attached images. This action cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="outline" disabled={pending} onClick={() => setConfirming(false)}>Cancel</Button><Button type="button" disabled={pending} onClick={confirmDelete}>{pending ? "Deleting..." : "Delete permanently"}</Button></div></div></div>}
      </CardContent>
    </Card>
  );
}
