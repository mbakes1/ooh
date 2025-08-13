import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for merging Tailwind classes (already exists in utils.ts but ensuring it's available)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Type guard utilities for component props
export const isValidVariant = <T extends string>(
  variant: unknown,
  validVariants: readonly T[]
): variant is T => {
  return typeof variant === "string" && validVariants.includes(variant as T);
};

export const isValidSize = <T extends string>(
  size: unknown,
  validSizes: readonly T[]
): size is T => {
  return typeof size === "string" && validSizes.includes(size as T);
};

// Component prop validation helpers
export const validateComponentProps = <T extends Record<string, any>>(
  props: T,
  requiredProps: (keyof T)[]
): { isValid: boolean; missingProps: string[] } => {
  const missingProps = requiredProps.filter(
    (prop) => !(prop in props) || props[prop] === undefined
  );
  return {
    isValid: missingProps.length === 0,
    missingProps: missingProps as string[],
  };
};

// Default props helpers
export const withDefaults = <
  T extends Record<string, any>,
  D extends Partial<T>,
>(
  props: T,
  defaults: D
): T & D => {
  return { ...defaults, ...props };
};

// Component variant constants for type safety
export const BUTTON_VARIANTS = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const;

export const BUTTON_SIZES = ["default", "sm", "lg", "icon"] as const;

export const ALERT_VARIANTS = ["default", "destructive"] as const;

export const BADGE_VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "outline",
] as const;

export const CARD_VARIANTS = ["default", "outline", "elevated"] as const;

// Type-safe variant creators
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type AlertVariant = (typeof ALERT_VARIANTS)[number];
export type BadgeVariant = (typeof BADGE_VARIANTS)[number];
export type CardVariant = (typeof CARD_VARIANTS)[number];

// Component state helpers
export const createLoadingState = (
  isLoading = false,
  loadingText?: string
) => ({
  isLoading,
  loadingText,
});

export const createErrorState = (error?: string | Error) => ({
  hasError: !!error,
  error,
});

// Form field helpers
export const createFormField = <T>(
  name: keyof T,
  label?: string,
  options?: {
    placeholder?: string;
    description?: string;
    required?: boolean;
    disabled?: boolean;
  }
) => ({
  name: name as string,
  label,
  ...options,
});

// Responsive value helpers
export const createResponsiveValue = <T>(
  base: T,
  breakpoints?: {
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    "2xl"?: T;
  }
) => ({
  base,
  ...breakpoints,
});

// Animation helpers
export const createAnimationConfig = (
  duration = 200,
  easing = "ease-out",
  delay = 0
) => ({
  duration,
  easing,
  delay,
});

// Data table helpers
export const createTableColumn = <T>(
  id: keyof T,
  header: string,
  options?: {
    accessorKey?: keyof T;
    cell?: (value: T[keyof T], row: T) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
    width?: number | string;
  }
) => ({
  id,
  header,
  ...options,
});

// Navigation helpers
export const createNavigationItem = (
  id: string,
  label: string,
  href: string,
  options?: {
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    children?: any[];
    disabled?: boolean;
  }
) => ({
  id,
  label,
  href,
  ...options,
});

// Theme helpers
export const createThemeConfig = (
  style: "default" | "new-york" = "new-york",
  baseColor: "slate" | "gray" | "zinc" | "neutral" | "stone" = "slate",
  options?: {
    cssVariables?: boolean;
    radius?: number;
  }
) => ({
  style,
  baseColor,
  cssVariables: true,
  radius: 0.5,
  ...options,
});

// Component composition helpers
export const composeComponents = (
  ...components: React.ComponentType<any>[]
): React.ComponentType<any> => {
  return components.reduce((AccumulatedComponent, CurrentComponent) => {
    const ComposedComponent = React.forwardRef<any, any>((props, ref) => {
      return React.createElement(
        AccumulatedComponent,
        {},
        React.createElement(CurrentComponent, { ...props, ref })
      );
    });
    ComposedComponent.displayName = `Composed(${CurrentComponent.displayName || CurrentComponent.name})`;
    return ComposedComponent;
  });
};

// Props extraction helpers
export const extractDataProps = (props: Record<string, any>) => {
  const dataProps: Record<string, any> = {};
  const otherProps: Record<string, any> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("data-") || key.startsWith("aria-")) {
      dataProps[key] = value;
    } else {
      otherProps[key] = value;
    }
  });

  return { dataProps, otherProps };
};
