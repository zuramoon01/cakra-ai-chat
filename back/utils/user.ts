import type { Request } from "express";
import { verifyAccessToken } from "./jwt";
import type { User } from "../types";

export function getAuthUser(req: Request) {
  return verifyAccessToken(req.headers.authorization!.split(" ")[1]) as User;
}
