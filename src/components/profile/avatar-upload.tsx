"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName: string;
  onAvatarChange: (avatarUrl: string | null) => void;
  disabled?: boolean;
}

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  onAvatarChange,
  disabled = false,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatarUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL for immediate feedback
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();

      // Clean up the object URL
      URL.revokeObjectURL(objectUrl);

      // Update with the Cloudinary URL
      setPreviewUrl(result.url);
      onAvatarChange(result.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload image. Please try again."
      );

      // Revert to original avatar on error
      setPreviewUrl(currentAvatarUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    try {
      // Delete from Cloudinary if it's a Cloudinary image
      if (currentAvatarUrl.includes("cloudinary.com")) {
        await fetch("/api/upload/avatar/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatarUrl: currentAvatarUrl }),
        });
      }
    } catch (error) {
      console.error("Failed to delete avatar from Cloudinary:", error);
      // Continue with removal even if Cloudinary deletion fails
    }

    setPreviewUrl(null);
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || undefined} alt={userName} />
          <AvatarFallback className="text-lg">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {!disabled && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={triggerFileSelect}
            disabled={isUploading}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          disabled={disabled || isUploading}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={disabled || isUploading}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Remove</span>
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Upload a photo to personalize your profile.
        <br />
        Supported formats: JPG, PNG, GIF (max 5MB)
      </p>
    </div>
  );
}
