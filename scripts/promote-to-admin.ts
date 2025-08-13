import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function promoteToAdmin() {
  const email = "mbasasishuba2@gmail.com";

  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      console.log(
        "Please make sure you have signed up with this email address first."
      );
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
        verified: true, // Also ensure the user is verified
      },
    });

    console.log(`🎉 Successfully promoted ${updatedUser.name} to ADMIN role!`);
    console.log(`✅ User is now verified: ${updatedUser.verified}`);
    console.log(
      `🔗 You can now access the admin portal at: http://localhost:3000/admin`
    );
  } catch (error) {
    console.error("❌ Error promoting user to admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
