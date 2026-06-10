import express from "express";
import {
    getNewReadingsForm,
    postSetupReadings,
    postReadings,
} from "../controllers/readingController.js";

// mergeParams allows access to :houseId / :cycleId when mounted under nested routes
const router = express.Router({ mergeParams: true });

// Routes under /houses/:houseId/readings  &  /houses/:houseId/cycles/:cycleId/readings
// houseId is already verified by verifyHouse in the parent route chain
router.get("/new", getNewReadingsForm);
router.post("/setup", postSetupReadings);
router.post("/", postReadings);

export default router;
