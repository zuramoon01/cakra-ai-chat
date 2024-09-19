import type { Request, Response } from "express";
import { z } from "zod";
import { errorHandler, getAuthUser, InvalidDataError } from "../../utils";
import { HttpStatusCode, ValidationMessage } from "../../types";
import {
  db,
  roomMembersTable,
  roomMessageTable,
  roomsTable,
  usersTable,
} from "../../db";
import { aliasedTable, and, desc, eq, inArray, sql } from "drizzle-orm";

export async function getMessages(req: Request, res: Response) {
  try {
    const result = z
      .object({
        roomId: z.coerce.number({
          invalid_type_error: ValidationMessage.Type("roomId", "number"),
          required_error: ValidationMessage.Require("roomId"),
        }),
      })
      .safeParse(req.params);

    if (!result.success) {
      throw new InvalidDataError(
        '"roomId" harus diisi atau yang dimasukkan salah.',
        result.error.format(),
      );
    }

    const currentUser = getAuthUser(req);

    const {
      data: { roomId },
    } = result;

    const roomMessages = await db
      .select({
        id: roomMessageTable.id,
        senderId: roomMessageTable.senderId,
        message: roomMessageTable.message,
        createdAt: roomMessageTable.createdAt,
      })
      .from(roomMessageTable)
      .where(eq(roomMessageTable.roomId, roomId))
      .orderBy(roomMessageTable.createdAt);

    return res.status(HttpStatusCode.OK).json({
      message: "Berhasil mengambil pesan.",
      data: roomMessages,
    });
  } catch (error) {
    const { responseBody, responseStatus } = errorHandler(error);

    return res.status(responseStatus).json(responseBody);
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const result = z
      .object({
        message: z.string({
          invalid_type_error: ValidationMessage.Type("message", "string"),
          required_error: ValidationMessage.Require("message"),
        }),
        roomId: z.coerce.number({
          invalid_type_error: ValidationMessage.Type("roomId", "number"),
          required_error: ValidationMessage.Require("roomId"),
        }),
      })
      .safeParse(req.body);

    if (!result.success) {
      throw new InvalidDataError(
        '"message" atau "roomId" harus diisi atau yang dimasukkan salah.',
        result.error.format(),
      );
    }

    const currentUser = getAuthUser(req);

    const {
      data: { message, roomId },
    } = result;

    const [room] = await db
      .select({ id: roomsTable.id })
      .from(roomsTable)
      .innerJoin(roomMembersTable, eq(roomMembersTable.roomId, roomsTable.id))
      .where(
        and(
          eq(roomsTable.id, roomId),
          eq(roomMembersTable.userId, currentUser.id),
        ),
      );

    if (!room) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const [roomMessage] = await db
      .insert(roomMessageTable)
      .values({
        roomId,
        senderId: currentUser.id,
        message,
      })
      .returning({
        id: roomMessageTable.id,
        senderId: roomMessageTable.senderId,
        message: roomMessageTable.message,
        createdAt: roomMessageTable.createdAt,
      });

    return res.status(HttpStatusCode.OK).json({
      message: "Berhasil mengirim pesan.",
      data: roomMessage,
    });
  } catch (error) {
    const { responseBody, responseStatus } = errorHandler(error);

    return res.status(responseStatus).json(responseBody);
  }
}
