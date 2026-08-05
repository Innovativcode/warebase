import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const superadminEmail = process.env.SUPERADMIN_EMAIL || "superadmin@warebase.io";
const superadminPassword = process.env.SUPERADMIN_PASSWORD || "SuperAdmin#2026!Secure";
const superadminName = process.env.SUPERADMIN_NAME || "WareBase Super Admin";

async function main() {
  console.log("Creating superadmin account...");
  console.log(`Email: ${superadminEmail}`);

  const existing = await prisma.user.findUnique({ where: { email: superadminEmail } });

  if (existing) {
    console.log("Superadmin already exists. Updating...");
    const passwordHash = await bcrypt.hash(superadminPassword, 12);
    await prisma.user.update({
      where: { email: superadminEmail },
      data: {
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
        isSuperAdmin: true,
      },
    });
    console.log("Superadmin updated successfully.");
  } else {
    const passwordHash = await bcrypt.hash(superadminPassword, 12);
    const publicIdentifier = `superadmin-${Math.random().toString(36).substring(2, 8)}`;

    await prisma.user.create({
      data: {
        name: superadminName,
        email: superadminEmail,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
        isSuperAdmin: true,
        publicIdentifier,
      },
    });
    console.log("Superadmin created successfully.");
  }

  console.log("\nSuperadmin credentials:");
  console.log(`Email: ${superadminEmail}`);
  console.log(`Password: ${superadminPassword}`);
  console.log("\n⚠️  IMPORTANT: Change this password immediately after first login!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
