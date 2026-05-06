import express from "express";
const router = express.Router();
import House from "../models/House.js";
import Room from "../models/Room.js"
import MainBill from "../models/MainBill.js";
import RoomBill from "../models/RoomBill.js";
import BillingCycle from "../models/BillingCycle.js";




router.get("/", async (req, res) => {
    const houses = await House.find();
    console.log(houses);
    res.render("houses/index", { houses });
});

router.get("/new", (req, res) => {
    res.render("houses/new");
});

router.post("/", async (req, res) => {
    try {
        const { house_name, meters } = req.body;
        if (!house_name) {
            return res.status(400).send("House name required");
        }
        const newHouse = new House({ house_name });
        await newHouse.save();
        if (meters && meters.length > 0) {
            const roomPromises = meters.map(meter => {
                return new Room({
                    house_id: newHouse._id,
                    meter_name: meter
                }).save();
            });
            await Promise.all(roomPromises);
        }
        res.redirect("/houses");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


router.get("/:houseId", async (req, res) => {
    const house = await House.findById(req.params.houseId);
    const rooms = await Room.find({ house_id: req.params.houseId });
    res.render("houses/show", { house, rooms });
});

router.get("/:houseId/edit", async (req, res) => {
    try {
        const house = await House.findById(req.params.houseId);
        if (!house) return res.status(404).send("House not found");
        res.render("houses/edit", { house });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.put("/:houseId", async (req, res) => {
    try {
        const { house_name } = req.body;
        await House.findByIdAndUpdate(req.params.houseId, { house_name });
        res.redirect(`/houses/${req.params.houseId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.delete("/:houseId", async (req, res) => {
    try {
        const { houseId } = req.params;

        // 1. Find all cycles for this house
        const cycles = await BillingCycle.find({ house: houseId });
        const cycleIds = cycles.map(c => c._id);

        // 2. Cascade delete RoomBills attached to these cycles
        if (cycleIds.length > 0) {
            await RoomBill.deleteMany({ billing_cycle_id: { $in: cycleIds } });
        }

        // 3. Cascade delete MainBills and BillingCycles for this house
        await MainBill.deleteMany({ house_id: houseId });
        await BillingCycle.deleteMany({ house: houseId });

        // 4. Cascade delete all Rooms for this house
        await Room.deleteMany({ house_id: houseId });

        // 5. Finally, delete the House itself
        await House.findByIdAndDelete(houseId);

        res.redirect("/houses");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/:houseId/history", async (req, res) => {
    try {
        const { houseId } = req.params;
        const house = await House.findById(houseId);
        if (!house) return res.status(404).send("House not found");

        const cycles = await BillingCycle.find({ house: houseId }).sort({ createdAt: -1 });
        const cycleIds = cycles.map(c => c._id);

        const mainBills = await MainBill.find({ house_id: houseId, billing_cycle_id: { $in: cycleIds } })
            .populate('billing_cycle_id')
            .sort({ bill_date: -1 });

        const roomBills = await RoomBill.find({ billing_cycle_id: { $in: cycleIds } })
            .populate('room_id')
            .populate('billing_cycle_id')
            .sort({ createdAt: -1 });

        // Group room bills by cycle
        const roomBillsByCycle = {};
        roomBills.forEach(bill => {
            const cycleId = bill.billing_cycle_id._id.toString();
            if (!roomBillsByCycle[cycleId]) {
                roomBillsByCycle[cycleId] = [];
            }
            roomBillsByCycle[cycleId].push(bill);
        });

        res.render("houses/history", {
            house,
            mainBills,
            roomBillsByCycle,
            cycles
        });
    } catch (err) {
        console.error("Error fetching history:", err);
        res.status(500).send("Server Error");
    }
});

export default router;
