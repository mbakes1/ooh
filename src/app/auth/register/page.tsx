import { RegisterForm } from "@/components/auth";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <RegisterForm />
      </div>
    </div>
  );
}
