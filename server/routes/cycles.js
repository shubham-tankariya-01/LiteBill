import express from "express";
import { verifyCycle } from "../middleware/verifyOwner.js";
import {
    getCycles,
    getCycle,
    updateCycle,
    deleteCycle,
} from "../controllers/cycleController.js";

// mergeParams allows access to :houseId when mounted under /houses/:houseId/cycles
const router = express.Router({ mergeParams: true });

// Route under /houses/:houseId/cycles  (houseId already verified by verifyHouse in houses route)
router.get("/", getCycles);

// Routes under /cycles/:cycleId — verify cycle ownership
router.get("/:cycleId", verifyCycle, getCycle);
router.put("/:cycleId", verifyCycle, updateCycle);
router.delete("/:cycleId", verifyCycle, deleteCycle);

export default router;
