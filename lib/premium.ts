export type PremiumMonths = 1 | 3 | 6 | 12;

export type PremiumPlan = {
  months: PremiumMonths;
  name: string;
  amount: number;
};

export const PREMIUM_PLANS: PremiumPlan[] = [
  { months: 1, name: "1 сар", amount: 5000 },
  { months: 3, name: "3 сар", amount: 13000 },
  { months: 6, name: "6 сар", amount: 24000 },
  { months: 12, name: "1 жил", amount: 44000 },
];

export function isValidPremiumMonths(months: number): months is PremiumMonths {
  return [1, 3, 6, 12].includes(months);
}

export function getPremiumPlan(months: number) {
  return PREMIUM_PLANS.find((plan) => plan.months === months) || null;
}

export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function isPremiumActive(user: {
  isPremium?: boolean | null;
  premiumExpiresAt?: Date | string | null;
}) {
  if (!user.isPremium || !user.premiumExpiresAt) return false;

  const expiresAt = new Date(user.premiumExpiresAt);
  return expiresAt.getTime() > Date.now();
}