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

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
