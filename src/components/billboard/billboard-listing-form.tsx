"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { AvailabilityCalendar } from "./availability-calendar";
import { RealTimeForm } from "@/components/ui/real-time-form";
import { EnhancedFormField } from "@/components/ui/enhanced-form-field";
import {
  enhancedBillboardListingSchema,
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
  const [activeTab, setActiveTab] = useState("basic");
  const [completedTabs, setCompletedTabs] = useState<Set<string>>(new Set());

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
    mode: "onChange", // Enable real-time validation
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

  // Validate current tab and mark as completed
  const validateAndCompleteTab = async (tabId: string) => {
    const fields = getFieldsForTab(tabId);
    const isValid = await form.trigger(fields);

    if (isValid) {
      setCompletedTabs((prev) => new Set([...prev, tabId]));
    } else {
      // Remove from completed tabs if validation fails
      setCompletedTabs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tabId);
        return newSet;
      });
    }
    return isValid;
  };

  // Real-time validation on field change
  const handleFieldChange = async (
    fieldName: keyof BillboardListingInput,
    value: any
  ) => {
    form.setValue(fieldName, value);

    // Trigger validation for the specific field
    await form.trigger(fieldName);

    // Check if current tab should be marked as completed
    const currentTabFields = getFieldsForTab(activeTab);
    if (currentTabFields.includes(fieldName)) {
      await validateAndCompleteTab(activeTab);
    }
  };

  // Get form fields for each tab for validation
  const getFieldsForTab = (tabId: string): (keyof BillboardListingInput)[] => {
    switch (tabId) {
      case "basic":
        return ["title", "description"];
      case "location":
        return ["address", "city", "province", "postalCode"];
      case "specifications":
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

  const tabs = [
    {
      id: "basic",
      title: "Basic Info",
      description: "Title and description",
      icon: "📝",
    },
    {
      id: "location",
      title: "Location",
      description: "Address details",
      icon: "📍",
    },
    {
      id: "specifications",
      title: "Specifications",
      description: "Technical details",
      icon: "⚙️",
    },
    {
      id: "pricing",
      title: "Pricing",
      description: "Set your rates",
      icon: "💰",
    },
    {
      id: "media",
      title: "Media & Schedule",
      description: "Photos and availability",
      icon: "📸",
    },
  ];

  return (
    <div className={cn("max-w-6xl mx-auto", className)}>
      <RealTimeForm form={form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-5 mb-8">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 text-sm"
                  disabled={isSubmitting}
                >
                  <span className="text-base">{tab.icon}</span>
                  <div className="hidden sm:block">
                    <div className="font-medium">{tab.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {tab.description}
                    </div>
                  </div>
                  {completedTabs.has(tab.id) && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Provide the essential details about your billboard listing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <EnhancedFormField
                        label="Billboard Title"
                        required
                        successMessage="Title looks good!"
                        description="Create a descriptive title that highlights your billboard's location and key features"
                      >
                        <Input
                          placeholder="e.g., Prime Highway Billboard - N1 Cape Town"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFieldChange("title", e.target.value);
                          }}
                        />
                      </EnhancedFormField>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your billboard location, visibility, and any special features..."
                            className="min-h-[120px]"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleFieldChange("description", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide additional details about your billboard&apos;s
                          location, visibility, and unique selling points
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📍</span>
                    Location Details
                  </CardTitle>
                  <CardDescription>
                    Specify the exact location of your billboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LocationInput
                    address={form.watch("address")}
                    city={form.watch("city")}
                    province={form.watch("province")}
                    postalCode={form.watch("postalCode") || ""}
                    onAddressChange={(value) =>
                      handleFieldChange("address", value)
                    }
                    onCityChange={(value) => handleFieldChange("city", value)}
                    onProvinceChange={(value) =>
                      handleFieldChange("province", value)
                    }
                    onPostalCodeChange={(value) =>
                      handleFieldChange("postalCode", value)
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">⚙️</span>
                    Technical Specifications
                  </CardTitle>
                  <CardDescription>
                    Define the technical details and capabilities of your
                    billboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    Pricing Information
                  </CardTitle>
                  <CardDescription>
                    Set competitive rates for your billboard advertising space
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingInput
                    basePrice={form.watch("basePrice")}
                    onBasePriceChange={(value) =>
                      form.setValue("basePrice", value)
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📸</span>
                    Media & Availability
                  </CardTitle>
                  <CardDescription>
                    Upload photos and set your availability schedule
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Billboard Images
                    </h3>
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
                          <FormDescription>
                            Upload high-quality photos of your billboard from
                            different angles and times of day
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Availability Schedule
                    </h3>
                    <AvailabilityCalendar />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {completedTabs.size} of {tabs.length} sections completed
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={async () => {
                      // Validate current tab before preview
                      await validateAndCompleteTab(activeTab);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || completedTabs.size < tabs.length}
                  >
                    {isSubmitting && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Update Listing" : "Create Listing"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </RealTimeForm>
    </div>
  );
}
