import { redirect } from "next/navigation";
import { Brain, FileText, Gamepad2, ListChecks, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const contentTypes = [
  { title: "Academic MCQs", description: "Math, English, GK and psychology question bank with CSV/XLSX bulk upload.", href: "/admin/mcqs", icon: ListChecks, tone: "bg-green-50 text-green-700" },
  { title: "WAT, SCT, TAT and self-description", description: "Timed psychological projector content, including words, sentences and images.", href: "/admin/psychology", icon: Brain, tone: "bg-violet-50 text-violet-700" },
  { title: "GTO scenarios", description: "Group planning, command tasks, group tasks and individual obstacles.", href: "/admin/gto", icon: Gamepad2, tone: "bg-amber-50 text-amber-700" },
  { title: "PDF study notes", description: "Secure bilingual notes with free or premium access control.", href: "/admin/notes", icon: FileText, tone: "bg-sky-50 text-sky-700" },
  { title: "Practice tests", description: "Generic MCQ, Intelligence, Personality, WAT and Interview JSON tests.", href: "/admin#settings", icon: Quote, tone: "bg-rose-50 text-rose-700" },
];

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  redirect("/admin#content-library");
}
