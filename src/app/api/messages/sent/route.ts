import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Fetch sent messages
    const messages = await prisma.message.findMany({
      where: {
        senderId: session.user.id,
      },
      include: {
        conversation: {
          include: {
            billboard: {
              select: {
                id: true,
                title: true,
              },
            },
            participants: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: {
        senderId: session.user.id,
      },
    });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + messages.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch sent messages" },
      { status: 500 }
    );
  }
}
