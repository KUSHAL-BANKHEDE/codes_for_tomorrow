import { prisma } from "../../db/prisma";
import { notFound } from "../../lib/errors";

export async function assertUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw notFound("USER_NOT_FOUND", `User ${userId} was not found`);
  }
}
