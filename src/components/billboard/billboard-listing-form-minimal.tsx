"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { ImageUpload } from "./image-upload";
import { LocationInput } from "./location-input";
import { SpecificationsInput } from "./specifications-input";
import { PricingInput } from "./pricing-input";
import { RealTimeForm } from "@/components/ui/real-time-form";
import {
  enhancedBillboardListingSchema,
  type BillboardListingInput,
} from "@/lib/validations/billboard";
import { TrafficLevel } from "@prisma/client";
import { cn } from "@/lib/utils";

interface BillboardListingFormMinimalProps {
  initialData?: Partial<BillboardListingInput>;
  onSubmit: (data: BillboardListingInput) => Promise<void>;
  isEditing?: boolean;
  className?: string;
}

export function BillboardListingFormMinimal({
  initialData,
  onSubmit,
  isEditing = false,
  className,
}: BillboardListingFormMinimalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState("basic");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const form = useForm<BillboardListingInput>({
    resolver: zodResolver(enhancedBillboardListingSchema),
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
    mode: "onChange",
  });

  const steps = [
    { id: "basic", title: "Basic Info", description: "Title & description" },
    { id: "location", title: "Location", description: "Address details" },
    { id: "specs", title: "Specifications", description: "Technical details" },
    { id: "pricing", title: "Pricing", description: "Set your rates" },
    { id: "media", title: "Media", description: "Photos & final review" },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

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

  const validateCurrentStep = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fields);

    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
    } else {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentStep);
        return newSet;
      });
    }

    return isValid;
  };

  const getFieldsForStep = (
    stepId: string
  ): (keyof BillboardListingInput)[] => {
    switch (stepId) {
      case "basic":
        return ["title", "description"];
      case "location":
        return ["address", "city", "province", "postalCode"];
      case "specs":
        return [
          "width",
          "height",
          "resolution",
          "brightness",
          "viewingDistance",
          "trafficLevel",
        ];
      case "pricing":
        return ["basePrice"];
      case "media":
        return ["images"];
      default:
        return [];
    }
  };

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const goToStep = async (stepId: string) => {
    await validateCurrentStep();
    setCurrentStep(stepId);
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className={cn("max-w-4xl mx-auto space-y-8", className)}>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Billboard Listing" : "Create Billboard Listing"}
        </h1>
        <p className="text-muted-foreground">
          Follow the steps below to {isEditing ? "update" : "create"} your
          billboard listing
        </p>
      </div>

      <Stepper
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
        className="mb-8"
      />

      <RealTimeForm form={form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>
                {steps.find((s) => s.id === currentStep)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === "basic" && (
                <>
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
                        <FormDescription>
                          Create a descriptive title that highlights your
                          billboard&apos;s location
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your billboard location, visibility, and any special features..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about location, visibility, and unique
                          selling points
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === "location" && (
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
              )}

              {currentStep === "specs" && (
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
              )}

              {currentStep === "pricing" && (
                <PricingInput
                  basePrice={form.watch("basePrice")}
                  onBasePriceChange={(value) =>
                    form.setValue("basePrice", value)
                  }
                />
              )}

              {currentStep === "media" && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billboard Images *</FormLabel>
                        <FormControl>
                          <ImageUpload
                            images={field.value}
                            onImagesChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload high-quality photos of your billboard from
                          different angles
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={isFirstStep}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </div>

            {isLastStep ? (
              <Button
                type="submit"
                disabled={isSubmitting || completedSteps.size < steps.length}
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isEditing ? "Update Listing" : "Create Listing"}
              </Button>
            ) : (
              <Button type="button" onClick={goToNextStep}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </RealTimeForm>
    </div>
  );
}
