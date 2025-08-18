import { NextRequest, NextResponse } from "next/server";

// This endpoint is used to check WebSocket server status
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "WebSocket server running",
    timestamp: new Date().toISOString(),
  });
}
