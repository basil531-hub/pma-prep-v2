import { redirect } from "next/navigation";
import Link from "next/link";
import { Brain, ClipboardCheck, ImagePlus, Languages, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { bulkUploadOpi, bulkUploadSct, bulkUploadWat, createOpiItem, createSctItem, createSelfItem, createTatItem, createWatItem } from "./actions";
import { PsychologyManager, type Item } from "./psychology-manager";
import { FileDropzone } from "@/components/file-dropzone";
import { UploadFormatGuide } from "@/components/upload-format-guide";
import { MechanicalManager } from "./mechanical-manager";
import type React from "react";

export const dynamic = "force-dynamic";

export default async function PsychologyAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("users").select("role").eq("id", user.id).single() : { data: null };
  if (!user || (profile?.role !== "admin" && !isAdminEmail(user.email))) redirect("/dashboard");

  const admin = createAdminClient();
  const [{ data: wat }, { data: sct }, { data: tat }, { data: selfDescription }, { data: mechanical }, { data: opi }] = await Promise.all([
    admin.from("wat").select("id,word,is_active").order("sort_order").order("created_at", { ascending: false }),
    admin.from("sct").select("id,sentence,language,is_active").order("sort_order").order("created_at", { ascending: false }),
    admin.from("tat").select("id,image_path,is_active").order("sort_order").order("created_at", { ascending: false }),
    admin.from("self_description").select("id,prompt,is_active").order("sort_order").order("created_at", { ascending: false }),
    admin.from("mechanical_mcqs").select("id,image_url,correct_answer").order("created_at", { ascending: false }),
    admin.from("tests").select("id,content").eq("type", "Personality").order("created_at", { ascending: false }),
  ]);
  const mechanicalWithUrls = await Promise.all((mechanical || []).map(async (item) => ({ ...item, image_url: (await admin.storage.from("mechanical-mcqs").createSignedUrl(item.image_url, 3600)).data?.signedUrl || "" })));
  const items: Item[] = [
    ...(wat || []).map((item) => ({ id: item.id, value: item.word, active: item.is_active, kind: "WAT" as const })),
    ...(sct || []).map((item) => ({ id: item.id, value: item.sentence, language: item.language, active: item.is_active, kind: "SCT" as const })),
    ...(tat || []).map((item) => ({ id: item.id, value: `Picture story: ${item.image_path.split("/").pop() || "uploaded image"}`, active: item.is_active, kind: "TAT" as const })),
    ...(selfDescription || []).map((item) => ({ id: item.id, value: item.prompt, active: item.is_active, kind: "SelfDescription" as const })),
  ];

  return <main className="mx-auto max-w-7xl px-5 py-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Content studio</p><h1 className="mt-2 text-3xl font-black">Psychological preparation</h1><p className="mt-2 max-w-2xl text-slate-500">Build the WAT, SCT, TAT and self-description library candidates use for psychological preparation.</p></div><Button asChild variant="outline"><Link href="/admin">Back to admin</Link></Button></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Stat label="OPI MCQs" value={opi?.length || 0} icon={ClipboardCheck} /><Stat label="WAT words" value={wat?.length || 0} icon={Quote} /><Stat label="SCT sentences" value={sct?.length || 0} icon={Languages} /><Stat label="TAT pictures" value={tat?.length || 0} icon={ImagePlus} /><Stat label="Self prompts" value={selfDescription?.length || 0} icon={Brain} /></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <FormCard icon={<ClipboardCheck />} title="Officer Personality Inventory (OPI)"><form action={createOpiItem} className="space-y-3"><label className="block text-sm font-semibold">OPI statement<textarea name="statement" required maxLength={500} rows={3} placeholder="Example: I make friends easily." className="mt-2" /></label><div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><strong>Seven options are added automatically:</strong><br />Strongly Disagree, Mostly Disagree, Slightly Disagree, Neutral, Slightly Agree, Mostly Agree, Strongly Agree.</div><Button>Publish OPI MCQ</Button></form><div className="my-5 border-t" /><form action={bulkUploadOpi} encType="multipart/form-data" className="space-y-3"><p className="text-sm font-semibold">Bulk upload OPI statements</p><UploadFormatGuide title="OPI" columns={["statement"]} example={["I make friends easily."]} /><FileDropzone name="file" accept=".csv,.xlsx,.xls" label="Drop your OPI file here" hint="CSV or Excel files up to 5 MB" required /><Button variant="outline">Upload OPI statements</Button></form></FormCard>
      <FormCard icon={<Quote />} title="Word Association (WAT)"><form action={createWatItem} className="space-y-3"><input name="word" required placeholder="Word, e.g. Responsibility" /><Button>Publish word</Button></form><div className="my-5 border-t" /><form action={bulkUploadWat} encType="multipart/form-data" className="space-y-3"><p className="text-sm font-semibold">Bulk upload WAT words</p><UploadFormatGuide title="WAT" columns={["word"]} example={["Responsibility"]} /><FileDropzone name="file" accept=".csv,.xlsx,.xls" label="Drop your word list here" hint="CSV or Excel files up to 5 MB" required /><Button variant="outline">Upload word list</Button></form></FormCard>
      <FormCard icon={<Languages />} title="Sentence Completion (SCT)"><form action={createSctItem} className="space-y-3"><textarea name="sentence" required rows={3} placeholder="Incomplete sentence" /><select name="language" defaultValue="en"><option value="en">English</option><option value="ur">Urdu</option></select><Button>Publish sentence</Button></form><div className="my-5 border-t" /><form action={bulkUploadSct} encType="multipart/form-data" className="space-y-3"><p className="text-sm font-semibold">Bulk upload SCT sentences</p><UploadFormatGuide title="SCT" columns={["sentence", "language"]} example={["I feel confident when", "en"]} /><FileDropzone name="file" accept=".csv,.xlsx,.xls" label="Drop your SCT file here" hint="CSV or Excel files up to 5 MB" required /><Button variant="outline">Upload SCT sentences</Button></form></FormCard>
      <FormCard icon={<ImagePlus />} title="Thematic Apperception (TAT)"><form action={createTatItem} encType="multipart/form-data" className="space-y-3"><FileDropzone name="image" accept="image/png,image/jpeg,image/webp" label="Drop TAT picture here" hint="PNG, JPG, or WEBP up to 5 MB" required /><Button>Publish picture</Button></form></FormCard>
      <FormCard icon={<Brain />} title="Self-description"><form action={createSelfItem} className="space-y-3"><textarea name="prompt" required rows={3} placeholder="Prompt, e.g. My strengths are..." /><Button>Publish prompt</Button></form></FormCard>
    </div>
    <PsychologyManager items={items} />
    <MechanicalManager questions={mechanicalWithUrls} />
  </main>;
}

function FormCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <Card><CardHeader><h2 className="flex items-center gap-2 font-bold">{icon}{title}</h2></CardHeader><CardContent>{children}</CardContent></Card>; }
function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Brain }) { return <Card><CardContent className="flex items-center gap-3 pt-5"><div className="rounded-xl bg-green-50 p-3 text-primary"><Icon className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="text-2xl font-black">{value}</p></div></CardContent></Card>; }
