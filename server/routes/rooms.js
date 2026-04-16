import express from "express";
const router = express.Router({ mergeParams: true });

// Note: Mounted as app.use("/houses/:houseId/rooms", roomsHouseRouter)
// and app.use("/rooms", roomsBaseRouter) in app.js

// -- Routes under /houses/:houseId/rooms --
router.get("/", (req, res) => {
    res.render("rooms/index", { houseId: req.params.houseId });
});

router.get("/new", (req, res) => {
    res.render("rooms/new", { houseId: req.params.houseId });
});

router.post("/", (req, res) => {
    res.redirect(`/houses/${req.params.houseId}/rooms`);
});

// -- Routes under /rooms --
router.get("/:roomId", (req, res) => {
    res.render("rooms/show", { roomId: req.params.roomId });
});

router.get("/:roomId/edit", (req, res) => {
    res.render("rooms/edit", { roomId: req.params.roomId });
});

router.put("/:roomId", (req, res) => {
    res.redirect(`/rooms/${req.params.roomId}`);
});

router.delete("/:roomId", (req, res) => {
    // Cannot redirect to house easily without DB, so just go home
    res.redirect("/dashboard");
});

router.get("/:roomId/analysis", (req, res) => {
    res.render("rooms/analysis", { roomId: req.params.roomId });
});

export default router;
