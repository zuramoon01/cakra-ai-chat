import {
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { roomsTable } from "./room";
import { usersTable } from "./user";

export const roomMembersTable = pgTable(
  "room_members",
  {
    roomId: integer("room_id").notNull(),
    userId: uuid("user_id").notNull(),
    joinedAt: timestamp("joined_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      roomReference: foreignKey({
        columns: [table.roomId],
        foreignColumns: [roomsTable.id],
        name: "room_members_room_id_fkey",
      }).onDelete("cascade"),
      userReference: foreignKey({
        columns: [table.userId],
        foreignColumns: [usersTable.id],
        name: "room_members_user_id_fkey",
      }).onDelete("cascade"),
      primaryKey: primaryKey({
        name: "room_members_pkey",
        columns: [table.roomId, table.userId],
      }),
    };
  },
);
