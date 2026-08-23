"use client";

import { useState, useTransition } from "react";
import { FileUp } from "lucide-react";
import { bulkUploadInitialQuestions } from "@/app/admin/initial-actions";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UploadFormatGuide } from "@/components/upload-format-guide";

type Test = { id: string; type: string };

export function InitialMcqBulkUpload({ tests }: { tests: Test[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function submit(form: HTMLFormElement) {
    startTransition(async () => {
      try {
        await bulkUploadInitialQuestions(new FormData(form));
        setMessage("Questions uploaded successfully.");
        form.reset();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Bulk upload failed.");
      }
    });
  }

  return <Card className="mt-5"><CardHeader><h3 className="flex items-center gap-2 font-black"><FileUp className="h-5 w-5 text-primary" />Bulk upload Initial MCQs</h3></CardHeader><CardContent><form encType="multipart/form-data" className="space-y-4" onSubmit={(event) => { event.preventDefault(); submit(event.currentTarget); }}><select name="test_id" required defaultValue=""><option value="" disabled>Choose test</option>{tests.map((test) => <option key={test.id} value={test.id}>{test.type}</option>)}</select><FileDropzone name="file" accept=".csv,.xlsx,.xls" label="Drop your question file here" hint="CSV or Excel up to 5 MB" required /><UploadFormatGuide title="Initial MCQs" columns={["question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer"]} example={["What is 2 + 2?", "3", "4", "5", "6", "B"]} /><Button disabled={pending}>{pending ? "Uploading..." : "Upload questions"}</Button></form>{message && <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm">{message}</p>}</CardContent></Card>;
}
