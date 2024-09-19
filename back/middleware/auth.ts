import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils";
import { HttpStatusCode } from "../types";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      throw new Error();
    }

    const accessToken = req.headers.authorization.split(" ")?.[1];

    if (!accessToken) {
      throw new Error();
    }

    if (!verifyAccessToken(accessToken)) {
      throw new Error();
    }

    next();
  } catch (err) {
    res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
  }
}
