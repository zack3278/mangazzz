export type PremiumMonths = 1 | 2 | 3 | 6 | 12;

export type PremiumPlan = {
  months: PremiumMonths;
  name: string;
  price: number;
};

export const premiumPlans: PremiumPlan[] = [
  {
    months: 1,
    name: "1 сар",
    price: 5000,
  },
  {
    months: 2,
    name: "2 сар",
    price: 9000,
  },
  {
    months: 3,
    name: "3 сар",
    price: 13000,
  },
  {
    months: 6,
    name: "6 сар",
    price: 22000,
  },
  {
    months: 12,
    name: "12 сар",
    price: 35000,
  },
];

export function isValidPremiumMonths(months: number): months is PremiumMonths {
  return [1, 2, 3, 6, 12].includes(months);
}

export function getPremiumPlan(months: number) {
  return premiumPlans.find((plan) => plan.months === months) || null;
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
  if (!user.isPremium || !user.premiumExpiresAt) {
    return false;
  }

  const expiresAt = new Date(user.premiumExpiresAt);
  const now = new Date();

  return expiresAt.getTime() > now.getTime();
}