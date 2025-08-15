import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // Redirect authenticated users to their appropriate dashboard
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else if (session.user.role === "OWNER") {
      redirect("/dashboard");
    } else {
      redirect("/search");
    }
  }

  // Redirect unauthenticated users to login
  redirect("/auth/login");
}
