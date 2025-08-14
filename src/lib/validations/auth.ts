import { z } from "zod";
import { UserRole } from "@prisma/client";
import { validateSouthAfricanPhoneNumber } from "@/lib/localization/south-africa";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must be less than 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.nativeEnum(UserRole).refine((val) => val !== undefined, {
      message: "Please select your role",
    }),
    businessName: z.string().optional(),
    contactNumber: z
      .string()
      .min(1, "Contact number is required")
      .refine(
        (phone) => validateSouthAfricanPhoneNumber(phone),
        "Please enter a valid South African phone number (e.g., +27 82 123 4567 or 082 123 4567)"
      ),
    location: z
      .string()
      .min(1, "Location is required")
      .min(2, "Location must be at least 2 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === UserRole.OWNER && !data.businessName) {
        return false;
      }
      return true;
    },
    {
      message: "Business name is required for billboard owners",
      path: ["businessName"],
    }
  );

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be less than 100 characters"),
  businessName: z.string().optional(),
  contactNumber: z
    .string()
    .min(1, "Contact number is required")
    .refine(
      (phone) => validateSouthAfricanPhoneNumber(phone),
      "Please enter a valid South African phone number (e.g., +27 82 123 4567 or 082 123 4567)"
    ),
  location: z
    .string()
    .min(1, "Location is required")
    .min(2, "Location must be at least 2 characters long"),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

// Enhanced register schema with better conditional validation
export const enhancedRegisterSchema = registerSchema;

// Real-time validation helpers for auth fields
export const authFieldValidators = {
  email: async (value: string) => {
    if (!value) return { isValid: false, message: "Email is required" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    // Check if email is already taken (would need API call in real implementation)
    return { isValid: true, message: "Email format is valid" };
  },

  password: (value: string) => {
    if (!value) return { isValid: false, message: "Password is required" };
    if (value.length < 8)
      return {
        isValid: false,
        message: "Password must be at least 8 characters",
      };

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[@$!%*?&]/.test(value);

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
      Boolean
    ).length;

    if (strength < 4) {
      return {
        isValid: false,
        message:
          "Password must contain uppercase, lowercase, number, and special character",
      };
    }

    if (strength === 4 && value.length >= 12) {
      return { isValid: true, message: "Strong password!" };
    } else if (strength === 4) {
      return { isValid: true, message: "Good password" };
    }

    return { isValid: false, message: "Password requirements not met" };
  },

  confirmPassword: (password: string, confirmPassword: string) => {
    if (!confirmPassword)
      return { isValid: false, message: "Please confirm your password" };
    if (password !== confirmPassword)
      return { isValid: false, message: "Passwords do not match" };
    return { isValid: true, message: "Passwords match!" };
  },

  phoneNumber: (value: string) => {
    if (!value)
      return { isValid: false, message: "Contact number is required" };
    if (!validateSouthAfricanPhoneNumber(value)) {
      return {
        isValid: false,
        message:
          "Please enter a valid South African phone number (e.g., +27 82 123 4567)",
      };
    }
    return { isValid: true, message: "Valid South African phone number" };
  },

  businessName: (value: string, role: UserRole) => {
    if (role !== UserRole.OWNER) return { isValid: true, message: "" };
    if (!value)
      return {
        isValid: false,
        message: "Business name is required for billboard owners",
      };
    if (value.length < 2)
      return {
        isValid: false,
        message: "Business name must be at least 2 characters",
      };
    if (!/^[a-zA-Z0-9\s&.-]+$/.test(value)) {
      return {
        isValid: false,
        message: "Business name contains invalid characters",
      };
    }
    return { isValid: true, message: "Business name looks good!" };
  },
};

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EnhancedRegisterInput = z.infer<typeof enhancedRegisterSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
