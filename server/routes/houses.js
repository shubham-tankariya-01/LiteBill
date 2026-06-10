import express from "express";
import { verifyHouse } from "../middleware/verifyOwner.js";
import {
    getHouses,
    getNewHouseForm,
    createHouse,
    getHouse,
    getEditHouseForm,
    updateHouse,
    deleteHouse,
    getHouseHistory,
} from "../controllers/houseController.js";

const router = express.Router();

// Collection routes
router.get("/", getHouses);
router.get("/new", getNewHouseForm);
router.post("/", createHouse);

// Single-house routes — verify ownership first
router.get("/:houseId", verifyHouse, getHouse);
router.get("/:houseId/edit", verifyHouse, getEditHouseForm);
router.put("/:houseId", verifyHouse, updateHouse);
router.delete("/:houseId", verifyHouse, deleteHouse);
router.get("/:houseId/history", verifyHouse, getHouseHistory);

export default router;
