import { Suspense } from "react";
import { LoginForm } from "@/components/auth";

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {params.message && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md text-center">
            {params.message}
          </div>
        )}
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm callbackUrl={params.callbackUrl} />
        </Suspense>
      </div>
    </div>
  );
}
