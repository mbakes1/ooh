import { z } from "zod";
import { TrafficLevel } from "@prisma/client";
import {
  southAfricanProvinceNames,
  validateSouthAfricanPostalCode,
} from "@/lib/localization/south-africa";

export const billboardListingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must be less than 100 characters"),

  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),

  // Location fields
  address: z
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters long"),

  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters long"),

  province: z
    .string()
    .min(1, "Province is required")
    .refine(
      (province) => southAfricanProvinceNames.includes(province as any),
      "Please select a valid South African province"
    ),

  postalCode: z
    .string()
    .optional()
    .refine(
      (code) => !code || validateSouthAfricanPostalCode(code),
      "Please enter a valid South African postal code (4 digits)"
    ),

  // Specifications
  width: z
    .number()
    .min(1, "Width must be at least 1 meter")
    .max(50, "Width cannot exceed 50 meters"),

  height: z
    .number()
    .min(1, "Height must be at least 1 meter")
    .max(20, "Height cannot exceed 20 meters"),

  resolution: z
    .string()
    .min(1, "Resolution is required")
    .regex(/^\d+x\d+$/, "Resolution must be in format 1920x1080"),

  brightness: z
    .number()
    .min(1000, "Brightness must be at least 1000 nits")
    .max(10000, "Brightness cannot exceed 10000 nits")
    .optional()
    .or(z.literal(0).transform(() => undefined)),

  viewingDistance: z
    .number()
    .min(1, "Viewing distance must be at least 1 meter")
    .max(1000, "Viewing distance cannot exceed 1000 meters")
    .optional()
    .or(z.literal(0).transform(() => undefined)),

  trafficLevel: z.nativeEnum(TrafficLevel).optional(),

  // Pricing
  basePrice: z
    .number()
    .min(1, "Base price must be at least R1")
    .max(1000000, "Base price cannot exceed R1,000,000"),

  // Images (will be handled separately in the form)
  images: z
    .array(z.string().url())
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
});

export const billboardImageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file.type
        ),
      "Only JPEG, PNG, and WebP images are allowed"
    ),
  altText: z
    .string()
    .max(200, "Alt text must be less than 200 characters")
    .optional(),
});

// Re-export from localization for backward compatibility
export { southAfricanProvinceNames as southAfricanProvinces } from "@/lib/localization/south-africa";

// Common resolutions for digital billboards
export const commonResolutions = [
  "1920x1080",
  "2560x1440",
  "3840x2160",
  "1366x768",
  "1600x900",
  "2048x1152",
] as const;

export type BillboardListingInput = z.infer<typeof billboardListingSchema>;
export type BillboardImageUploadInput = z.infer<
  typeof billboardImageUploadSchema
>;
