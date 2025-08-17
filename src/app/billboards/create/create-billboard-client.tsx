"use client";

import { useRouter } from "next/navigation";
import { BillboardListingFormMinimal } from "@/components/billboard/billboard-listing-form-minimal";
import { type BillboardListingInput } from "@/lib/validations/billboard";
import { useBillboardNotifications } from "@/hooks/use-notifications";

export function CreateBillboardClient() {
  const router = useRouter();
  const billboardNotifications = useBillboardNotifications();

  const handleSubmit = async (data: BillboardListingInput) => {
    console.log("Form submission started with data:", data);

    const createBillboardPromise = async () => {
      const response = await fetch("/api/billboards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("API response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(
          errorData.error || "Failed to create billboard listing"
        );
      }

      const result = await response.json();
      console.log("API success response:", result);
      return result;
    };

    try {
      const result = await createBillboardPromise();

      billboardNotifications.createSuccess(data.title);

      // Redirect to the billboard detail page or dashboard
      router.push(`/billboards/${result.billboard.id}`);
    } catch (error) {
      console.error("Error creating billboard:", error);
      billboardNotifications.createError(
        error instanceof Error ? error.message : "Please try again later."
      );
    }
  };

  return (
    <BillboardListingFormMinimal onSubmit={handleSubmit} isEditing={false} />
  );
}
