import { Router } from "express";
import { createChat } from "./chat.controller";

export const chatRouter = Router();

chatRouter.post("/create", createChat);
