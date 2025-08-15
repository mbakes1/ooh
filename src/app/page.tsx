import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // Redirect authenticated users to their appropriate landing page
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else if (session.user.role === "OWNER") {
      redirect("/dashboard/billboards"); // Owners go directly to their billboard listings
    } else {
      redirect("/search"); // Advertisers go to explore billboards
    }
  }

  // Redirect unauthenticated users to login
  redirect("/auth/login");
}
