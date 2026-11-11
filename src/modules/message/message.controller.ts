import type { Request, Response } from "express";
import {
  chatParamsSchema,
  messageParamsSchema,
} from "../chat/chat.schemas";
import {
  lastSeenSchema,
  messagesQuerySchema,
  readReceiptSchema,
  sendMessageSchema,
} from "./message.schemas";
import {
  getMessages,
  markLastSeen,
  markRead,
  sendMessage,
} from "./message.service";

export async function sendChatMessage(req: Request, res: Response) {
  const { chatId } = chatParamsSchema.parse(req.params);
  const input = sendMessageSchema.parse(req.body);
  const message = await sendMessage(chatId, input.senderId, input.text);
  res.status(201).json(message);
}

export async function listChatMessages(req: Request, res: Response) {
  const { chatId } = chatParamsSchema.parse(req.params);
  const { limit } = messagesQuerySchema.parse(req.query);
  const result = await getMessages(chatId, limit);
  res.status(200).json(result);
}

export async function markChatMessageRead(req: Request, res: Response) {
  const { chatId, messageId } = messageParamsSchema.parse(req.params);
  const { userId } = readReceiptSchema.parse(req.body);
  const receipt = await markRead(chatId, messageId, userId);
  res.status(200).json(receipt);
}

export async function updateChatLastSeen(req: Request, res: Response) {
  const { chatId } = chatParamsSchema.parse(req.params);
  const { userId, messageId } = lastSeenSchema.parse(req.body);
  const lastSeen = await markLastSeen(chatId, userId, messageId);
  res.status(200).json(lastSeen);
}
