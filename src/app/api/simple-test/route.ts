import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Simple test endpoint called");
    return NextResponse.json({ message: "Simple test works" });
  } catch (error) {
    console.error("Simple test error:", error);
    return NextResponse.json({ error: "Simple test failed" }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log("Simple POST test endpoint called");
    return NextResponse.json({ message: "Simple POST test works" });
  } catch (error) {
    console.error("Simple POST test error:", error);
    return NextResponse.json(
      { error: "Simple POST test failed" },
      { status: 500 }
    );
  }
}
