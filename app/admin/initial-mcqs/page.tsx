import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { AdminInitialQuestionManager } from "@/components/admin-initial-question-manager";
import { AdminNonVerbalManager } from "@/components/admin-non-verbal-manager";
import { InitialMcqBulkUpload } from "@/components/initial-mcq-bulk-upload";
import { InitialMcqBulkDelete } from "@/components/initial-mcq-bulk-delete";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminInitialMcqsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && !isAdminEmail(user.email)) redirect("/dashboard?error=admin");

  const admin = createAdminClient();
  const [{ data: tests, error: testsError }, { data: questions, error: questionsError }, { data: nonVerbalQuestions, error: nonVerbalError }] = await Promise.all([
    admin.from("initial_tests").select("id,type,total_questions,time_limit,passing_marks").order("type"),
    admin.from("initial_questions").select("id,test_id,question_text,options,correct_answer,image_url").order("sort_order"),
    admin.from("non_verbal_mcqs").select("id,image_url,options,correct_answer").order("created_at", { ascending: false }),
  ]);

  if (testsError || questionsError || nonVerbalError) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h1 className="text-2xl font-black">Initial MCQ database is not ready</h1>
            <p className="text-slate-600">
              The app could not read the required Initial Course tables. Check the Supabase schema and refresh the page.
            </p>
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {testsError?.message || questionsError?.message || nonVerbalError?.message || "Unknown database error"}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const nonVerbalQuestionsWithUrls = await Promise.all((nonVerbalQuestions || []).map(async (question) => ({
    ...question,
    image_url: (await admin.storage.from("non-verbal-mcqs").createSignedUrl(question.image_url, 3600)).data?.signedUrl || "",
  })));

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-primary">PMA Initial Course</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Initial MCQ Manager</h1>
          <p className="mt-2 text-sm text-slate-500">Add, review and remove questions from the Initial Course exam bank.</p>
        </div>
      </div>

      <AdminInitialQuestionManager
        tests={(tests || []) as never[]}
        questions={(questions || []) as never[]}
      />
      <InitialMcqBulkUpload tests={(tests || []).map((test) => ({ id: test.id, type: test.type }))} />
      <InitialMcqBulkDelete tests={(tests || []).map((test) => ({ id: test.id, type: test.type }))} questions={(questions || []).map((question) => ({ id: question.id, test_id: question.test_id, question_text: question.question_text }))} />
      <AdminNonVerbalManager questions={nonVerbalQuestionsWithUrls as never[]} />
    </main>
  );
}
