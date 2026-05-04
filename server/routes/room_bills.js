import express from "express";
const router = express.Router({ mergeParams: true });
import RoomBill from "../models/RoomBill.js";
import MainBill from "../models/MainBill.js";
import BillingCycle from "../models/BillingCycle.js";

// Note: Mounted as app.use("/cycles/:cycleId/room-bills", router) in app.js

router.get("/", async (req, res) => {
    try {
        const { cycleId } = req.params;

        // 1. Fetch the billing cycle info
        const cycle = await BillingCycle.findById(cycleId).populate("house");
        
        // 2. Fetch the Main Bill for this cycle
        const mainBill = await MainBill.findOne({ billing_cycle_id: cycleId });

        // 3. Fetch all Room Bills and populate room details
        const roomBills = await RoomBill.find({ billing_cycle_id: cycleId }).populate("room_id");

        res.render("room_bills/index", { 
            cycle, 
            mainBill, 
            roomBills,
            houseId: cycle?.house?._id 
        });
    } catch (err) {
        console.error("Error fetching room bills:", err);
        res.status(500).send("Failed to load bill summary");
    }
});

export default router;

