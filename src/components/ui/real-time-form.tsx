"use client";

import React, { useCallback, useEffect } from "react";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";

interface RealTimeFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onFieldValidation?: (fieldName: FieldPath<T>, isValid: boolean) => void;
  onFormValidation?: (isValid: boolean) => void;
  debounceMs?: number;
  children: React.ReactNode;
}

export function RealTimeForm<T extends FieldValues>({
  form,
  onFieldValidation,
  onFormValidation,
  debounceMs = 300,
  children,
}: RealTimeFormProps<T>) {
  // Debounced validation function
  const debouncedValidateField = useCallback(
    debounce(async (fieldName: FieldPath<T>) => {
      const isValid = await form.trigger(fieldName);
      onFieldValidation?.(fieldName, isValid);
    }, debounceMs),
    [form, onFieldValidation, debounceMs]
  );

  // Watch for form changes and trigger validation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        debouncedValidateField(name as FieldPath<T>);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, debouncedValidateField]);

  // Validate entire form when requested
  useEffect(() => {
    const validateForm = async () => {
      const isValid = await form.trigger();
      onFormValidation?.(isValid);
    };

    // Trigger form validation on form state changes
    if (form.formState.isDirty) {
      validateForm();
    }
  }, [form.formState.isDirty, form, onFormValidation]);

  return <Form {...form}>{children}</Form>;
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
