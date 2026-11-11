import { Router } from "express";
import {
  listChatMessages,
  markChatMessageRead,
  sendChatMessage,
  updateChatLastSeen,
} from "./message.controller";

export const messageRouter = Router();

messageRouter.post("/:chatId/message/send", sendChatMessage);
messageRouter.get("/:chatId/messages", listChatMessages);
messageRouter.post("/:chatId/message/:messageId/read", markChatMessageRead);
messageRouter.post("/:chatId/lastseen", updateChatLastSeen);
