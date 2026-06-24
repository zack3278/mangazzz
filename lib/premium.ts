import { prisma } from "@/lib/prisma";

export type PremiumMonths = 1 | 2 | 3 | 6 | 12;

export type PremiumPlan = {
  months: PremiumMonths;
  name: string;
  amount: number;
};

export const PREMIUM_PLANS: PremiumPlan[] = [
  { months: 1, name: "1 сар", amount: 5000 },
  { months: 2, name: "2 сар", amount: 9000 },
  { months: 3, name: "3 сар", amount: 13000 },
  { months: 6, name: "6 сар", amount: 22000 },
  { months: 12, name: "12 сар", amount: 35000 },
];

export function isValidPremiumMonths(months: number): months is PremiumMonths {
  return [1, 2, 3, 6, 12].includes(months);
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

export async function activatePremiumByOrderId(orderId: number) {
  const order = await prisma.premiumOrder.findUnique({
    where: {
      id: orderId,
    },
    include: {
      user: true,
    },
  });

  if (!order) {
    throw new Error("Premium order олдсонгүй");
  }

  if (order.status === "PAID") {
    return order;
  }

  const now = new Date();

  const startDate =
    order.user.premiumExpiresAt &&
    new Date(order.user.premiumExpiresAt).getTime() > now.getTime()
      ? new Date(order.user.premiumExpiresAt)
      : now;

  const premiumExpiresAt = addMonths(startDate, order.months);

  const [, updatedOrder] = await prisma.$transaction([
    prisma.user.update({
      where: {
        id: order.userId,
      },
      data: {
        isPremium: true,
        premiumExpiresAt,
      },
    }),

    prisma.premiumOrder.update({
      where: {
        id: order.id,
      },
      data: {
        status: "PAID",
        paidAt: now,
        wireStatus: "succeeded",
      },
    }),
  ]);

  return updatedOrder;
}