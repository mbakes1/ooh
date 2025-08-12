"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "./image-upload";
import { LocationInput } from "./location-input";
import { SpecificationsInput } from "./specifications-input";
import { PricingInput } from "./pricing-input";
import { AvailabilityCalendar } from "./availability-calendar";
import {
  billboardListingSchema,
  type BillboardListingInput,
} from "@/lib/validations/billboard";
import { TrafficLevel } from "@prisma/client";
import { cn } from "@/lib/utils";

interface BillboardListingFormProps {
  initialData?: Partial<BillboardListingInput>;
  onSubmit: (data: BillboardListingInput) => Promise<void>;
  isEditing?: boolean;
  className?: string;
}

export function BillboardListingForm({
  initialData,
  onSubmit,
  isEditing = false,
  className,
}: BillboardListingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const form = useForm<BillboardListingInput>({
    resolver: zodResolver(billboardListingSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      province: initialData?.province || "",
      postalCode: initialData?.postalCode || "",
      width: initialData?.width || 0,
      height: initialData?.height || 0,
      resolution: initialData?.resolution || "",
      brightness: initialData?.brightness || undefined,
      viewingDistance: initialData?.viewingDistance || undefined,
      trafficLevel: initialData?.trafficLevel || undefined,
      basePrice: initialData?.basePrice || 0,
      images: initialData?.images || [],
    },
  });

  const handleSubmit = async (data: BillboardListingInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Basic Information",
      description: "Title and description",
    },
    {
      number: 2,
      title: "Location",
      description: "Address and location details",
    },
    { number: 3, title: "Specifications", description: "Technical details" },
    { number: 4, title: "Pricing", description: "Set your rates" },
    {
      number: 5,
      title: "Images & Availability",
      description: "Photos and schedule",
    },
  ];

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium",
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-muted-foreground"
                )}
              >
                {step.number}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    currentStep >= step.number
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-4",
                    currentStep > step.number ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billboard Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Prime Highway Billboard - N1 Cape Town"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Describe your billboard location, visibility, and any special features..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <Card className="p-6">
              <LocationInput
                address={form.watch("address")}
                city={form.watch("city")}
                province={form.watch("province")}
                postalCode={form.watch("postalCode") || ""}
                onAddressChange={(value) => form.setValue("address", value)}
                onCityChange={(value) => form.setValue("city", value)}
                onProvinceChange={(value) => form.setValue("province", value)}
                onPostalCodeChange={(value) =>
                  form.setValue("postalCode", value)
                }
              />
            </Card>
          )}

          {/* Step 3: Specifications */}
          {currentStep === 3 && (
            <Card className="p-6">
              <SpecificationsInput
                width={form.watch("width")}
                height={form.watch("height")}
                resolution={form.watch("resolution")}
                brightness={form.watch("brightness") || 0}
                viewingDistance={form.watch("viewingDistance") || 0}
                trafficLevel={form.watch("trafficLevel") || ""}
                onWidthChange={(value) => form.setValue("width", value)}
                onHeightChange={(value) => form.setValue("height", value)}
                onResolutionChange={(value) =>
                  form.setValue("resolution", value)
                }
                onBrightnessChange={(value) =>
                  form.setValue("brightness", value)
                }
                onViewingDistanceChange={(value) =>
                  form.setValue("viewingDistance", value)
                }
                onTrafficLevelChange={(value) =>
                  form.setValue(
                    "trafficLevel",
                    value as TrafficLevel | undefined
                  )
                }
              />
            </Card>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <Card className="p-6">
              <PricingInput
                basePrice={form.watch("basePrice")}
                onBasePriceChange={(value) => form.setValue("basePrice", value)}
              />
            </Card>
          )}

          {/* Step 5: Images & Availability */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Billboard Images</h3>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          images={field.value}
                          onImagesChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="p-6">
                <AvailabilityCalendar />
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Update Listing" : "Create Listing"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
