import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { cloudinary, extractPublicIdFromUrl } from "@/lib/cloudinary";
import { JWT } from "next-auth/jwt";

async function handler(request: NextRequest, user: JWT) {
  try {
    if (request.method !== "DELETE") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    const { avatarUrl } = await request.json();

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "Avatar URL is required" },
        { status: 400 }
      );
    }

    // Extract public ID from the URL
    const publicId = extractPublicIdFromUrl(avatarUrl);

    if (!publicId) {
      return NextResponse.json(
        { error: "Invalid Cloudinary URL" },
        { status: 400 }
      );
    }

    // Verify that the public ID belongs to the current user
    if (!publicId.includes(`user_${user.sub}`)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({ message: "Avatar deleted successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to delete avatar" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Avatar deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  return withAuth(request, handler);
}
