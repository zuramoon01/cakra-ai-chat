import type { Request, Response } from "express";
import { z } from "zod";
import { errorHandler, getAuthUser, InvalidDataError } from "../../utils";
import { HttpStatusCode, searchSchema } from "../../types";
import { db, usersTable } from "../../db";
import { and, eq, ilike, like, not } from "drizzle-orm";

export async function getUsers(req: Request, res: Response) {
  try {
    const result = z
      .object({
        search: searchSchema.optional(),
      })
      .safeParse(req.query);

    if (!result.success) {
      throw new InvalidDataError(
        '"search" yang dimasukkan salah.',
        result.error.format(),
      );
    }

    const currentUser = getAuthUser(req);

    const {
      data: { search },
    } = result;

    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
      })
      .from(usersTable)
      .where(
        and(
          not(eq(usersTable.id, currentUser.id)),
          ilike(usersTable.username, `%${search || ""}%`),
        ),
      )
      .orderBy(usersTable.username);

    return res.status(HttpStatusCode.OK).json({
      message: "Berhasil mendapatkan pengguna.",
      data: users,
    });
  } catch (error) {
    const { responseBody, responseStatus } = errorHandler(error);

    return res.status(responseStatus).json(responseBody);
  }
}
