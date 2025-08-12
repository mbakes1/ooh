import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
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

    const { id: messageId } = await params;

    // Verify the message exists and user is the recipient
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is part of the conversation
    const isParticipant = message.conversation.participants.some(
      (p) => p.id === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Only allow recipient to mark as read
    if (message.recipientId !== session.user.id) {
      return NextResponse.json(
        { error: "Only recipient can mark message as read" },
        { status: 403 }
      );
    }

    // Mark message as read
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: messageId } = await params;

    // Verify the message exists and user is the sender
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "Only sender can delete message" },
        { status: 403 }
      );
    }

    // Soft delete by updating content (we don't actually delete for audit purposes)
    await prisma.message.update({
      where: { id: messageId },
      data: { content: "[Message deleted]" },
    });

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
