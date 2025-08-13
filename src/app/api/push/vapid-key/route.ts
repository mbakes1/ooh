import { NextResponse } from "next/server";
import { getPublicVAPIDKey } from "@/lib/notifications/push";

export async function GET() {
  try {
    const publicKey = getPublicVAPIDKey();

    if (!publicKey) {
      return NextResponse.json(
        { error: "VAPID key not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({ publicKey });
  } catch (error) {
    console.error("Error getting VAPID key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
