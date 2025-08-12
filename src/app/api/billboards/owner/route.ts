import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a billboard owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== UserRole.OWNER) {
      return NextResponse.json(
        { error: "Only billboard owners can access this endpoint" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Record<string, unknown> = {
      ownerId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const [billboards, total] = await Promise.all([
      prisma.billboard.findMany({
        where,
        include: {
          images: {
            orderBy: { isPrimary: "desc" },
          },
          _count: {
            select: {
              conversations: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.billboard.count({ where }),
    ]);

    // Calculate basic analytics for each billboard
    const billboardsWithAnalytics = billboards.map((billboard) => ({
      ...billboard,
      analytics: {
        totalInquiries: billboard._count.conversations,
        // Add more analytics as needed
      },
    }));

    return NextResponse.json({
      billboards: billboardsWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching owner billboards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
