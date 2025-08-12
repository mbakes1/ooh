import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;

    // Get conversation details
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        billboard: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            basePrice: true,
            currency: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            messages: {
              where: {
                recipientId: session.user.id,
                readAt: null,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const body = await request.json();
    const { action } = body;

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    if (action === "markAllRead") {
      // Mark all messages in conversation as read for current user
      await prisma.message.updateMany({
        where: {
          conversationId: conversationId,
          recipientId: session.user.id,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "All messages marked as read",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
