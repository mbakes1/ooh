"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  billboardListingSchema,
  type BillboardListingInput,
} from "@/lib/validations/billboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface BillboardWithImages {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string;
  province: string;
  postalCode: string | null;
  width: number;
  height: number;
  resolution: string | null;
  brightness: number | null;
  viewingDistance: number | null;
  trafficLevel: "HIGH" | "MEDIUM" | "LOW" | null;
  basePrice: number;
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
}

interface BillboardEditFormProps {
  billboard: BillboardWithImages;
}

export function BillboardEditForm({ billboard }: BillboardEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BillboardListingInput>({
    resolver: zodResolver(billboardListingSchema),
    defaultValues: {
      title: billboard.title,
      description: billboard.description || "",
      address: billboard.address,
      city: billboard.city,
      province: billboard.province,
      postalCode: billboard.postalCode || "",
      width: billboard.width,
      height: billboard.height,
      resolution: billboard.resolution || "",
      brightness: billboard.brightness || 0,
      viewingDistance: billboard.viewingDistance || 0,
      trafficLevel: billboard.trafficLevel || "MEDIUM",
      basePrice: Number(billboard.basePrice),
      images: billboard.images.map((img) => img.imageUrl),
    },
  });

  const onSubmit = async (data: BillboardListingInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/billboards/${billboard.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update billboard");
      }

      // Redirect to billboard listings on success
      router.push("/dashboard/billboards");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/billboards">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Billboards
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Billboard Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="e.g., Prime Location Digital Billboard - Cape Town CBD"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe your billboard's unique features, visibility, and advantages..."
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="e.g., 123 Main Street, City Center"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="e.g., Cape Town"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="province">Province *</Label>
                  <Input
                    id="province"
                    {...form.register("province")}
                    placeholder="e.g., Western Cape"
                  />
                  {form.formState.errors.province && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.province.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  {...form.register("postalCode")}
                  placeholder="e.g., 8001"
                />
                {form.formState.errors.postalCode && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.postalCode.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Width (pixels) *</Label>
                  <Input
                    id="width"
                    type="number"
                    {...form.register("width", { valueAsNumber: true })}
                    placeholder="e.g., 1920"
                  />
                  {form.formState.errors.width && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.width.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="height">Height (pixels) *</Label>
                  <Input
                    id="height"
                    type="number"
                    {...form.register("height", { valueAsNumber: true })}
                    placeholder="e.g., 1080"
                  />
                  {form.formState.errors.height && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.height.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="resolution">Resolution *</Label>
                <Input
                  id="resolution"
                  {...form.register("resolution")}
                  placeholder="e.g., 1920x1080"
                />
                {form.formState.errors.resolution && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.resolution.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brightness">Brightness (nits)</Label>
                  <Input
                    id="brightness"
                    type="number"
                    {...form.register("brightness", { valueAsNumber: true })}
                    placeholder="e.g., 5000"
                  />
                  {form.formState.errors.brightness && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.brightness.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="viewingDistance">
                    Viewing Distance (meters)
                  </Label>
                  <Input
                    id="viewingDistance"
                    type="number"
                    {...form.register("viewingDistance", {
                      valueAsNumber: true,
                    })}
                    placeholder="e.g., 50"
                  />
                  {form.formState.errors.viewingDistance && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.viewingDistance.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="trafficLevel">Traffic Level</Label>
                <select
                  id="trafficLevel"
                  {...form.register("trafficLevel")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select traffic level</option>
                  <option value="HIGH">High Traffic</option>
                  <option value="MEDIUM">Medium Traffic</option>
                  <option value="LOW">Low Traffic</option>
                </select>
                {form.formState.errors.trafficLevel && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.trafficLevel.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="basePrice">Base Price (ZAR per day) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  {...form.register("basePrice", { valueAsNumber: true })}
                  placeholder="e.g., 1500"
                />
                {form.formState.errors.basePrice && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.basePrice.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Set your daily rate in South African Rand (ZAR)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="images">Billboard Images *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload high-quality images of your billboard. The first image
                  will be used as the primary image.
                </p>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    // Handle file upload logic here
                    console.log("Files selected:", files);
                  }}
                />
                {form.formState.errors.images && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.images.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/billboards">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Billboard
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
