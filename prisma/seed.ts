import { PrismaClient, Role } from "@/lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean users
  console.log("🧹 Cleaning existing users...");
  await prisma.user.deleteMany();

  // ============================================
  // USERS
  // ============================================
  console.log("👤 Creating users...");
  const adminPassword = await hashPassword("admin123");
  const staffPassword = await hashPassword("staff123");

  const admin = await prisma.user.create({
    data: {
      name: "Admin Hong Van",
      email: "admin@hongvan.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: "Nguyễn Thị Mai",
      email: "mai@hongvan.com",
      passwordHash: staffPassword,
      role: Role.STAFF,
      isActive: true,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: "Trần Văn Hùng",
      email: "hung@hongvan.com",
      passwordHash: staffPassword,
      role: Role.STAFF,
      isActive: true,
    },
  });

  console.log("   ✅ Created 3 users:");
  console.log(`   - Admin: ${admin.email} (password: admin123)`);
  console.log(`   - Staff 1: ${staff1.email} (password: staff123)`);
  console.log(`   - Staff 2: ${staff2.email} (password: staff123)`);

  console.log("\n✨ Seeding complete!\n");
}

main()
  .then(async () => {
    console.log("\n🎉 Seeding completed successfully!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
