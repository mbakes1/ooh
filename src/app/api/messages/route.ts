import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendMessageNotification } from "@/lib/email";

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1, "Message content is required"),
});

const searchMessagesSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  conversationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: validatedData.conversationId,
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Find the recipient (the other participant)
    const recipient = conversation.participants.find(
      (p) => p.id !== session.user.id
    );

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: validatedData.conversationId,
        senderId: session.user.id,
        recipientId: recipient.id,
        content: validatedData.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update conversation timestamp
    const updatedConversation = await prisma.conversation.update({
      where: { id: validatedData.conversationId },
      data: { updatedAt: new Date() },
      include: {
        billboard: {
          select: {
            title: true,
          },
        },
      },
    });

    // Send email notification to recipient
    try {
      await sendMessageNotification({
        to: message.recipient.email,
        recipientName: message.recipient.name,
        senderName: message.sender.name,
        messageContent: message.content,
        billboardTitle: updatedConversation.billboard?.title,
        conversationUrl: `${process.env.NEXTAUTH_URL}/messages`,
      });
    } catch (error) {
      console.error("Failed to send email notification:", error);
      // Don't fail the request if email fails
    }

    // TODO: Send real-time notification via WebSocket

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const query = searchParams.get("query");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    if (query) {
      // Search messages
      const searchData = searchMessagesSchema.parse({ query, conversationId });

      const whereClause: {
        content: { contains: string; mode: "insensitive" };
        conversation: { participants: { some: { id: string } } };
        conversationId?: string;
      } = {
        content: {
          contains: searchData.query,
          mode: "insensitive",
        },
        conversation: {
          participants: {
            some: {
              id: session.user.id,
            },
          },
        },
      };

      if (searchData.conversationId) {
        whereClause.conversationId = searchData.conversationId;
      }

      const messages = await prisma.message.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          conversation: {
            select: {
              id: true,
              billboard: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });

      const total = await prisma.message.count({
        where: whereClause,
      });

      return NextResponse.json({
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required when not searching" },
        { status: 400 }
      );
    }

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

    // Get messages for the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
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
      skip: offset,
      take: limit,
    });

    const total = await prisma.message.count({
      where: {
        conversationId: conversationId,
      },
    });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
