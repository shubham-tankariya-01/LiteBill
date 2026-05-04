import express from "express";
const router = express.Router({ mergeParams: true });
import Room from "../models/Room.js";
import House from "../models/House.js";
// Note: Mounted as app.use("/houses/:houseId/rooms", roomsHouseRouter)
// and app.use("/rooms", roomsBaseRouter) in app.js

// -- Routes under /houses/:houseId/rooms --
router.get("/", async (req, res) => {
    const rooms = await Room.find({ house_id: req.params.houseId }).populate("house_id");
    const house = await House.findById(req.params.houseId);
    res.render("rooms/index", { rooms, house });
});

router.get("/new", (req, res) => {
    res.render("rooms/new", { houseId: req.params.houseId });
});

router.post("/", async (req, res) => {
    try {
        const { meters } = req.body;
        if (meters && meters.length > 0) {
            const roomPromises = meters.map(meter => {
                return new Room({
                    house_id: req.params.houseId,
                    meter_name: meter
                }).save();
            });
            await Promise.all(roomPromises);
        }
        res.json({ message: "Success" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
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
