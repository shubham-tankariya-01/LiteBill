import express from "express";
const router = express.Router({ mergeParams: true });
import BillingCycle from "../models/BillingCycle.js";

import MainBill from "../models/MainBill.js";
import RoomBill from "../models/RoomBill.js";
import House from "../models/House.js";

// Note: Mounted as app.use("/houses/:houseId/cycles", houseCyclesRouter)
// and app.use("/cycles", baseCyclesRouter) in app.js

router.get("/", async (req, res) => {
    try {
        const { houseId } = req.params;
        const house = await House.findById(houseId);
        const cycles = await BillingCycle.find({ house: houseId }).sort({ createdAt: -1 });

        const cycleResults = {};
        for (let cycle of cycles) {
            const mainBill = await MainBill.findOne({ billing_cycle_id: cycle._id });
            const roomBills = await RoomBill.find({ billing_cycle_id: cycle._id });
            
            let totalRoomAmount = 0;
            roomBills.forEach(rb => totalRoomAmount += rb.amount);
            
            cycleResults[cycle._id] = {
                mainBill: mainBill || null,
                roomBillsCount: roomBills.length,
                totalRoomAmount: totalRoomAmount
            };
        }

        res.render("cycles/index", { houseId, house, cycles, cycleResults });
    } catch (err) {
        console.error("Error fetching cycles:", err);
        res.status(500).send("Server Error");
    }
});

// -- Routes under /cycles --
router.get("/:cycleId", (req, res) => {
    res.render("cycles/show", { cycleId: req.params.cycleId });
});

router.put("/:cycleId", async (req, res) => {
    try {
        const { endDate } = req.body;
        const cycle = await BillingCycle.findByIdAndUpdate(req.params.cycleId, { endDate }, { new: true });
        res.redirect(`/cycles/${req.params.cycleId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.delete("/:cycleId", async (req, res) => {
    try {
        const cycle = await BillingCycle.findByIdAndDelete(req.params.cycleId);
        // Note: consider deleting associated MainBills and RoomBills
        if (cycle && cycle.house) {
            res.redirect(`/houses/${cycle.house}/history`);
        } else {
            res.redirect("/houses");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

export default router;
