import { PasswordResetRequestForm } from "@/components/auth";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <PasswordResetRequestForm />
      </div>
    </div>
  );
}
