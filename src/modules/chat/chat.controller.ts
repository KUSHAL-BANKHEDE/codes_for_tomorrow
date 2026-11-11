import type { Request, Response } from "express";
import { createChatSchema } from "./chat.schemas";
import { createDirectChat } from "./chat.service";

export async function createChat(req: Request, res: Response) {
  const input = createChatSchema.parse(req.body);
  const result = await createDirectChat(input.userAId, input.userBId);
  res.status(200).json(result);
}
