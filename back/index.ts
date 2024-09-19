import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import { authRouter, messageRouter, roomRouter, userRouter } from "./entities";
import { Server } from "socket.io";
import { authMiddleware } from "./middleware";
import type { Message } from "./types";
import { db, roomMembersTable, roomsTable } from "./db";
import { and, eq, not } from "drizzle-orm";

const { PORT } = Bun.env as {
  PORT: string;
};

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: "*",
    // credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/user", authMiddleware, userRouter);
app.use("/room", authMiddleware, roomRouter);
app.use("/message", authMiddleware, messageRouter);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send_message", async (message: Message & { roomId: number }) => {
    const [user] = await db
      .select({
        id: roomMembersTable.userId,
      })
      .from(roomMembersTable)
      .where(
        and(
          eq(roomMembersTable.roomId, message.roomId),
          not(eq(roomMembersTable.userId, message.senderId)),
        ),
      );

    socket.in(user.id).emit("receive_message", message);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port localhost:${PORT}`);
});
