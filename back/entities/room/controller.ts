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
import { aliasedTable, and, eq, inArray, sql } from "drizzle-orm";

export async function getRooms(req: Request, res: Response) {
  try {
    const currentUser = getAuthUser(req);

    const rooms = await db.execute(
      sql`
        SELECT
          rooms.id,
          rooms.name,
          rooms.is_group AS "isGroup",
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', users.id,
              'username', users.username
            )
          ) AS members
        FROM
          rooms
        INNER JOIN
          room_members ON room_members.room_id = rooms.id
        INNER JOIN
          users ON users.id = room_members.user_id
        WHERE
          rooms.is_group = false
          AND rooms.id IN (
            SELECT room_members.room_id
            FROM room_members
            WHERE room_members.user_id = ${currentUser.id}
          )
        GROUP BY
          rooms.id, rooms.name, rooms.is_group;
      `,
    );

    return res.status(HttpStatusCode.OK).json({
      message: "Berhasil mengambil ruang chat.",
      data: rooms,
    });
  } catch (error) {
    const { responseBody, responseStatus } = errorHandler(error);

    return res.status(responseStatus).json(responseBody);
  }
}

export async function createPrivateRoom(req: Request, res: Response) {
  try {
    const result = z
      .object({
        userId: z.string({
          invalid_type_error: ValidationMessage.Type("userId", "string"),
          required_error: ValidationMessage.Require("userId"),
        }),
      })
      .safeParse(req.body);

    if (!result.success) {
      throw new InvalidDataError(
        '"userId" harus diisi atau yang dimasukkan salah.',
        result.error.format(),
      );
    }

    const {
      data: { userId },
    } = result;

    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      throw new InvalidDataError("Pengguna tidak ditemukan.");
    }

    const currentUser = getAuthUser(req);

    const [room] = await db.transaction(async (trx) => {
      const rm1 = aliasedTable(roomMembersTable, "rm1");
      const rm2 = aliasedTable(roomMembersTable, "rm2");

      let [room] = await trx
        .select({
          id: roomsTable.id,
        })
        .from(roomsTable)
        .innerJoin(rm1, eq(rm1.roomId, roomsTable.id))
        .innerJoin(rm2, eq(rm2.roomId, roomsTable.id))
        .where(
          and(
            eq(roomsTable.isGroup, false),
            eq(rm1.userId, currentUser.id),
            eq(rm2.userId, user.id),
          ),
        );

      if (!room) {
        [room] = await trx
          .insert(roomsTable)
          .values({
            name: user.username,
          })
          .returning({
            id: roomsTable.id,
          });

        await trx.insert(roomMembersTable).values([
          {
            roomId: room.id,
            userId: currentUser.id,
          },
          {
            roomId: room.id,
            userId: user.id,
          },
        ]);
      }

      return await trx.execute(
        sql`
          SELECT
            rooms.id,
            rooms.name,
            rooms.is_group AS "isGroup",
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', users.id,
                'username', users.username
              )
            ) AS members
          FROM
            rooms
          INNER JOIN
            room_members ON room_members.room_id = rooms.id
          INNER JOIN
            users ON users.id = room_members.user_id
          WHERE
            rooms.id = ${room.id}
          GROUP BY
            rooms.id, rooms.name, rooms.is_group;
        `,
      );
    });

    return res.status(HttpStatusCode.OK).json({
      message: "Berhasil membuat ruang chat.",
      data: room,
    });
  } catch (error) {
    const { responseBody, responseStatus } = errorHandler(error);

    return res.status(responseStatus).json(responseBody);
  }
}

// export async function createGroupRoom(req: Request, res: Response) {
//   try {
//     const result = z
//       .object({
//         name: z.string({
//           invalid_type_error: ValidationMessage.Type('name', 'string'),
//           required_error: ValidationMessage.Require('name'),
//         }),
//         userIds: z
//           .string({
//             invalid_type_error: ValidationMessage.Type('userIds', 'string'),
//             required_error: ValidationMessage.Require('userIds'),
//           })
//           .array(),
//       })
//       .safeParse(req.body);

//     if (!result.success) {
//       throw new InvalidDataError(
//         '"userId" harus diisi atau yang dimasukkan salah.',
//         result.error.format()
//       );
//     }

//     const {
//       data: { name: roomName, userIds },
//     } = result;

//     const users = await db
//       .select({
//         id: usersTable.id,
//       })
//       .from(usersTable)
//       .where(inArray(usersTable.id, userIds));

//     if (users.length !== userIds.length) {
//       throw new InvalidDataError('Terdapat pengguna yang tidak ditemukan.');
//     }

//     const currentUser = getAuthUser(req);

//     const [room] = await db.transaction(async (trx) => {
//       const [room] = await trx
//         .insert(roomsTable)
//         .values({
//           name: roomName,
//           isGroup: true,
//         })
//         .returning({
//           id: roomsTable.id,
//         });

//       await trx.insert(roomMembersTable).values([
//         {
//           roomId: room.id,
//           userId: currentUser.id,
//         },
//         ...userIds.map((id) => {
//           return {
//             roomId: room.id,
//             userId: id,
//           };
//         }),
//       ]);

//       return await trx.execute(
//         sql`
//           SELECT
//             rooms.id,
//             rooms.name,
//             rooms.is_group AS "isGroup",
//             JSON_AGG(
//               JSON_BUILD_OBJECT(
//                 'id', users.id,
//                 'username', users.username
//               )
//             ) AS members
//           FROM
//             rooms
//           INNER JOIN
//             room_members ON room_members.room_id = rooms.id
//           INNER JOIN
//             users ON users.id = room_members.user_id
//           WHERE
//             rooms.id = ${room.id}
//           GROUP BY
//             rooms.id, rooms.name, rooms.is_group;
//         `
//       );
//     });

//     return res.status(HttpStatusCode.OK).json({
//       message: 'Berhasil membuat ruang grup chat.',
//       data: room,
//     });
//   } catch (error) {
//     const { responseBody, responseStatus } = errorHandler(error);

//     return res.status(responseStatus).json(responseBody);
//   }
// }
