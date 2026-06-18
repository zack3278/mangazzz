export const PREMIUM_PLANS = [
  {
    months: 1,
    name: "1 сар",
    amount: 5000,
  },
  {
    months: 2,
    name: "2 сар",
    amount: 9000,
  },
  {
    months: 3,
    name: "3 сар",
    amount: 13000,
  },
  {
    months: 6,
    name: "6 сар",
    amount: 22000,
  },
  {
    months: 12,
    name: "12 сар",
    amount: 35000,
  },
] as const;

export function getPremiumPlan(months: number) {
  return PREMIUM_PLANS.find((plan) => plan.months === months);
}

export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function isPremiumActive(user: {
  isPremium: boolean;
  premiumExpiresAt: Date | string | null;
}) {
  if (!user.isPremium) return false;
  if (!user.premiumExpiresAt) return false;

  const expiresAt = new Date(user.premiumExpiresAt);
  return expiresAt > new Date();
}