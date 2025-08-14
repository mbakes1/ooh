import React from "react";
import { FieldPath, FieldValues } from "react-hook-form";

// Enhanced validation utilities for real-time validation
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  touched: Record<string, boolean>;
}

// Form field dependency system
export interface FieldDependency<T extends FieldValues> {
  dependsOn: FieldPath<T>;
  condition: (value: any) => boolean;
  action: "show" | "hide" | "require" | "disable";
}

export function useFieldDependencies<T extends FieldValues>(
  dependencies: Record<FieldPath<T>, FieldDependency<T>[]>
) {
  const getFieldState = (fieldName: FieldPath<T>, formValues: T) => {
    const fieldDependencies = dependencies[fieldName] || [];

    let isVisible = true;
    let isRequired = false;
    let isDisabled = false;

    for (const dependency of fieldDependencies) {
      const dependentValue = formValues[dependency.dependsOn];
      const conditionMet = dependency.condition(dependentValue);

      switch (dependency.action) {
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
    }

    return { isVisible, isRequired, isDisabled };
  };

  return { getFieldState };
}

// Success feedback utilities
export interface SuccessState {
  field?: string;
  message: string;
  duration?: number;
}

export function useSuccessFeedback() {
  const [successStates, setSuccessStates] = React.useState<SuccessState[]>([]);

  const showSuccess = (success: SuccessState) => {
    setSuccessStates((prev) => [...prev, success]);

    if (success.duration !== 0) {
      setTimeout(() => {
        setSuccessStates((prev) => prev.filter((s) => s !== success));
      }, success.duration || 3000);
    }
  };

  const clearSuccess = (field?: string) => {
    if (field) {
      setSuccessStates((prev) => prev.filter((s) => s.field !== field));
    } else {
      setSuccessStates([]);
    }
  };

  return {
    successStates,
    showSuccess,
    clearSuccess,
  };
}

// Enhanced validation utilities for conditional logic
export function createFieldDependency<T extends FieldValues>(
  dependsOn: FieldPath<T>,
  condition: (value: any) => boolean,
  action: "show" | "hide" | "require" | "disable"
): FieldDependency<T> {
  return { dependsOn, condition, action };
}
