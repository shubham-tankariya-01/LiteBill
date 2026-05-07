import express from "express";
const router = express.Router({ mergeParams: true });
import RoomBill from "../models/RoomBill.js";
import MainBill from "../models/MainBill.js";
import BillingCycle from "../models/BillingCycle.js";

// Note: Mounted as app.use("/cycles/:cycleId/room-bills", router) in app.js

router.get("/", async (req, res, next) => {
    try {
        const { cycleId } = req.params;

        // 1. Fetch the billing cycle info
        const cycle = await BillingCycle.findById(cycleId).populate("house");
        if (!cycle) return res.status(404).send("Billing cycle not found");
        if (!cycle.house) return res.status(404).send("Associated house not found — it may have been deleted");
        
        // 2. Fetch the Main Bill for this cycle
        const mainBill = await MainBill.findOne({ billing_cycle_id: cycleId });

        // 3. Fetch all Room Bills and populate room details
        const roomBills = await RoomBill.find({ billing_cycle_id: cycleId }).populate("room_id");

        if (roomBills.length === 0 && cycle.endDate) {
            console.warn(`Warning: Closed cycle ${cycleId} has no room bills.`);
        }

        const roomBillsTotal = roomBills.reduce((s, b) => s + b.amount, 0);
        const billDifference = mainBill ? Math.abs(mainBill.total_amount - roomBillsTotal).toFixed(2) : null;

        res.render("room_bills/index", { 
            cycle, 
            mainBill, 
            hasBill: !!mainBill,
            roomBills,
            houseId: cycle.house._id,
            roomBillsTotal,
            billDifference
        });
    } catch (err) {
        next(err);
    }
});

export default router;

