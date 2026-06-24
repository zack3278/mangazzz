import { prisma } from "@/lib/prisma";

export function levelFromXp(xp: number) {
  if (xp < 0) return 1;
  return Math.floor(xp / 250) + 1;
}

export function nextLevelXp(level: number) {
  return level * 250;
}

export function premiumXpReward(months: number) {
  if (months >= 12) return 2500;
  if (months >= 6) return 1200;
  if (months >= 3) return 550;
  if (months >= 2) return 300;
  return 150;
}

export function rewardByLevel(level: number) {
  if (level >= 20) return "Legend badge + 7 хоног premium bonus";
  if (level >= 15) return "Diamond badge";
  if (level >= 10) return "Gold badge";
  if (level >= 5) return "Silver badge";
  return "Level 5 хүрээд Silver badge авна";
}

export async function grantPremiumXp(userId: number, months: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      xp: true,
    },
  });

  if (!user) return null;

  const gainedXp = premiumXpReward(months);
  const newXp = user.xp + gainedXp;
  const newLevel = levelFromXp(newXp);

  return prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
    },
  });
}