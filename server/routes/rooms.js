import express from "express";
import { verifyRoom } from "../middleware/verifyOwner.js";
import {
    getRooms,
    getNewRoomForm,
    createRooms,
    getRoom,
    getEditRoomForm,
    updateRoom,
    deleteRoom,
    getRoomAnalysis,
} from "../controllers/roomController.js";

// mergeParams allows access to :houseId when mounted under /houses/:houseId/rooms
const router = express.Router({ mergeParams: true });

// Routes under /houses/:houseId/rooms  (houseId already verified by verifyHouse in houses route)
router.get("/", getRooms);
router.get("/new", getNewRoomForm);
router.post("/", createRooms);

// Routes under /rooms/:roomId — verify room ownership
router.get("/:roomId", verifyRoom, getRoom);
router.get("/:roomId/edit", verifyRoom, getEditRoomForm);
router.put("/:roomId", verifyRoom, updateRoom);
router.delete("/:roomId", verifyRoom, deleteRoom);
router.get("/:roomId/analysis", verifyRoom, getRoomAnalysis);

export default router;
