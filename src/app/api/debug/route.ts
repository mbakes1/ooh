import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/utils";
import { registerSchema } from "@/lib/validations/auth";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG API ROUTE START ===");

    // Test 1: Check if we can read the request body
    const body = await request.json();
    console.log("1. Request body received:", JSON.stringify(body, null, 2));

    // Test 2: Check if validation schema works
    console.log("2. Testing validation schema...");
    const validatedData = registerSchema.parse(body);
    console.log(
      "2. Validation successful:",
      JSON.stringify(validatedData, null, 2)
    );

    // Test 3: Check database connection
    console.log("3. Testing database connection...");
    await prisma.$connect();
    console.log("3. Database connected successfully");

    // Test 4: Check if user exists
    console.log("4. Checking if user exists...");
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });
    console.log(
      "4. Existing user check:",
      existingUser ? "User exists" : "User does not exist"
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Test 5: Check password hashing
    console.log("5. Testing password hashing...");
    const passwordHash = await hashPassword(validatedData.password);
    console.log(
      "5. Password hashed successfully, length:",
      passwordHash.length
    );

    // Test 6: Check UserRole enum
    console.log("6. Testing UserRole enum...");
    console.log("6. Available roles:", Object.values(UserRole));
    console.log("6. Selected role:", validatedData.role);

    // Test 7: Try to create user (but don't actually save)
    console.log("7. Testing user creation data structure...");
    const userData = {
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      passwordHash,
      role: validatedData.role,
      businessName: validatedData.businessName || null,
      contactNumber: validatedData.contactNumber,
      location: validatedData.location,
      verified: false,
    };
    console.log("7. User data structure:", JSON.stringify(userData, null, 2));

    console.log("=== DEBUG API ROUTE SUCCESS ===");

    return NextResponse.json({
      success: true,
      message: "All tests passed",
      userData: {
        ...userData,
        passwordHash: "[REDACTED]",
      },
    });
  } catch (error) {
    console.error("=== DEBUG API ROUTE ERROR ===");
    console.error("Error:", error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.error(
      "Error name:",
      error instanceof Error ? error.name : "Unknown error type"
    );

    return NextResponse.json(
      {
        error: "Debug API failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
