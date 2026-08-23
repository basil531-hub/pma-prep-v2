"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";
export async function updateEnquiry(id:string,formData:FormData){const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)throw new Error("Unauthorized");const {data:p}=await s.from("users").select("role").eq("id",user.id).maybeSingle();if(p?.role!=="admin"&&!isAdminEmail(user.email))throw new Error("Unauthorized");const status=String(formData.get("status")||"");if(!["new","in_progress","resolved","spam"].includes(status))throw new Error("Invalid status");const admin_note=String(formData.get("admin_note")||"").trim().slice(0,1000);const {error}=await createAdminClient().from("contact_enquiries").update({status,admin_note,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw error;revalidatePath("/admin/enquiries")}
