import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { cloudinary } from "@/lib/cloudinary";
import { JWT } from "next-auth/jwt";

async function handler(request: NextRequest, user: JWT) {
  try {
    console.log("Avatar upload request received for user:", user.sub);

    if (request.method !== "POST") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Check Cloudinary configuration
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Cloudinary configuration missing");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("Cloudinary config check passed");

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("File converted to buffer, size:", buffer.length);

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "avatars",
            public_id: `user_${user.sub}_${Date.now()}`,
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto", fetch_format: "auto" },
            ],
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("Cloudinary upload success:", result?.public_id);
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    const result = uploadResponse as { secure_url: string; public_id: string };

    console.log("Upload completed successfully:", result.public_id);

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      message: "Avatar uploaded successfully",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to upload avatar";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, handler);
}
