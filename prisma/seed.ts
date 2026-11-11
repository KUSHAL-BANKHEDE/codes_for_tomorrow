import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { id: "user_alice" },
    update: { displayName: "Alice" },
    create: { id: "user_alice", displayName: "Alice" },
  });

  await prisma.user.upsert({
    where: { id: "user_bob" },
    update: { displayName: "Bob" },
    create: { id: "user_bob", displayName: "Bob" },
  });

  console.log("Seeded users: user_alice, user_bob");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
