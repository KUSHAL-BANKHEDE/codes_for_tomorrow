import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";

export async function updateLastSeen(
  chatId: string,
  userId: string,
  messageId: string,
) {
  const updatedAt = Timestamp.now();

  await firestore
    .collection("chats")
    .doc(chatId)
    .collection("lastSeen")
    .doc(userId)
    .set(
      {
        userId,
        messageId,
        updatedAt,
      },
      { merge: true },
    );

  return {
    chatId,
    userId,
    messageId,
    updatedAt: updatedAt.toDate().toISOString(),
  };
}
