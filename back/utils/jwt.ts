import jwt from "jsonwebtoken";
import type { User } from "../types";

const { JWT_SECRET } = Bun.env as {
  JWT_SECRET: string;
};

export function createAccessToken(payload: User) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d", // 1 hari
  });
}

export function verifyAccessToken(token: string) {
  try {
    // eslint-disable-next-line
    const { iss, sub, aud, exp, nbf, iat, jti, ...user } = jwt.verify(
      token,
      JWT_SECRET,
    ) as jwt.JwtPayload;

    return user as User;
    // eslint-disable-next-line
  } catch (_) {
    return null;
  }
}
