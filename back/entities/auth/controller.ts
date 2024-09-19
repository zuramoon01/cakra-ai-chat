import type { Request, Response } from "express";
import { z } from "zod";
import {
  confirmPasswordSchema,
  HttpStatusCode,
  passwordSchema,
  usernameSchema,
} from "../../types";
import {
  createAccessToken,
  DuplicateUserError,
  errorHandler,
  getAuthUser,
  InvalidDataError,
} from "../../utils";
import { getUserByUsername, insertUser } from "../../db";

export async function signUp(req: Request, res: Response) {
  try {
    const result = z
      .object({
        username: usernameSchema,
        password: passwordSchema,
        confirmPassword: confirmPasswordSchema,
      })
      .safeParse(req.body);

    if (!result.success) {
      throw new InvalidDataError(
        "Nama atau kata sandi atau konfirmasi kata sandi yang dimasukkan salah.",
        result.error.format(),
      );
    }

    const {
      data: { username, password, confirmPassword },
    } = result;

    if (password !== confirmPassword) {
      throw new InvalidDataError(
        "Kata sandi dan konfirmasi kata sandi tidak sama. Mohon untuk memasukkan kata sandi kembali.",
      );
    }

    const passwordHash = await Bun.password.hash(password, {
      algorithm: "argon2id",
      memoryCost: 4,
      timeCost: 3,
    });

    const [user] = await insertUser({
      username,
      passwordHash,
    });

    if (!user) {
      throw new DuplicateUserError(
        `Pengguna dengan nama "${username}" sudah digunakan.`,
      );
    }

    const accessToken = createAccessToken(user);

    return res.status(HttpStatusCode.CREATED).json({
      message: "Berhasil mendaftarkan akun.",
      data: { user, accessToken },
    });
  } catch (error) {
    const { responseBody, responseStatus } = errorHandler(error);

    return res.status(responseStatus).json(responseBody);
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    const result = z
      .object({
        username: usernameSchema,
        password: passwordSchema,
      })
      .safeParse(req.body);

    if (!result.success) {
      throw new InvalidDataError(
        "Nama atau kata sandi yang dimasukkan salah.",
        result.error.format(),
      );
    }

    const {
      data: { username, password },
    } = result;

    const [user] = await getUserByUsername(username);

    if (!user) {
      throw new InvalidDataError("Nama atau kata sandi yang dimasukkan salah.");
    }

    if (!(await Bun.password.verify(password, user.passwordHash))) {
      throw new InvalidDataError("Nama atau kata sandi yang dimasukkan salah.");
    }

    const userData = {
      id: user.id,
      username: user.username,
    };

    const accessToken = createAccessToken(userData);

    return res.status(HttpStatusCode.OK).json({
      message: "Berhasil mendaftarkan akun.",
      data: { user: userData, accessToken },
    });
  } catch (error) {
    const { responseBody, responseStatus } = errorHandler(error);

    return res.status(responseStatus).json(responseBody);
  }
}

export async function reauthenticate(req: Request, res: Response) {
  const currentUser = getAuthUser(req);

  return res.status(HttpStatusCode.OK).json({
    data: { user: currentUser },
  });
}
