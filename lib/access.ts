import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccessScope } from "@/lib/plans";

export type AccessSummary = {
  creditBalance: number;
  legacyPremium: boolean;
  scopes: Set<AccessScope>;
};

export async function getAccessSummary(supabase: SupabaseClient, userId: string): Promise<AccessSummary> {
  const [{ data: profile }, { data: entitlements }] = await Promise.all([
    supabase.from("users").select("credit_balance,premium_status").eq("id", userId).maybeSingle(),
    supabase.from("user_entitlements").select("scope").eq("user_id", userId).gt("expires_at", new Date().toISOString()),
  ]);
  return {
    creditBalance: Number(profile?.credit_balance ?? 100),
    legacyPremium: Boolean(profile?.premium_status),
    scopes: new Set((entitlements || []).map(item => item.scope as AccessScope)),
  };
}

export function hasCourseAccess(access: AccessSummary, scope: AccessScope) {
  return access.legacyPremium || access.scopes.has(scope);
}
