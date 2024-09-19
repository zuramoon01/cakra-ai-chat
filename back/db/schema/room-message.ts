import {
  foreignKey,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { roomsTable } from "./room";
import { usersTable } from "./user";

export const roomMessageTable = pgTable(
  "room_messages",
  {
    id: serial("id").primaryKey(),
    roomId: integer("room_id").notNull(),
    senderId: uuid("sender_id").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", {
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
        columns: [table.senderId],
        foreignColumns: [usersTable.id],
        name: "room_members_sender_id_fkey",
      }).onDelete("cascade"),
    };
  },
);
