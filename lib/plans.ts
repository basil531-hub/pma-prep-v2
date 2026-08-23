export const accessPlans = {
  initial: { code: "initial", name: "PMA Initial Pass", price: 1499, originalPrice: 1999, days: 45, scopes: ["initial"] },
  issb: { code: "issb", name: "ISSB Pass", price: 2999, originalPrice: 3999, days: 60, scopes: ["issb"] },
  complete: { code: "complete", name: "Complete Pass", price: 3999, originalPrice: 5499, days: 90, scopes: ["initial", "issb"] },
} as const;

export type PlanCode = keyof typeof accessPlans;
export type AccessScope = "initial" | "issb";

export function isPlanCode(value: string): value is PlanCode { return value in accessPlans; }
export function planDiscount(plan: (typeof accessPlans)[PlanCode]) { return Math.round((1 - plan.price / plan.originalPrice) * 100); }
