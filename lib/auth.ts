import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

type JwtPayload = {
  userId?: number;
  id?: number;
  email?: string;
  role?: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";

function getUserIdFromToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const userId = Number(decoded.userId || decoded.id);

    if (!userId) return null;

    return userId;
  } catch {
    return null;
  }
}

export async function auth() {
  const cookieStore = await cookies();

  /**
   * Чиний login route ямар нэртэй cookie хадгалж байгаагаас
   * шалтгаалаад эдгээрээс аль нэг нь таарна.
   */
  const token =
    cookieStore.get("token")?.value ||
    cookieStore.get("auth-token")?.value ||
    cookieStore.get("authToken")?.value ||
    cookieStore.get("session")?.value ||
    cookieStore.get("mangazet_token")?.value;

  if (!token) {
    return null;
  }

  const userId = getUserIdFromToken(token);

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isPremium: true,
      premiumExpiresAt: true,
      profileImage: true,
      avatarPreset: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    user: {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      profileImage: user.profileImage,
      avatarPreset: user.avatarPreset,
    },
  };
}

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
  });

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function requireEditorOrAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  if (user.role !== "EDITOR" && user.role !== "ADMIN") {
    return null;
  }

  return user;
}