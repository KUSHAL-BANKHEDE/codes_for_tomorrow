import { Router } from "express";
import { listUserChats } from "./user.controller";

export const userRouter = Router();

userRouter.get("/:userId/chats", listUserChats);
