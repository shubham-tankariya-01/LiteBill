import express from "express";
const router = express.Router({ mergeParams: true });
import Room from "../models/Room.js";
import House from "../models/House.js";
import RoomBill from "../models/RoomBill.js";
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
router.get("/:roomId", async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).send("Room not found");
        
        const roomBills = await RoomBill.find({ room_id: room._id })
            .populate("billing_cycle_id")
            .sort({ createdAt: -1 });

        res.render("rooms/show", { room, roomId: room._id, roomBills });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/:roomId/edit", async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).send("Room not found");
        res.render("rooms/edit", { room });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.put("/:roomId", async (req, res) => {
    try {
        const { meter_name } = req.body;
        const room = await Room.findByIdAndUpdate(req.params.roomId, { meter_name }, { new: true });
        res.redirect(`/houses/${room.house_id}/rooms`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.delete("/:roomId", async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.roomId);
        res.redirect(`/houses/${room.house_id}/rooms`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/:roomId/analysis", async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) return res.status(404).send("Room not found");
        
        const roomBills = await RoomBill.find({ room_id: room._id })
            .populate("billing_cycle_id")
            .sort({ createdAt: 1 }); // Sort chronologically for charts

        res.render("rooms/analysis", { room, roomId: req.params.roomId, roomBills });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

export default router;
