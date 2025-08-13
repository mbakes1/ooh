import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { NotificationService } from "@/lib/notifications/service";
import { z } from "zod";

const getNotificationsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  unreadOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

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
    const { page, limit, unreadOnly } = getNotificationsSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      unreadOnly: searchParams.get("unreadOnly"),
    });

    const result = await NotificationService.getUserNotifications(
      session.user.id,
      { page, limit, unreadOnly }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching notifications:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === "markAllRead") {
      const result = await NotificationService.markAllAsRead(session.user.id);
      return NextResponse.json({ success: true, updated: result.count });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
