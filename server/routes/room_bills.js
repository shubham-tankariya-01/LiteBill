import express from "express";
const router = express.Router({ mergeParams: true });

// Note: Mounted as app.use("/cycles/:cycleId/room-bills", cycleRoomBillsRouter) in app.js

router.get("/", (req, res) => {
    res.render("room_bills/index", { cycleId: req.params.cycleId });
});

export default router;
