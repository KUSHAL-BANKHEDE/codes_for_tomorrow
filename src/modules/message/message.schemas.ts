import { z } from "zod";

const idSchema = z.string().trim().min(1).max(255);

export const sendMessageSchema = z
  .object({
    senderId: idSchema,
    text: z.string().trim().min(1).max(4000),
  })
  .strict();

export const messagesQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();

export const readReceiptSchema = z
  .object({
    userId: idSchema,
  })
  .strict();

export const lastSeenSchema = z
  .object({
    userId: idSchema,
    messageId: idSchema,
  })
  .strict();
