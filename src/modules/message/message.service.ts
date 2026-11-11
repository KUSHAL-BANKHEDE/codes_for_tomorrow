import { prisma } from "../../db/prisma";
import * as lastSeenRepository from "../../firestore/last-seen.repository";
import * as messagesRepository from "../../firestore/messages.repository";
import * as readsRepository from "../../firestore/reads.repository";
import { notFound } from "../../lib/errors";
import {
  assertChatMembership,
  ensureChatExists,
} from "../chat/chat.service";

export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string,
) {
  await assertChatMembership(chatId, senderId);

  const message = await messagesRepository.createMessage(
    chatId,
    senderId,
    text,
  );

  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  return message;
}

export async function getMessages(chatId: string, limit: number) {
  await ensureChatExists(chatId);
  const messages = await messagesRepository.listMessages(chatId, limit);
  return { messages };
}

export async function markRead(
  chatId: string,
  messageId: string,
  userId: string,
) {
  await assertChatMembership(chatId, userId);

  const exists = await messagesRepository.messageExists(chatId, messageId);

  if (!exists) {
    throw notFound(
      "MESSAGE_NOT_FOUND",
      `Message ${messageId} was not found in chat ${chatId}`,
    );
  }

  return readsRepository.markMessageRead(chatId, messageId, userId);
}

export async function markLastSeen(
  chatId: string,
  userId: string,
  messageId: string,
) {
  await assertChatMembership(chatId, userId);

  const exists = await messagesRepository.messageExists(chatId, messageId);

  if (!exists) {
    throw notFound(
      "MESSAGE_NOT_FOUND",
      `Message ${messageId} was not found in chat ${chatId}`,
    );
  }

  return lastSeenRepository.updateLastSeen(chatId, userId, messageId);
}
