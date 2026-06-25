import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ProfileEditForm from "./profile-edit-form";

function getInitial(name?: string | null, email?: string | null) {
  const value = name || email || "U";
  return value.charAt(0).toUpperCase();
}

export default async function ProfileEditPage() {
  const tokenUser = await getCurrentUser();

  if (!tokenUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: tokenUser.id,
    },
    select: {
      name: true,
      email: true,
      profileImage: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#08080a] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/profile"
          className="mb-6 inline-flex text-sm font-bold text-zinc-400 hover:text-yellow-300"
        >
          ← Profile руу буцах
        </Link>

        <section className="rounded-[30px] border border-white/10 bg-[#101013] p-6 shadow-2xl">
          <div className="mb-8 flex items-center gap-5">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-yellow-400/40 bg-gradient-to-br from-yellow-400/20 to-zinc-950">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-yellow-300">
                  {getInitial(user.name, user.email)}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black">Profile засах</h1>
              <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
            </div>
          </div>

          <ProfileEditForm
            defaultName={user.name || ""}
            defaultImage={user.profileImage || ""}
          />
        </section>
      </div>
    </main>
  );
}