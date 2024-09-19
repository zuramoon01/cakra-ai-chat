import express from "express";
import { getMessages, sendMessage } from "./controller";

const messageRouter = express.Router();

messageRouter.get("/:roomId", getMessages);
messageRouter.post("/", sendMessage);

export { messageRouter };
