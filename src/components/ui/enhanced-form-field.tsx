"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";

interface EnhancedFormFieldProps extends React.ComponentProps<typeof FormItem> {
  label?: string;
  description?: string;
  required?: boolean;
  showValidationState?: boolean;
  successMessage?: string;
  children: React.ReactNode;
}

export function EnhancedFormField({
  label,
  description,
  required = false,
  showValidationState = true,
  successMessage,
  className,
  children,
  ...props
}: EnhancedFormFieldProps) {
  const { error, isDirty, isTouched } = useFormField();

  const hasError = !!error;
  const isValid = isDirty && isTouched && !hasError;
  const showSuccess = isValid && successMessage;

  return (
    <FormItem className={cn("space-y-2", className)} {...props}>
      {label && (
        <FormLabel className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
          {showValidationState && (
            <div className="ml-auto">
              {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
              {isValid && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </div>
          )}
        </FormLabel>
      )}

      <FormControl>
        <div className="relative">
          {children}
          {showValidationState && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {hasError && <AlertCircle className="h-4 w-4 text-destructive" />}
              {isValid && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            </div>
          )}
        </div>
      </FormControl>

      {description && <FormDescription>{description}</FormDescription>}

      {showSuccess && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          <span>{successMessage}</span>
        </div>
      )}

      <FormMessage />
    </FormItem>
  );
}

interface ConditionalFormFieldProps extends EnhancedFormFieldProps {
  condition: boolean;
  fallback?: React.ReactNode;
}

export function ConditionalFormField({
  condition,
  fallback = null,
  children,
  ...props
}: ConditionalFormFieldProps) {
  if (!condition) {
    return <>{fallback}</>;
  }

  return <EnhancedFormField {...props}>{children}</EnhancedFormField>;
}

interface FormFieldWithDependencyProps extends EnhancedFormFieldProps {
  dependsOn: string;
  dependencyValue: any;
  dependencyCondition: (value: any) => boolean;
  dependencyAction: "show" | "hide" | "require" | "disable";
}

export function FormFieldWithDependency({
  dependsOn,
  dependencyValue,
  dependencyCondition,
  dependencyAction,
  required: baseRequired = false,
  children,
  ...props
}: FormFieldWithDependencyProps) {
  const conditionMet = dependencyCondition(dependencyValue);

  let isVisible = true;
  let isRequired = baseRequired;
  let isDisabled = false;

  switch (dependencyAction) {
    case "show":
      isVisible = conditionMet;
      break;
    case "hide":
      isVisible = !conditionMet;
      break;
    case "require":
      isRequired = conditionMet;
      break;
    case "disable":
      isDisabled = conditionMet;
      break;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <EnhancedFormField required={isRequired} {...props}>
      {React.isValidElement(children)
        ? React.cloneElement(children, { disabled: isDisabled } as any)
        : children}
    </EnhancedFormField>
  );
}
