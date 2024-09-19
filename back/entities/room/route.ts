import express from "express";
import {
  // createGroupRoom,
  createPrivateRoom,
  getRooms,
} from "./controller";

const roomRouter = express.Router();

roomRouter.route("/").get(getRooms).post(createPrivateRoom);
// roomRouter.post('/group', createGroupRoom);

export { roomRouter };
