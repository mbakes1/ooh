"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFileNotifications } from "@/hooks/use-notifications";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

interface ImagePreview {
  url: string;
  file?: File;
  altText?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  className,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>(
    images.map((url) => ({ url }))
  );
  const [uploading, setUploading] = useState(false);
  const fileNotifications = useFileNotifications();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log("onDrop called with files:", acceptedFiles);
      if (previews.length + acceptedFiles.length > maxImages) {
        fileNotifications.fileSizeError();
        return;
      }

      setUploading(true);

      try {
        const newPreviews: ImagePreview[] = [];
        const newUrls: string[] = [];

        for (const file of acceptedFiles) {
          // Show upload start notification
          fileNotifications.uploadStart(file.name);

          // Create preview URL
          const previewUrl = URL.createObjectURL(file);
          newPreviews.push({ url: previewUrl, file });
          console.log("Created preview URL:", previewUrl);

          // Upload to Cloudinary
          const formData = new FormData();
          formData.append("file", file);

          console.log("Uploading file to /api/upload:", file.name);
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          console.log("Upload response status:", response.status);
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Upload failed with response:", errorText);
            fileNotifications.uploadError(file.name, "Failed to upload image");
            throw new Error("Failed to upload image");
          }

          const { url } = await response.json();
          console.log("Upload successful, received URL:", url);
          newUrls.push(url);

          // Show success notification
          fileNotifications.uploadSuccess(file.name);
        }

        setPreviews((prev) => [...prev, ...newPreviews]);
        onImagesChange([...images, ...newUrls]);
        console.log("Images updated:", [...images, ...newUrls]);
      } catch (error) {
        console.error("Error uploading images:", error);
        // Individual file errors are handled above, this is for general errors
      } finally {
        setUploading(false);
      }
    },
    [images, onImagesChange, maxImages, previews.length, fileNotifications]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading || previews.length >= maxImages,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        if (rejection.errors.some((error) => error.code === "file-too-large")) {
          fileNotifications.fileSizeError();
        } else if (
          rejection.errors.some((error) => error.code === "file-invalid-type")
        ) {
          fileNotifications.fileTypeError();
        }
      });
    },
  });

  const removeImage = (index: number) => {
    console.log("Removing image at index:", index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newImages = images.filter((_, i) => i !== index);

    setPreviews(newPreviews);
    onImagesChange(newImages);
    console.log("Updated images array:", newImages);
  };

  const updateAltText = (index: number, altText: string) => {
    const newPreviews = [...previews];
    newPreviews[index] = { ...newPreviews[index], altText };
    setPreviews(newPreviews);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          (uploading || previews.length >= maxImages) &&
            "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-lg">Drop the images here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">
              Drag & drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Maximum {maxImages} images, up to 5MB each
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: JPEG, PNG, WebP
            </p>
          </div>
        )}
        {uploading && <p className="text-sm text-primary mt-2">Uploading...</p>}
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <Card key={index} className="relative group">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={preview.altText || `Billboard image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-3">
                <Label htmlFor={`alt-text-${index}`} className="text-xs">
                  Alt Text (Optional)
                </Label>
                <Input
                  id={`alt-text-${index}`}
                  type="text"
                  placeholder="Describe this image..."
                  value={preview.altText || ""}
                  onChange={(e) => updateAltText(index, e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Image Counter */}
      <div className="text-sm text-gray-500 text-center">
        {previews.length} of {maxImages} images uploaded
      </div>
    </div>
  );
}
