import "server-only";

import { createClient } from "@/lib/supabase/server";
import { normalizePlanKey, type PlanKey } from "@/lib/subscriptions/plans";

interface SubscriptionRow {
  plan_type: string | null;
  status: string | null;
}

export async function getCurrentPlan(): Promise<PlanKey> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    return "free";
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan_type, status")
    .eq("user_id", userId)
    .maybeSingle<SubscriptionRow>();

  if (error || data?.status !== "active") {
    return "free";
  }

  return normalizePlanKey(data.plan_type);
}
