import { prisma } from "@/lib/prisma";

export type PremiumPlan = {
  months: number;
  amount: number;
  label: string;
  name: string;
};

type PremiumUserLike = {
  isPremium?: boolean | null;
  premiumExpiresAt?: Date | string | null;
};

export const PREMIUM_PLANS: Record<number, PremiumPlan> = {
  1: {
    months: 1,
    amount: 5000,
    label: "1 сар",
    name: "1 сар",
  },
  2: {
    months: 2,
    amount: 9000,
    label: "2 сар",
    name: "2 сар",
  },
  3: {
    months: 3,
    amount: 13000,
    label: "3 сар",
    name: "3 сар",
  },
  6: {
    months: 6,
    amount: 22000,
    label: "6 сар",
    name: "6 сар",
  },
  12: {
    months: 12,
    amount: 35000,
    label: "12 сар",
    name: "12 сар",
  },
};

export function getPremiumPlan(months: number) {
  return PREMIUM_PLANS[months] || null;
}

export function isValidPremiumMonths(months: number) {
  return Boolean(PREMIUM_PLANS[months]);
}

export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function getPremiumExpireDate(
  currentExpireDate: Date | null | undefined,
  months: number
) {
  const now = new Date();

  const startDate =
    currentExpireDate && currentExpireDate > now ? currentExpireDate : now;

  return addMonths(startDate, months);
}

/**
 * 2 янзаар дуудаж болно:
 *
 * 1) isPremiumActive(user)
 * 2) isPremiumActive(user.isPremium, user.premiumExpiresAt)
 */
export function isPremiumActive(
  userOrIsPremium: PremiumUserLike | boolean | null | undefined,
  premiumExpiresAtArg?: Date | string | null
) {
  let isPremium: boolean | null | undefined;
  let premiumExpiresAt: Date | string | null | undefined;

  if (typeof userOrIsPremium === "object" && userOrIsPremium !== null) {
    isPremium = userOrIsPremium.isPremium;
    premiumExpiresAt = userOrIsPremium.premiumExpiresAt;
  } else {
    isPremium = userOrIsPremium;
    premiumExpiresAt = premiumExpiresAtArg;
  }

  if (!isPremium) return false;
  if (!premiumExpiresAt) return false;

  const expireDate =
    premiumExpiresAt instanceof Date
      ? premiumExpiresAt
      : new Date(premiumExpiresAt);

  if (Number.isNaN(expireDate.getTime())) return false;

  return expireDate > new Date();
}

export function getPremiumStatus(
  userOrIsPremium: PremiumUserLike | boolean | null | undefined,
  premiumExpiresAtArg?: Date | string | null
) {
  const active = isPremiumActive(userOrIsPremium, premiumExpiresAtArg);

  let premiumExpiresAt: Date | string | null | undefined = premiumExpiresAtArg;

  if (typeof userOrIsPremium === "object" && userOrIsPremium !== null) {
    premiumExpiresAt = userOrIsPremium.premiumExpiresAt;
  }

  return {
    active,
    isPremium: active,
    premiumExpiresAt,
  };
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
    return {
      ok: true,
      alreadyPaid: true,
      order,
      premiumExpiresAt: order.user.premiumExpiresAt,
    };
  }

  const premiumExpiresAt = getPremiumExpireDate(
    order.user.premiumExpiresAt,
    order.months
  );

  const result = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.premiumOrder.update({
      where: {
        id: order.id,
      },
      data: {
        status: "PAID",
        wireStatus: "succeeded",
        paidAt: new Date(),
      },
    });

    const updatedUser = await tx.user.update({
      where: {
        id: order.userId,
      },
      data: {
        isPremium: true,
        premiumExpiresAt,
      },
    });

    return {
      updatedOrder,
      updatedUser,
    };
  });

  return {
    ok: true,
    alreadyPaid: false,
    order: result.updatedOrder,
    user: result.updatedUser,
    premiumExpiresAt,
  };
}