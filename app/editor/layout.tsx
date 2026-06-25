import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "EDITOR" && user.role !== "ADMIN") {
    redirect("/profile");
  }

  return <>{children}</>;
}