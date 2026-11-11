import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { badRequest, forbidden, notFound } from "../../lib/errors";
import { assertUserExists } from "../user/user.service";

function createDirectKey(userAId: string, userBId: string) {
  const pair = [userAId, userBId].sort().join("\u0000");
  return createHash("sha256").update(pair).digest("hex");
}

export async function createDirectChat(userAId: string, userBId: string) {
  if (userAId === userBId) {
    throw badRequest(
      "SELF_CHAT_NOT_ALLOWED",
      "A user cannot create a chat with themselves",
    );
  }

  await Promise.all([assertUserExists(userAId), assertUserExists(userBId)]);

  const directKey = createDirectKey(userAId, userBId);
  const existingChat = await prisma.chat.findUnique({
    where: { directKey },
    select: { id: true },
  });

  if (existingChat) {
    return { chatId: existingChat.id };
  }

  try {
    const chat = await prisma.chat.create({
      data: {
        type: "DIRECT",
        directKey,
        members: {
          create: [{ userId: userAId }, { userId: userBId }],
        },
      },
      select: { id: true },
    });

    return { chatId: chat.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const chat = await prisma.chat.findUnique({
        where: { directKey },
        select: { id: true },
      });

      if (chat) {
        return { chatId: chat.id };
      }
    }

    throw error;
  }
}

export async function ensureChatExists(chatId: string) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { id: true },
  });

  if (!chat) {
    throw notFound("CHAT_NOT_FOUND", `Chat ${chatId} was not found`);
  }
}

export async function assertChatMembership(chatId: string, userId: string) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      id: true,
      members: {
        where: { userId },
        select: { userId: true },
      },
    },
  });

  if (!chat) {
    throw notFound("CHAT_NOT_FOUND", `Chat ${chatId} was not found`);
  }

  if (chat.members.length === 0) {
    throw forbidden(
      "NOT_CHAT_MEMBER",
      `User ${userId} is not a member of chat ${chatId}`,
    );
  }
}

export async function listChatsForUser(userId: string) {
  await assertUserExists(userId);

  const chats = await prisma.chat.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    chats: chats.map((chat) => {
      const members = [...chat.members]
        .sort((left, right) => left.userId.localeCompare(right.userId))
        .map((member) => member.user);

      return {
        chatId: chat.id,
        type: chat.type,
        memberIds: members.map((member) => member.id),
        members,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
      };
    }),
  };
}
