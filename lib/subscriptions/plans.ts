export const PLAN_KEYS = ["free", "starter", "pro", "premium"] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

export const PLAN_LABELS: Record<PlanKey, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  premium: "Premium",
};

export function isPlanKey(value: unknown): value is PlanKey {
  return (
    typeof value === "string" &&
    PLAN_KEYS.includes(value as PlanKey)
  );
}

export function normalizePlanKey(value: unknown): PlanKey {
  return isPlanKey(value) ? value : "free";
}

export function getPlanLabel(value: unknown): string {
  return PLAN_LABELS[normalizePlanKey(value)];
}
