import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function manageAdmin() {
  const args = process.argv.slice(2);
  const command = args[0];
  const email = args[1];

  if (!command || !email) {
    console.log("Usage:");
    console.log("  npm run admin:promote <email>  - Promote user to admin");
    console.log(
      "  npm run admin:demote <email>   - Demote admin to advertiser"
    );
    console.log("  npm run admin:list             - List all admin users");
    return;
  }

  try {
    switch (command) {
      case "promote":
        await promoteToAdmin(email);
        break;
      case "demote":
        await demoteFromAdmin(email);
        break;
      case "list":
        await listAdmins();
        break;
      default:
        console.log("❌ Unknown command. Use 'promote', 'demote', or 'list'");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function promoteToAdmin(email: string) {
  console.log(`🔍 Looking for user with email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`❌ User with email ${email} not found.`);
    return;
  }

  if (user.role === "ADMIN") {
    console.log(`ℹ️  User ${user.name} is already an admin.`);
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      role: "ADMIN",
      verified: true,
    },
  });

  console.log(`🎉 Successfully promoted ${updatedUser.name} to ADMIN role!`);
  console.log(`🔗 Admin portal: http://localhost:3000/admin`);
}

async function demoteFromAdmin(email: string) {
  console.log(`🔍 Looking for admin user with email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log(`❌ User with email ${email} not found.`);
    return;
  }

  if (user.role !== "ADMIN") {
    console.log(`ℹ️  User ${user.name} is not an admin.`);
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { role: "ADVERTISER" },
  });

  console.log(`✅ Successfully demoted ${updatedUser.name} from ADMIN role.`);
  console.log(`New role: ${updatedUser.role}`);
}

async function listAdmins() {
  console.log("🔍 Listing all admin users...");

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      email: true,
      verified: true,
      createdAt: true,
    },
  });

  if (admins.length === 0) {
    console.log("❌ No admin users found.");
    return;
  }

  console.log(`✅ Found ${admins.length} admin user(s):`);
  console.log("─".repeat(80));

  admins.forEach((admin, index) => {
    console.log(`${index + 1}. ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Verified: ${admin.verified ? "✅" : "❌"}`);
    console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
    console.log("─".repeat(80));
  });
}

manageAdmin();
