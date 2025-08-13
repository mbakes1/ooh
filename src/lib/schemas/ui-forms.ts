import { z } from "zod";

// Base form validation schemas for common UI patterns

// Search form schema
export const searchFormSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long"),
  filters: z.record(z.string(), z.any()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;

// Filter form schema for data tables
export const filterFormSchema = z.object({
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  status: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  priceRange: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    })
    .optional(),
});

export type FilterFormData = z.infer<typeof filterFormSchema>;

// Settings form schema
export const settingsFormSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  privacy: z.object({
    profileVisible: z.boolean().default(true),
    showEmail: z.boolean().default(false),
    showPhone: z.boolean().default(false),
  }),
  preferences: z.object({
    language: z.string().default("en"),
    timezone: z.string().default("UTC"),
    currency: z.string().default("USD"),
  }),
});

export type SettingsFormData = z.infer<typeof settingsFormSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject too long"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message too long"),
  category: z.enum(["general", "support", "billing", "technical"]).optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Feedback form schema
export const feedbackFormSchema = z.object({
  rating: z
    .number()
    .min(1, "Rating is required")
    .max(5, "Rating must be between 1 and 5"),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description too long"),
  category: z.enum(["bug", "feature", "improvement", "other"]),
  anonymous: z.boolean().default(false),
});

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

// Profile update form schema
export const profileUpdateFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio too long").optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  location: z.string().max(100, "Location too long").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateFormSchema>;

// Data table configuration schema
export const dataTableConfigSchema = z.object({
  pageSize: z.number().min(5).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  filters: z.record(z.string(), z.any()).default({}),
  selectedColumns: z.array(z.string()).optional(),
});

export type DataTableConfigData = z.infer<typeof dataTableConfigSchema>;

// Theme configuration schema
export const themeConfigSchema = z.object({
  style: z.enum(["default", "new-york"]).default("new-york"),
  baseColor: z
    .enum(["slate", "gray", "zinc", "neutral", "stone"])
    .default("slate"),
  radius: z.number().min(0).max(1).default(0.5),
  cssVariables: z.boolean().default(true),
});

export type ThemeConfigData = z.infer<typeof themeConfigSchema>;

// Form field validation helpers
export const createRequiredStringField = (
  fieldName: string,
  minLength = 1,
  maxLength = 255
) =>
  z
    .string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`);

export const createOptionalStringField = (maxLength = 255) =>
  z
    .string()
    .max(maxLength, `Field must be less than ${maxLength} characters`)
    .optional();

export const createEmailField = () => z.string().email("Invalid email address");

export const createPhoneField = () =>
  z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format");

export const createUrlField = () =>
  z.string().url("Invalid URL format").optional().or(z.literal(""));

export const createNumberRangeField = (
  min = 0,
  max = Number.MAX_SAFE_INTEGER
) =>
  z
    .number()
    .min(min, `Value must be at least ${min}`)
    .max(max, `Value must be at most ${max}`);

export const createDateRangeField = () =>
  z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((data) => data.from <= data.to, {
      message: "End date must be after start date",
      path: ["to"],
    });

// Form validation utilities
export const validateFormData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: "Validation failed" } };
  }
};

export const createFormDefaultValues = <T>(
  schema: z.ZodSchema<T>
): Partial<T> => {
  try {
    return schema.parse({}) as Partial<T>;
  } catch {
    return {} as Partial<T>;
  }
};
