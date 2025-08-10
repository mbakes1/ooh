"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUpload } from "./avatar-upload";
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validations/auth";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADVERTISER";
  businessName?: string | null;
  contactNumber?: string | null;
  location?: string | null;
  verified: boolean;
  avatarUrl?: string | null;
}

interface ProfileFormProps {
  user: User;
  onUpdate: (data: ProfileUpdateInput) => Promise<void>;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user.avatarUrl || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name,
      businessName: user.businessName || "",
      contactNumber: user.contactNumber || "",
      location: user.location || "",
      avatarUrl: user.avatarUrl || "",
    },
  });

  const handleAvatarChange = (newAvatarUrl: string | null) => {
    setAvatarUrl(newAvatarUrl);
    setValue("avatarUrl", newAvatarUrl || "", { shouldDirty: true });
  };

  const onSubmit = async (data: ProfileUpdateInput) => {
    setIsSubmitting(true);
    try {
      await onUpdate({
        ...data,
        avatarUrl: avatarUrl || undefined,
      });
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Profile Information
          <div className="flex items-center space-x-2">
            {user.verified ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                <Shield className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="flex justify-center">
            <AvatarUpload
              currentAvatarUrl={avatarUrl}
              userName={user.name}
              onAvatarChange={handleAvatarChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={isSubmitting}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
          </div>

          {/* Role-specific fields */}
          {user.role === "OWNER" && (
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                {...register("businessName")}
                disabled={isSubmitting}
                className={errors.businessName ? "border-red-500" : ""}
                placeholder="Enter your business name"
              />
              {errors.businessName && (
                <p className="text-sm text-red-600">
                  {errors.businessName.message}
                </p>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                {...register("contactNumber")}
                disabled={isSubmitting}
                className={errors.contactNumber ? "border-red-500" : ""}
                placeholder="+27 or 0XX XXX XXXX"
              />
              {errors.contactNumber && (
                <p className="text-sm text-red-600">
                  {errors.contactNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...register("location")}
                disabled={isSubmitting}
                className={errors.location ? "border-red-500" : ""}
                placeholder="City, Province"
              />
              {errors.location && (
                <p className="text-sm text-red-600">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Account Type:</span>
                <span className="ml-2 font-medium">
                  {user.role === "OWNER" ? "Billboard Owner" : "Advertiser"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Verification Status:</span>
                <span className="ml-2">
                  {user.verified ? (
                    <span className="text-green-600 font-medium">Verified</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">
                      Pending Verification
                    </span>
                  )}
                </span>
              </div>
            </div>
            {!user.verified && (
              <p className="text-xs text-gray-500 mt-2">
                Complete your profile to improve your verification status.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
