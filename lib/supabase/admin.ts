import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey.includes("your-service-role-key") || serviceRoleKey.includes("YOUR_")) {
    throw new Error("Admin publishing is not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local to your Supabase service_role key.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
