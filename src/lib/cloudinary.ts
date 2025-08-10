import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Helper function to generate upload signature for client-side uploads
export function generateUploadSignature(publicId: string, timestamp: number) {
  const signature = cloudinary.utils.api_sign_request(
    {
      public_id: publicId,
      timestamp: timestamp,
      folder: "avatars",
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return signature;
}

// Helper function to get optimized image URL
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
) {
  return cloudinary.url(publicId, {
    width: options.width || 200,
    height: options.height || 200,
    crop: options.crop || "fill",
    quality: options.quality || "auto",
    fetch_format: "auto",
  });
}
// Helper function to extract public ID from Cloudinary URL
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    if (!url.includes("cloudinary.com")) {
      return null;
    }

    // Parse the URL to extract the public ID
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Find the index of 'upload' in the path
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // The public ID starts after the version (if present) or directly after upload
    let publicIdStart = uploadIndex + 1;

    // Skip version if present (starts with 'v' followed by numbers)
    if (pathParts[publicIdStart] && /^v\d+$/.test(pathParts[publicIdStart])) {
      publicIdStart++;
    }

    // Join the remaining parts and remove file extension
    const publicIdParts = pathParts.slice(publicIdStart);
    const publicIdWithExtension = publicIdParts.join("/");

    // Remove file extension
    const lastDotIndex = publicIdWithExtension.lastIndexOf(".");
    const publicId =
      lastDotIndex > 0
        ? publicIdWithExtension.substring(0, lastDotIndex)
        : publicIdWithExtension;

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID from URL:", error);
    return null;
  }
}
