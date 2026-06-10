import express from "express";
import { verifyCycle } from "../middleware/verifyOwner.js";
import { getRoomBills } from "../controllers/roomBillController.js";

// mergeParams allows access to :cycleId when mounted under /cycles/:cycleId/room-bills
const router = express.Router({ mergeParams: true });

// Verify cycle ownership before showing room bills
router.get("/", verifyCycle, getRoomBills);

export default router;
