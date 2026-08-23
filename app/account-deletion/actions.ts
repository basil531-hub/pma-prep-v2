"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function requestAccountDeletion(formData:FormData){const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user?.email)redirect("/login?next=/account-deletion");if(formData.get("confirm")!=="delete")redirect("/account-deletion?error=confirm");const reason=String(formData.get("reason")||"No reason supplied").trim().slice(0,1000);const {error}=await createAdminClient().from("contact_enquiries").insert({name:String(user.user_metadata?.name||user.email.split("@")[0]).slice(0,100),email:user.email,subject:"Account deletion request",message:`Authenticated user ID: ${user.id}\nReason: ${reason}`,status:"new"});if(error)redirect("/account-deletion?error=unavailable");redirect("/account-deletion?requested=1")}
