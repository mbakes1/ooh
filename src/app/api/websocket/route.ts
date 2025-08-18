import { NextResponse } from "next/server";

// This endpoint is used to check WebSocket server status
export async function GET() {
  return NextResponse.json({
    status: "WebSocket server running",
    timestamp: new Date().toISOString(),
  });
}
