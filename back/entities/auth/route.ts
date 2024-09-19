import express from "express";
import { reauthenticate, signIn, signUp } from "./controller";
import { authMiddleware } from "../../middleware";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.get("/reauthenticate", authMiddleware, reauthenticate);

export { authRouter };
