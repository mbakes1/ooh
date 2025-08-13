"use client";

import { CheckCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SuccessAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessAlert({
  title = "Success",
  message,
  onDismiss,
  className,
}: SuccessAlertProps) {
  return (
    <Alert
      className={`border-green-200 bg-green-50 text-green-800 ${className}`}
    >
      <CheckCircle className="h-4 w-4 text-green-600" />
      <div className="flex items-start justify-between w-full">
        <div className="flex-1">
          <AlertTitle className="text-green-800">{title}</AlertTitle>
          <AlertDescription className="text-green-700">
            {message}
          </AlertDescription>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-green-600 hover:text-green-700"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}
