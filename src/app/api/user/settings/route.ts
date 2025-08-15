import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return default settings since we don't have a settings table
    // In a real app, you'd fetch from a UserSettings table
    const defaultSettings = {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
    };

    return NextResponse.json({ settings: defaultSettings });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications, pushNotifications, marketingEmails } = body;

    // For now, just return success since we don't have a settings table
    // In a real app, you'd update the UserSettings table
    const updatedSettings = {
      emailNotifications: Boolean(emailNotifications),
      pushNotifications: Boolean(pushNotifications),
      marketingEmails: Boolean(marketingEmails),
    };

    return NextResponse.json({
      settings: updatedSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
