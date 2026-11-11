import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";

export async function markMessageRead(
  chatId: string,
  messageId: string,
  userId: string,
) {
  const readAt = Timestamp.now();

  await firestore
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .doc(messageId)
    .collection("reads")
    .doc(userId)
    .set(
      {
        userId,
        readAt,
      },
      { merge: true },
    );

  return {
    chatId,
    messageId,
    userId,
    readAt: readAt.toDate().toISOString(),
  };
}
