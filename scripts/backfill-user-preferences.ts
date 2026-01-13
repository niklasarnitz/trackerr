import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  let created = 0;

  for (const user of users) {
    await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        movieSort: "CREATED",
      },
    });
    created += 1;
  }

  console.log(`Backfill complete. Processed ${created} users.`);
}

main()
  .catch((err) => {
    console.error("Backfill failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
