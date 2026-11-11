import { z } from "zod";

const idSchema = z.string().trim().min(1).max(255);

export const createChatSchema = z
  .object({
    userAId: idSchema,
    userBId: idSchema,
  })
  .strict();

export const chatParamsSchema = z
  .object({
    chatId: idSchema,
  })
  .strict();

export const messageParamsSchema = z
  .object({
    chatId: idSchema,
    messageId: idSchema,
  })
  .strict();
