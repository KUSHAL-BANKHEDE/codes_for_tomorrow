import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";

function messagesCollection(chatId: string) {
  return firestore.collection("chats").doc(chatId).collection("messages");
}

function messageDocument(chatId: string, messageId: string) {
  return messagesCollection(chatId).doc(messageId);
}

function toIsoString(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(0).toISOString();
}

export async function createMessage(
  chatId: string,
  senderId: string,
  text: string,
) {
  const reference = messagesCollection(chatId).doc();
  const createdAt = Timestamp.now();

  await reference.set({
    senderId,
    text,
    createdAt,
  });

  return {
    messageId: reference.id,
    chatId,
    senderId,
    text,
    createdAt: createdAt.toDate().toISOString(),
  };
}

export async function listMessages(chatId: string, limit: number) {
  const snapshot = await messagesCollection(chatId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs
    .map((document) => {
      const data = document.data();

      return {
        messageId: document.id,
        senderId: data.senderId as string,
        text: data.text as string,
        createdAt: toIsoString(data.createdAt),
      };
    })
    .reverse();
}

export async function messageExists(chatId: string, messageId: string) {
  const document = await messageDocument(chatId, messageId).get();
  return document.exists;
}
