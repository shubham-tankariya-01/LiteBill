import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index/landing");
});

import House from "../models/House.js";
import BillingCycle from "../models/BillingCycle.js";
import MainBill from "../models/MainBill.js";
import RoomReading from "../models/RoomReading.js";

router.get("/dashboard", async (req, res, next) => {
    try {
        const houses = await House.find({});
        const houseCount = houses.length;
        
        // Active cycles are cycles where endDate is null or not set
        const activeCyclesCount = await BillingCycle.countDocuments({ endDate: null });
        
        // Sum total amount from all MainBills
        const mainBills = await MainBill.find({});
        const totalRevenue = mainBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);

        // Fetch recent bills
        const recentBills = await MainBill.find({})
            .populate('billing_cycle_id')
            .populate('house_id')
            .sort({ bill_date: -1 })
            .limit(3);

        // Determine next step
        let nextStep = "complete";
        let actionHouseId = null;

        if (houseCount === 0) {
            nextStep = "add_house";
        } else {
            for (let h of houses) {
                if (!h.previous_billing_cycle) {
                    nextStep = "setup";
                    actionHouseId = h._id;
                    break;
                }
                if (h.active_billing_cycle) {
                    const cycleId = h.active_billing_cycle;
                    const mainBill = await MainBill.findOne({ billing_cycle_id: cycleId });
                    if (!mainBill) {
                        nextStep = "enter_bill";
                        actionHouseId = h._id;
                        break;
                    }
                    const roomReadingsCount = await RoomReading.countDocuments({ billing_cycle_id: cycleId });
                    if (roomReadingsCount === 0) {
                        nextStep = "enter_readings";
                        actionHouseId = h._id;
                        break;
                    }
                }
            }
        }

        res.render("index/dashboard", { 
            houseCount, 
            activeCyclesCount, 
            totalRevenue,
            recentBills,
            nextStep,
            actionHouseId
        });
    } catch (err) {
        next(err);
    }
});

export default router;
