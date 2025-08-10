import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";
import { JWT } from "next-auth/jwt";
import { profileUpdateSchema } from "@/lib/validations/auth";
import { UserRole } from "@prisma/client";

async function handler(request: NextRequest, user: JWT) {
  try {
    if (request.method === "GET") {
      // Get user profile
      const userProfile = await prisma.user.findUnique({
        where: { id: user.sub },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          businessName: true,
          contactNumber: true,
          location: true,
          verified: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!userProfile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user: userProfile });
    }

    if (request.method === "PUT") {
      // Update user profile
      const body = await request.json();

      // Get current user to check role for business name validation
      const currentUser = await prisma.user.findUnique({
        where: { id: user.sub },
        select: { role: true },
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Validate input with role-specific validation
      const validation = profileUpdateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Validation failed", details: validation.error.issues },
          { status: 400 }
        );
      }

      const { name, businessName, contactNumber, location, avatarUrl } =
        validation.data;

      // Additional validation for business owners
      if (currentUser.role === UserRole.OWNER && !businessName) {
        return NextResponse.json(
          { error: "Business name is required for billboard owners" },
          { status: 400 }
        );
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: user.sub },
        data: {
          name,
          businessName: businessName || null,
          contactNumber,
          location,
          avatarUrl: avatarUrl || null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          businessName: true,
          contactNumber: true,
          location: true,
          verified: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        user: updatedUser,
        message: "Profile updated successfully",
      });
    }

    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handler);
}

export async function PUT(request: NextRequest) {
  return withAuth(request, handler);
}
