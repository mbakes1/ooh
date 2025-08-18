"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/form";
import { ErrorAlert } from "@/components/ui/error-alert";
import { RealTimeForm } from "@/components/ui/real-time-form";
import { EnhancedFormField } from "@/components/ui/enhanced-form-field";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuthNotifications } from "@/hooks/use-notifications";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Welcome Back");
  const router = useRouter();
  const authNotifications = useAuthNotifications();

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    };
    setGreeting(getGreeting());
  }, []);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = "Invalid email or password. Please try again.";
        setError(errorMessage);
        authNotifications.loginError(errorMessage);
      } else {
        authNotifications.loginSuccess();
        router.push(callbackUrl || "/");
        router.refresh();
      }
    } catch {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      authNotifications.loginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {greeting}
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RealTimeForm form={form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <EnhancedFormField
                  label="Email Address"
                  required
                  successMessage="Valid email format"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                </EnhancedFormField>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <EnhancedFormField
                  label="Password"
                  required
                  successMessage="Password entered"
                >
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </EnhancedFormField>
              )}
            />

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:text-primary/80"
              >
                Forgot your password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/auth/register"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign up
              </Link>
            </div>
          </form>
        </RealTimeForm>
      </CardContent>
    </Card>
  );
}
