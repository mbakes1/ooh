import {
  PrismaClient,
  UserRole,
  BillboardStatus,
  TrafficLevel,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create sample users
  const hashedPassword = await bcrypt.hash("password123", 12);

  const billboardOwner1 = await prisma.user.upsert({
    where: { email: "owner1@example.com" },
    update: {},
    create: {
      email: "owner1@example.com",
      passwordHash: hashedPassword,
      name: "John Smith",
      role: UserRole.OWNER,
      businessName: "Cape Town Digital Billboards",
      contactNumber: "+27 21 123 4567",
      location: "Cape Town, Western Cape",
      verified: true,
    },
  });

  const billboardOwner2 = await prisma.user.upsert({
    where: { email: "owner2@example.com" },
    update: {},
    create: {
      email: "owner2@example.com",
      passwordHash: hashedPassword,
      name: "Sarah Johnson",
      role: UserRole.OWNER,
      businessName: "Johannesburg Outdoor Media",
      contactNumber: "+27 11 987 6543",
      location: "Johannesburg, Gauteng",
      verified: true,
    },
  });

  const advertiser1 = await prisma.user.upsert({
    where: { email: "advertiser1@example.com" },
    update: {},
    create: {
      email: "advertiser1@example.com",
      passwordHash: hashedPassword,
      name: "Mike Wilson",
      role: UserRole.ADVERTISER,
      businessName: "Creative Marketing Agency",
      contactNumber: "+27 21 555 0123",
      location: "Cape Town, Western Cape",
      verified: true,
    },
  });

  const advertiser2 = await prisma.user.upsert({
    where: { email: "advertiser2@example.com" },
    update: {},
    create: {
      email: "advertiser2@example.com",
      passwordHash: hashedPassword,
      name: "Lisa Brown",
      role: UserRole.ADVERTISER,
      businessName: "Brand Solutions SA",
      contactNumber: "+27 11 444 5678",
      location: "Johannesburg, Gauteng",
      verified: true,
    },
  });

  console.log("✅ Created sample users");

  // Create sample billboards
  const billboard1 = await prisma.billboard.create({
    data: {
      title: "Premium Highway Billboard - N1 Cape Town",
      description:
        "High-traffic digital billboard located on the N1 highway with excellent visibility for both directions. Perfect for brand awareness campaigns.",
      ownerId: billboardOwner1.id,
      address: "123 N1 Highway, Goodwood",
      city: "Cape Town",
      province: "Western Cape",
      postalCode: "7460",
      latitude: -33.9249,
      longitude: 18.4241,
      width: 6,
      height: 3,
      resolution: "1920x1080",
      brightness: 5000,
      viewingDistance: 100,
      trafficLevel: TrafficLevel.HIGH,
      basePrice: 15000.0,
      status: BillboardStatus.ACTIVE,
    },
  });

  const billboard2 = await prisma.billboard.create({
    data: {
      title: "City Center Digital Display - Sandton",
      description:
        "Premium location in the heart of Sandton CBD. High foot traffic and excellent visibility for corporate campaigns.",
      ownerId: billboardOwner2.id,
      address: "456 Rivonia Road, Sandton",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2196",
      latitude: -26.1076,
      longitude: 28.0567,
      width: 4,
      height: 3,
      resolution: "1920x1440",
      brightness: 6000,
      viewingDistance: 50,
      trafficLevel: TrafficLevel.HIGH,
      basePrice: 25000.0,
      status: BillboardStatus.ACTIVE,
    },
  });

  const billboard3 = await prisma.billboard.create({
    data: {
      title: "Shopping Mall Entrance Display",
      description:
        "Located at the main entrance of a busy shopping mall in Durban. Great for retail and consumer brand campaigns.",
      ownerId: billboardOwner1.id,
      address: "789 Gateway Drive, Umhlanga",
      city: "Durban",
      province: "KwaZulu-Natal",
      postalCode: "4319",
      latitude: -29.7248,
      longitude: 31.0597,
      width: 3,
      height: 2,
      resolution: "1440x960",
      brightness: 4500,
      viewingDistance: 30,
      trafficLevel: TrafficLevel.MEDIUM,
      basePrice: 8000.0,
      status: BillboardStatus.ACTIVE,
    },
  });

  console.log("✅ Created sample billboards");

  // Create sample billboard images
  await prisma.billboardImage.createMany({
    data: [
      {
        billboardId: billboard1.id,
        imageUrl: "/placeholder-billboard.jpg",
        altText: "N1 Highway Billboard Main View",
        isPrimary: true,
      },
      {
        billboardId: billboard1.id,
        imageUrl: "/placeholder-billboard.jpg",
        altText: "N1 Highway Billboard Side View",
        isPrimary: false,
      },
      {
        billboardId: billboard2.id,
        imageUrl: "/placeholder-billboard.jpg",
        altText: "Sandton CBD Billboard Main View",
        isPrimary: true,
      },
      {
        billboardId: billboard3.id,
        imageUrl: "/placeholder-billboard.jpg",
        altText: "Shopping Mall Billboard Main View",
        isPrimary: true,
      },
    ],
  });

  console.log("✅ Created sample billboard images");

  // Create sample conversations and messages
  const conversation1 = await prisma.conversation.create({
    data: {
      billboardId: billboard1.id,
      participants: {
        connect: [{ id: advertiser1.id }, { id: billboardOwner1.id }],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: advertiser1.id,
      recipientId: billboardOwner1.id,
      content:
        "Hi, I'm interested in your N1 highway billboard for a 3-month campaign. Could we discuss pricing and availability?",
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation1.id,
      senderId: billboardOwner1.id,
      recipientId: advertiser1.id,
      content:
        "Hello Mike! Thanks for your interest. The billboard is available for the dates you mentioned. Our standard rate is R15,000 per month. Would you like to schedule a call to discuss the details?",
    },
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      billboardId: billboard2.id,
      participants: {
        connect: [{ id: advertiser2.id }, { id: billboardOwner2.id }],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation2.id,
      senderId: advertiser2.id,
      recipientId: billboardOwner2.id,
      content:
        "Good day Sarah, I represent a financial services company and we're looking for premium locations in Sandton. Is your Rivonia Road billboard available for Q1 2024?",
    },
  });

  console.log("✅ Created sample conversations and messages");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
