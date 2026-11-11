import type { Request, Response } from "express";
import { z } from "zod";
import { listChatsForUser } from "../chat/chat.service";

const userParamsSchema = z
  .object({
    userId: z.string().trim().min(1).max(255),
  })
  .strict();

export async function listUserChats(req: Request, res: Response) {
  const { userId } = userParamsSchema.parse(req.params);
  const result = await listChatsForUser(userId);
  res.status(200).json(result);
}
