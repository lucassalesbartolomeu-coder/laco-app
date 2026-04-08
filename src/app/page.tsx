import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Root() {
  const session = await getServerSession(authOptions);
  if (session) {
    const role = (session.user as { role?: string })?.role;
    redirect(role === "PLANNER" ? "/cerimonialista/dashboard" : "/dashboard");
  }
  redirect("/home");
}
