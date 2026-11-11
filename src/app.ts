import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { chatRouter } from "./modules/chat/chat.routes";
import { messageRouter } from "./modules/message/message.routes";
import { userRouter } from "./modules/user/user.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/chat", chatRouter);
app.use("/chat", messageRouter);
app.use("/user", userRouter);

app.use(notFoundHandler);
app.use(errorHandler);
