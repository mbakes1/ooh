import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";
import { JWT } from "next-auth/jwt";

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
