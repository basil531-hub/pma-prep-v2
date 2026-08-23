"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Trash2 } from "lucide-react";
import { createNonVerbalMcq, deleteNonVerbalMcq } from "@/app/admin/non-verbal-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileDropzone } from "@/components/file-dropzone";

type Question = { id: string; image_url: string; options: unknown; correct_answer: string };
const pageSize = 8;

export function AdminNonVerbalManager({ questions }: { questions: Question[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const pageCount = Math.max(1, Math.ceil(questions.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleQuestions = questions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function submit(form: HTMLFormElement) {
    const formData = new FormData(form);
    const enteredOptions = ["A", "B", "C", "D", "E"]
      .filter((key) => String(formData.get(`option_${key}`) || "").trim());
    const optionCount = enteredOptions.length;
    const correctAnswer = String(formData.get("correct_answer") || "");
    if (optionCount < 2) {
      setMessage("Add at least two options before publishing.");
      return;
    }
    if (!enteredOptions.includes(correctAnswer)) {
      setMessage("Select a correct answer that matches an entered option.");
      return;
    }
    startTransition(async () => {
      try {
        await createNonVerbalMcq(formData);
        setMessage("Diagram question added.");
        form.reset();
        setPage(1);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to add question.");
      }
    });
  }

  function remove(id: string) {
    const form = new FormData();
    form.set("id", id);
    startTransition(async () => {
      try {
        await deleteNonVerbalMcq(form);
        setMessage("Diagram question deleted.");
        setDeleteTarget(null);
        if (visibleQuestions.length === 1 && currentPage > 1) setPage(currentPage - 1);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to delete question.");
      }
    });
  }

  return (
    <section id="non-verbal-bank" className="mt-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Non-Verbal Intelligence</p>
        <h2 className="mt-1 text-2xl font-black">Diagram question bank</h2>
        <p className="mt-2 text-sm text-slate-500">Upload pattern, sequence, and shape diagrams for the 25-minute Non-Verbal test.</p>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <h3 className="flex items-center gap-2 font-black"><ImagePlus className="h-5 w-5 text-primary" />Add image-based question</h3>
        </CardHeader>
        <CardContent>
          <form encType="multipart/form-data" className="space-y-3" onSubmit={(event) => { event.preventDefault(); submit(event.currentTarget); }}>
            <FileDropzone name="image" accept="image/png,image/jpeg,image/webp" label="Drop diagram image here" hint="PNG, JPG, or WEBP up to 5 MB" required />
            <div className="grid gap-3 sm:grid-cols-2">
              {["A", "B", "C", "D", "E"].map((key) => <input key={key} name={`option_${key}`} placeholder={`Option ${key} (optional E)`} />)}
            </div>
            <select name="correct_answer" defaultValue="A">
              {["A", "B", "C", "D", "E"].map((key) => <option key={key} value={key}>Correct answer: {key}</option>)}
            </select>
            <Button disabled={pending}>{pending ? "Saving..." : "Publish diagram question"}</Button>
          </form>
          {message && <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">{message}</p>}
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader className="flex-row items-center justify-between">
          <h3 className="font-black">Published diagrams ({questions.length})</h3>
          {questions.length > 0 && <span className="text-xs font-semibold text-slate-500">Page {currentPage} of {pageCount}</span>}
        </CardHeader>
        <CardContent>
          {visibleQuestions.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">No diagrams published yet.</p>
          ) : (
            <div className="divide-y rounded-xl border">
              {visibleQuestions.map((question, index) => (
                <div className="flex items-center gap-4 p-3" key={question.id}>
                  <div className="grid h-20 w-28 shrink-0 place-items-center rounded-lg bg-slate-50 p-1">
                    <img className="max-h-full max-w-full object-contain" src={question.image_url} alt="Non-verbal question diagram" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800">Diagram question {(currentPage - 1) * pageSize + index + 1}</p>
                    <p className="mt-1 text-sm text-slate-500">Correct answer: <span className="font-bold text-slate-700">{question.correct_answer}</span></p>
                  </div>
                  <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => setDeleteTarget(question.id)} aria-label="Delete diagram question">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <Button type="button" variant="outline" size="sm" disabled={currentPage === 1 || pending} onClick={() => setPage(currentPage - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" />Previous
              </Button>
              <span className="text-xs font-semibold text-slate-500">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, questions.length)} of {questions.length}</span>
              <Button type="button" variant="outline" size="sm" disabled={currentPage === pageCount || pending} onClick={() => setPage(currentPage + 1)}>
                Next<ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4" role="presentation">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
            <h3 id="delete-dialog-title" className="text-lg font-black text-slate-950">Delete this diagram question and its image?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">This action permanently removes the published question and uploaded image. It cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" disabled={pending} onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button type="button" disabled={pending} onClick={() => remove(deleteTarget)}>{pending ? "Deleting..." : "Delete"}</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
