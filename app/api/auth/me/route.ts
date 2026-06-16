import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tokenUser = await getCurrentUser();

  if (!tokenUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isPremium: true,
    },
  });

  return NextResponse.json({ user });
}