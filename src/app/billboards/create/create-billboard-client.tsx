"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BillboardListingFormMinimal } from "@/components/billboard/billboard-listing-form-minimal";
import { type BillboardListingInput } from "@/lib/validations/billboard";

export function CreateBillboardClient() {
  const router = useRouter();

  const handleSubmit = async (data: BillboardListingInput) => {
    try {
      const response = await fetch("/api/billboards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to create billboard listing"
        );
      }

      const result = await response.json();

      toast.success("Billboard listing created successfully!", {
        description:
          "Your listing is now pending review and will be published once approved.",
      });

      // Redirect to the billboard detail page or dashboard
      router.push(`/billboards/${result.billboard.id}`);
    } catch (error) {
      console.error("Error creating billboard:", error);
      toast.error("Failed to create billboard listing", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  return (
    <BillboardListingFormMinimal onSubmit={handleSubmit} isEditing={false} />
  );
}
