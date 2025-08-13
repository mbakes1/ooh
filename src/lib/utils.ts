import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export South African localization utilities for easy access
export {
  formatZAR,
  formatZARInput,
  parseZAR,
  formatSASTDateTime,
  formatSASTDate,
  formatSASTTime,
  getCurrentSASTTime,
  convertToSAST,
  formatSouthAfricanPhoneNumber,
  formatSouthAfricanAddress,
  southAfricanTerminology,
} from "@/lib/localization/south-africa";

// Re-export component type utilities for easy access
export * from "@/lib/utils/component-types";

// Re-export form schemas for easy access
export * from "@/lib/schemas/ui-forms";
