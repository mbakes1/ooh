import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendConversationStartedNotification } from "@/lib/email";
import { formatZAR, formatSASTDate } from "@/lib/utils";

const createConversationSchema = z.object({
  billboardId: z.string(),
  recipientId: z.string(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.string().optional(),
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
    const validatedData = createConversationSchema.parse(body);

    // Check if billboard exists and is active
    const billboard = await prisma.billboard.findUnique({
      where: { id: validatedData.billboardId },
      include: { owner: true },
    });

    if (!billboard) {
      return NextResponse.json(
        { error: "Billboard not found" },
        { status: 404 }
      );
    }

    if (billboard.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Billboard is not available for inquiries" },
        { status: 400 }
      );
    }

    // Prevent owners from messaging themselves
    if (billboard.ownerId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot send inquiry to your own billboard" },
        { status: 400 }
      );
    }

    // Check if conversation already exists between these users for this billboard
    let conversation = await prisma.conversation.findFirst({
      where: {
        billboardId: validatedData.billboardId,
        participants: {
          every: {
            id: {
              in: [session.user.id, validatedData.recipientId],
            },
          },
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          billboardId: validatedData.billboardId,
          participants: {
            connect: [
              { id: session.user.id },
              { id: validatedData.recipientId },
            ],
          },
        },
        include: {
          participants: true,
          messages: true,
        },
      });
    }

    // Create the inquiry message with additional details
    let messageContent = validatedData.message;

    // Add inquiry details to the message
    const inquiryDetails = [];
    if (validatedData.startDate) {
      inquiryDetails.push(
        `Start Date: ${formatSASTDate(new Date(validatedData.startDate))}`
      );
    }
    if (validatedData.endDate) {
      inquiryDetails.push(
        `End Date: ${formatSASTDate(new Date(validatedData.endDate))}`
      );
    }
    if (validatedData.budget) {
      inquiryDetails.push(`Budget: ${formatZAR(Number(validatedData.budget))}`);
    }

    if (inquiryDetails.length > 0) {
      messageContent += `\n\n--- Inquiry Details ---\n${inquiryDetails.join("\n")}`;
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        recipientId: validatedData.recipientId,
        content: messageContent,
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
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Send email notification to recipient
    try {
      await sendConversationStartedNotification({
        to: message.recipient.email,
        recipientName: message.recipient.name,
        senderName: message.sender.name,
        messageContent: messageContent,
        billboardTitle: billboard.title,
        conversationUrl: `${process.env.NEXTAUTH_URL?.split(',')[0] || 'http://localhost:3000'}/messages`,
      });
    } catch (error) {
      console.error("Failed to send email notification:", error);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      messageId: message.id,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get conversations for the current user
    const conversations = await prisma.conversation.findMany({
      where: {
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
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
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
      orderBy: { updatedAt: "desc" },
      skip: offset,
      take: limit,
    });

    const total = await prisma.conversation.count({
      where: {
        participants: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
