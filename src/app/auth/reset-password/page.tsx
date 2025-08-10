import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PasswordResetConfirmForm } from "@/components/auth";

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  if (!params.token) {
    redirect("/auth/forgot-password");
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <PasswordResetConfirmForm token={params.token} />
        </Suspense>
      </div>
    </div>
  );
}
