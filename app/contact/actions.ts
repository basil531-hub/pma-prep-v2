"use server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
const clean=(value:FormDataEntryValue|null,max:number)=>String(value||"").trim().slice(0,max);
export async function submitContact(formData:FormData){
  if(clean(formData.get("website"),100)) redirect("/contact?sent=1");
  const name=clean(formData.get("name"),100),email=clean(formData.get("email"),180).toLowerCase(),subject=clean(formData.get("subject"),160),message=clean(formData.get("message"),3000);
  if(name.length<2||!/^\S+@\S+\.\S+$/.test(email)||subject.length<3||message.length<20) redirect("/contact?error=invalid");
  const {error}=await createAdminClient().from("contact_enquiries").insert({name,email,subject,message});
  if(error) redirect("/contact?error=unavailable");
  redirect("/contact?sent=1");
}
