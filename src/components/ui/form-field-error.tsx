"use client";

import { AlertCircle } from "lucide-react";

interface FormFieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
}

export function FormFieldError({
  error,
  touched,
  className,
}: FormFieldErrorProps) {
  if (!error || !touched) return null;

  return (
    <div
      className={`flex items-center gap-1 text-sm text-destructive ${className}`}
    >
      <AlertCircle className="h-3 w-3" />
      <span>{error}</span>
    </div>
  );
}
