import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import type { Role } from "@/types";

// Not logged in → /login, wrong role → /
export async function requireUser(role?: Role) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (role && session.user.role !== role) redirect("/");
  return session.user;
}
