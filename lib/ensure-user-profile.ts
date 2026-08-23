import type { User } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function ensureUserProfile(user:User){
  if(!user.email)throw new Error("Your account email is missing. Sign out and sign in again.");
  const admin=createAdminClient();
  const name=String(user.user_metadata?.name||user.email.split("@")[0]||"Candidate").trim().slice(0,100)||"Candidate";
  const referral_code=createHash("md5").update(user.id).digest("hex").slice(0,8).toUpperCase();
  let {error}=await admin.from("users").upsert({id:user.id,name,email:user.email,referral_code},{onConflict:"id"});
  if(error&&(error.code==="PGRST204"||error.message.toLowerCase().includes("referral_code"))){
    ({error}=await admin.from("users").upsert({id:user.id,name,email:user.email},{onConflict:"id"}));
  }
  if(error)throw new Error("Your candidate profile could not be prepared. Please sign out, sign in and try again.");
  return admin;
}
