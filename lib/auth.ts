import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type UserRole = "USER" | "EDITOR" | "ADMIN";

export type JwtUser = {
  id: number;
  email: string;
  role: UserRole;
  isPremium?: boolean;
};

export async function getCurrentUser(): Promise<JwtUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    return jwt.verify(token, process.env.JWT_SECRET!) as JwtUser;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function requireEditor() {
  const user = await getCurrentUser();

  if (!user || user.role !== "EDITOR") {
    return null;
  }

  return user;
}

export async function requireEditorOrAdmin() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "EDITOR" && user.role !== "ADMIN")) {
    return null;
  }

  return user;
}