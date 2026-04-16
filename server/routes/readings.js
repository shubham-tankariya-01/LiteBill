import express from "express";
const router = express.Router({ mergeParams: true });

// Note: Mounted as app.use("/houses/:houseId/readings", houseReadingsRouter) in app.js

router.get("/new", (req, res) => {
    // In real app, fetch rooms for this house
    res.render("readings/new", { houseId: req.params.houseId });
});

router.post("/", (req, res) => {
    // Controller logic to auto-create cycle and add readings
    res.redirect(`/houses/${req.params.houseId}/cycles`);
});

export default router;