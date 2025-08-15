#!/usr/bin/env tsx

/**
 * Production Database Verification Script
 * Verifies that the production database is properly configured and accessible
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    console.log("🔍 Verifying database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Check if tables exist
    const userCount = await prisma.user.count();
    const billboardCount = await prisma.billboard.count();

    console.log(`📊 Database Statistics:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Billboards: ${billboardCount}`);

    // Test a simple query
    const recentUsers = await prisma.user.findMany({
      take: 1,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, createdAt: true },
    });

    if (recentUsers.length > 0) {
      console.log(`👤 Most recent user: ${recentUsers[0].email}`);
    }

    console.log("✅ Database verification completed successfully");
  } catch (error) {
    console.error("❌ Database verification failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
