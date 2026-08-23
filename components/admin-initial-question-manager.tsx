"use client";

import { type ChangeEvent, useState, useTransition } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { createInitialQuestion, deleteInitialQuestion } from "@/app/admin/initial-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Test = { id: string; type: "Academic" | "Verbal" | "Non-Verbal"; total_questions: number; time_limit: number; passing_marks: number };
type Question = { id: string; test_id: string; question_text: string; options: string[]; correct_answer: string; image_url?: string | null };

export function AdminInitialQuestionManager({ tests, questions }: { tests: Test[]; questions: Question[] }) {
  const [selectedTest, setSelectedTest] = useState(tests[0]?.id || "");
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const selectedQuestions = questions.filter((question) => question.test_id === selectedTest);
  const [questionPage, setQuestionPage] = useState(1);
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(selectedQuestions.length / pageSize));
  const currentPage = Math.min(questionPage, pageCount);
  const visibleQuestions = selectedQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selected = tests.find((test) => test.id === selectedTest);

  function handleImagePreview(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function submit(form: HTMLFormElement) {
    startTransition(async () => { try { await createInitialQuestion(new FormData(form)); setMessage("Question added."); form.reset(); setShowForm(false); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to add question."); } });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this question permanently?")) return;
    const form = new FormData(); form.set("id", id);
    startTransition(async () => { try { await deleteInitialQuestion(form); setMessage("Question deleted."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete question."); } });
  }

  return <section id="initial-question-bank" className="mt-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-primary">PMA Initial Course</p><h2 className="mt-1 text-2xl font-black">Initial MCQ question bank</h2><p className="mt-2 text-sm text-slate-500">Add and delete questions for all three Initial Course tests directly from this dashboard.</p></div><Button onClick={() => setShowForm((value) => !value)} disabled={!tests.length}><Plus className="mr-2 h-4 w-4" />{showForm ? "Close form" : "Add question"}</Button></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{tests.map((test) => <button className={`rounded-2xl border p-4 text-left transition ${selectedTest === test.id ? "border-primary bg-green-50" : "bg-white hover:border-primary"}`} key={test.id} onClick={() => { setSelectedTest(test.id); setQuestionPage(1); setShowForm(false); }}><p className="font-black">{test.type}</p><p className="mt-1 text-sm text-slate-500">{questions.filter((question) => question.test_id === test.id).length} / {test.total_questions} questions</p><p className="mt-1 text-xs text-slate-400">{Math.round(test.time_limit / 60)} min · {test.passing_marks}% pass</p></button>)}</div>{message && <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">{message}</p>}{showForm && selected && <Card className="mt-5"><CardHeader><h3 className="font-black">Add {selected.type} question</h3></CardHeader><CardContent><form className="space-y-3" onSubmit={(event) => { event.preventDefault(); submit(event.currentTarget); }}><input type="hidden" name="test_id" value={selected.id} /><textarea name="question_text" rows={3} placeholder="Question text" required /><div className="grid gap-3 sm:grid-cols-2">{["A", "B", "C", "D"].map((key) => <input key={key} name={`option_${key}`} placeholder={`Option ${key}`} required />)}</div><select name="correct_answer" defaultValue="A"><option value="A">Correct answer: A</option><option value="B">Correct answer: B</option><option value="C">Correct answer: C</option><option value="D">Correct answer: D</option></select><Button disabled={pending}>{pending ? "Adding..." : "Add question"}</Button></form></CardContent></Card>}<Card className="mt-5"><CardHeader><h3 className="font-black">{selected?.type || "Initial"} questions</h3></CardHeader><CardContent><div className="space-y-3">{visibleQuestions.map((question, index) => <div className="flex items-start justify-between gap-4 rounded-xl border p-4" key={question.id}><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Question {(currentPage - 1) * pageSize + index + 1}</p><p className="mt-1 font-semibold">{question.question_text}</p><p className="mt-2 text-xs text-slate-500">Correct answer: {question.correct_answer}</p></div><Button variant="outline" size="sm" onClick={() => remove(question.id)} disabled={pending} aria-label="Delete question"><Trash2 className="h-4 w-4 text-red-600" /></Button></div>)}{!selectedQuestions.length && <p className="py-6 text-sm text-slate-500">No questions in this bank yet.</p>}<div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-sm text-slate-500">Page {currentPage} of {pageCount}</p><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setQuestionPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Previous</Button><Button type="button" size="sm" variant="outline" onClick={() => setQuestionPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage === pageCount}>Next</Button></div></div></div></CardContent></Card></section>;
}
